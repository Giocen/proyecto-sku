function depurarRegistros() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaName = "Claves";  // Única hoja a procesar
  var baseSheet = ss.getSheetByName("Base");

  // Obtener los artículos en la hoja Base (columna B desde la fila 3)
  var baseData = baseSheet.getRange(3, 2, baseSheet.getLastRow() - 2, 1).getValues();

  // Convertir los valores de la hoja Base en un set para búsqueda rápida
  var baseSkuSet = new Set(baseData.map(function(row) { return row[0]; }));

  // Procesar la hoja Claves
  var hoja = ss.getSheetByName(hojaName);

  // Verificar si hay datos desde la fila 3 en adelante
  var lastRow = hoja.getLastRow();
  if (lastRow < 3) return;  // Si no hay suficientes filas, salir

  // Obtener los SKUs en la hoja Claves (columna A desde la fila 3)
  var skuData = hoja.getRange(3, 1, lastRow - 2, 1).getValues();

  // Crear un array para las filas a eliminar
  var rowsToDelete = [];

  // Recorrer la columna de SKUs en la hoja Claves y eliminar los que no se encuentren en la Base
  for (var i = 0; i < skuData.length; i++) {
    var sku = skuData[i][0];
    if (!baseSkuSet.has(sku)) {
      rowsToDelete.push(i + 3);  // Almacenar las filas a eliminar (empezando desde la fila 3)
    }
  }

  // Borrar filas de manera eficiente desde abajo hacia arriba
  for (var j = rowsToDelete.length - 1; j >= 0; j--) {
    hoja.deleteRow(rowsToDelete[j]);
  }

  // Limpiar datos en Entrada Sku y Salida Sku
  var hojasEliminar = ["Entrada Sku", "Salida Sku"];
  hojasEliminar.forEach(function(nombreHoja) {
    var hojaEliminar = ss.getSheetByName(nombreHoja);
    if (hojaEliminar) {
      var lastRow = hojaEliminar.getLastRow();
      var lastColumn = hojaEliminar.getLastColumn();

      if (lastRow >= 3 && lastColumn >= 4) {
        var numFilas = lastRow - 2;
        hojaEliminar.getRange(3, 1, numFilas, 4).clearContent();
      }
    }
  });

  // Registrar la hora de actualización en una celda específica con icono
  var fechaHora = new Date();
  var horaActualizacion = "⏰ Última actu depu de datos: " + Utilities.formatDate(fechaHora, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

  // Establecer el valor en la celda D1 de Claves
  hoja.getRange("D1").setValue(horaActualizacion);
}