function transferirDatosOH() {
  try {
var nombreArchivoOrigen = "OH.xlsx";
    var hojaOrigenNombre = "Sheet1";
    var idDestino = "1xR3m2GevMLon5ADYjqMQ5C0HriSHo6XPtYg4jDR6l6U";
    var hojaDestinoNombre = "Base";

    var columnasDeseadasOriginal = ["Artículo", "Texto breve de artículo", "Libre utiliz.", "Grupo art."];

    function normalizar(texto) {
      return texto
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\s.]/g, "");
    }

    var columnasDeseadas = columnasDeseadasOriginal.map(normalizar);

    var archivos = DriveApp.getFilesByName(nombreArchivoOrigen);
    if (!archivos.hasNext()) {
      Logger.log("⚠ No se encontró el archivo origen: " + nombreArchivoOrigen);
      return;
    }

    var archivoOrigen = archivos.next();
    var fileId = archivoOrigen.getId();
    var file = Drive.Files.copy({ mimeType: MimeType.GOOGLE_SHEETS }, fileId);
    var libroOrigen = SpreadsheetApp.openById(file.id);
    var hojaOrigen = libroOrigen.getSheetByName(hojaOrigenNombre);
    if (!hojaOrigen) {
      Logger.log("⚠ No se encontró la hoja en el archivo origen.");
      return;
    }

    var datos = hojaOrigen.getDataRange().getValues();
    if (datos.length < 2) {
      Logger.log("⚠ No hay datos suficientes.");
      return;
    }

    var encabezados = datos[0];
    var indices = [];

    columnasDeseadas.forEach(function(nombreCol, idx) {
      var encontrado = false;
      for (var i = 0; i < encabezados.length; i++) {
        if (normalizar(encabezados[i]).includes(nombreCol)) {
          indices.push(i);
          encontrado = true;
          break;
        }
      }
      if (!encontrado) throw new Error("❌ No se encontró la columna: " + columnasDeseadasOriginal[idx]);
    });

    var datosFiltrados = datos.slice(1).map(fila => indices.map(i => fila[i]));

    var libroDestino = SpreadsheetApp.openById(idDestino);
    var hojaDestino = libroDestino.getSheetByName(hojaDestinoNombre);
    if (!hojaDestino) {
      Logger.log("⚠ No se encontró la hoja destino.");
      return;
    }

    // Borrar el contenido de las columnas B a K a partir de la fila 4
    var numFilasDestino = hojaDestino.getLastRow();
    if (numFilasDestino >= 4) {
      hojaDestino.getRange(4, 2, numFilasDestino - 3, 10).clearContent(); // B a K
    }

    hojaDestino.getRange(3, 2, 1, columnasDeseadasOriginal.length).setValues([columnasDeseadasOriginal]);
    hojaDestino.getRange(4, 2, datosFiltrados.length, columnasDeseadasOriginal.length).setValues(datosFiltrados);

    var ahora = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm");
    hojaDestino.getRange("B1").setValue("🕒 Actualizado: " + ahora);
    
    // Mensaje de transferencia completada
    hojaDestino.getRange("D1").setValue("✅ Transferencia completada");

    // Agregar las fórmulas a las columnas F, G, H, I, J, K
    var numFilas = datosFiltrados.length;
    
    // Fórmulas en columna F a partir de fila 4
    hojaDestino.getRange(4, 6, numFilas, 1).setFormula("=LEFT(E4;3)");
    
    // Fórmulas en columna G a partir de fila 4
    hojaDestino.getRange(4, 7, numFilas, 1).setFormula("=IFERROR(VLOOKUP(VALUE(LEFT(E4;3)); 'Sección'!A:B; 2; 0);\"\")");
    
    // Fórmulas en columna H a partir de fila 4
    hojaDestino.getRange(4, 8, numFilas, 1).setFormula("=J4-K4+D4");
    
    // Fórmulas en columna I a partir de fila 4
    hojaDestino.getRange(4, 9, numFilas, 1).setFormula("=IFERROR(VLOOKUP(B:B;Claves!A:B;2;0);\"\")");
    
    // Fórmulas en columna J a partir de fila 4
    hojaDestino.getRange(4, 10, numFilas, 1).setFormula("=SUMIF('Entrada Sku'!A:A;B:B;'Entrada Sku'!C:C)");
    
    // Fórmulas en columna K a partir de fila 4
    hojaDestino.getRange(4, 11, numFilas, 1).setFormula("=SUMIF('Salida Sku'!A:A;B:B;'Salida Sku'!C:C)");

    Logger.log("✅ Transferencia completada. Se copiaron " + datosFiltrados.length + " filas.");

    DriveApp.getFileById(file.id).setTrashed(true);

  } catch (e) {
    Logger.log("❌ Error: " + e.message);
  }
}