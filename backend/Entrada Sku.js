function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("Gestión de SKU")
    .addItem("Abrir formulario de entrada", "mostrarFormularioEntrada")
    .addItem("Abrir formulario de salida", "mostrarFormularioSalida")
    .addItem("Abrir consulta de SKU", "mostrarFormularioConsulta")
    .addItem("Transferir datos OH", "transferirDatosOH")
    .addToUi();
}

function mostrarFormulario(nombreFormulario, titulo, ancho, alto) {
  var html = HtmlService.createHtmlOutput(HtmlService.createHtmlOutputFromFile(nombreFormulario).getContent())
    .setWidth(ancho)
    .setHeight(alto);

  SpreadsheetApp.getUi().showModalDialog(html, titulo);
}

function mostrarFormularioEntrada() {
  mostrarFormulario("FormularioEntrada", "Liverpool Mérida", 300, 350);
}

function mostrarFormularioSalida() {
  mostrarFormulario("FormularioSalida", "Liverpool Mérida", 300, 350);
}

function mostrarFormularioConsulta() {
  mostrarFormulario("FormularioConsulta", "Liverpool Mérida", 300, 300);
}


function registrarMovimiento(tipo, sku, ubicacion, cantidad) {
  var hojaNombre = tipo === "entrada" ? "Entrada Sku" : "Salida Sku";
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(hojaNombre);
  if (!hoja) return;

  // Validar que la cantidad sea un número positivo
  cantidad = Number(cantidad);
  if (isNaN(cantidad) || cantidad <= 0) {
    throw new Error("La cantidad debe ser un número positivo.");
  }

  var fechaHora = new Date();
  var fechaHoraFormateada = Utilities.formatDate(fechaHora, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

  var cantidadFinal = tipo === "salida" ? +cantidad : cantidad;

  hoja.appendRow([sku, ubicacion, cantidadFinal, fechaHoraFormateada]);
}

function registrarEntrada(sku, ubicacion, cantidad) {
  registrarMovimiento("entrada", sku, ubicacion, cantidad);
}

function registrarSalida(sku, ubicacion, cantidad) {
  registrarMovimiento("salida", sku, ubicacion, cantidad);
}

function consultarSku(sku) {
  var cache = CacheService.getScriptCache();
  var cachedResult = cache.get(sku);

  if (cachedResult) {
    return JSON.parse(cachedResult);
  }

  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Base");
  if (!hoja) return null;

  var datos = hoja.getRange(2, 2, hoja.getLastRow() - 1, 8).getValues();
  var resultado = {
    descripcion: '',
    numero: '',
    seccion: '',
    cantidad: 0,
    ubicacion: ''
  };

  for (var i = 0; i < datos.length; i++) {
    if (datos[i][0] && datos[i][0].toString().trim() === sku.trim()) {
      if (!resultado.descripcion) resultado.descripcion = datos[i][1];
      if (!resultado.numero) resultado.numero = datos[i][4];
      if (!resultado.seccion) resultado.seccion = datos[i][5];
      if (!resultado.cantidad) resultado.cantidad = datos[i][6];

      var ubicacion = datos[i][7];
      Logger.log("Ubicación encontrada: " + ubicacion);

      if (ubicacion) {
        resultado.ubicacion = ubicacion.split(';').map(function(item) {
          return item.trim();
        }).join('\n');
      } else {
        resultado.ubicacion = '';
      }
    }
  }

  if (resultado.descripcion) {
    cache.put(sku, JSON.stringify(resultado), 1500);
    return resultado;
  } else {
    return null;
  }
}

function doGet(e) {
  var page = e && e.parameter && e.parameter.page ? e.parameter.page : null;
  var paginas = {
    "entrada": "FormularioEntrada",
    "salida": "FormularioSalida",
    "consulta": "FormularioConsulta"
  };

  if (paginas[page]) {
    return HtmlService.createHtmlOutputFromFile(paginas[page]);
  } else {
    return HtmlService.createHtmlOutput("<h3>Página no encontrada</h3><p>Verifica la URL ingresada.</p>");
  }
}

function transferirDatosOH() {
  try {
    var nombreArchivoOrigen = "OH.xlsx";
    var hojaOrigenNombre = "Sheet1";
    var idDestino = "1xR3m2GevMLon5ADYjqMQ5C0HriSHo6XPtYg4jDR6l6U";
    var hojaDestinoNombre = "Base";

    var archivos = DriveApp.getFilesByName(nombreArchivoOrigen);
    if (!archivos.hasNext()) {
      Logger.log("⚠ No se encontró el archivo origen: " + nombreArchivoOrigen);
      return;
    }

    var archivoOrigen = archivos.next();

    var fileId = archivoOrigen.getId();
    var file = Drive.Files.copy({mimeType: MimeType.GOOGLE_SHEETS}, fileId);
    var libroOrigen = SpreadsheetApp.openById(file.id);

    var hojaOrigen = libroOrigen.getSheetByName(hojaOrigenNombre);
    if (!hojaOrigen) {
      Logger.log("⚠ No se encontró la hoja en el archivo origen: " + hojaOrigenNombre);
      return;
    }

    var data = hojaOrigen.getDataRange().getValues();
    if (data.length == 0 || data[0].length == 0) {
      Logger.log("⚠ No hay datos en la hoja de origen.");
      return;
    }

    var libroDestino = SpreadsheetApp.openById(idDestino);
    var hojaDestino = libroDestino.getSheetByName(hojaDestinoNombre);

    if (!hojaDestino) {
      Logger.log("⚠ No se encontró la hoja en el archivo destino: " + hojaDestinoNombre);
      return;
    }

    hojaDestino.getRange(4, 2, hojaDestino.getMaxRows() - 3, 4).clearContent();

    var numRows = data.length;
    var numCols = data[0].length;
    hojaDestino.getRange(3, 2, numRows, numCols).setValues(data);

    hojaDestino.getRange(1, 2).setValue("✅ Transferencia completada con éxito.");

    Logger.log("✅ Transferencia completada con éxito. Datos pegados en B1.");
  } catch (e) {
    Logger.log("❌ Error: " + e.message);
  }
}
