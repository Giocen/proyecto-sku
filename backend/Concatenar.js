function agruparSinDuplicadosDesdeEntradaSku() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const hojaOrigen = ss.getSheetByName("Entrada Sku");
  const hojaDestino = ss.getSheetByName("Claves");

  if (!hojaOrigen || !hojaDestino) {
    SpreadsheetApp.getUi().alert("Una de las hojas no existe. Verifica los nombres.");
    return;
  }

  const ultimaFila = hojaOrigen.getLastRow();
  if (ultimaFila < 3) {
    SpreadsheetApp.getUi().alert("No hay datos en la hoja 'Entrada Sku'.");
    return;
  }

  const datos = hojaOrigen.getRange("A3:B" + ultimaFila).getValues(); // Datos desde la fila 3

  const mapa = {};
  const combinacionesVistas = new Set();

  datos.forEach(([sku, ubicacion]) => {
    const claveCombo = `${sku}__${ubicacion}`;
    if (sku && ubicacion && !combinacionesVistas.has(claveCombo)) {
      combinacionesVistas.add(claveCombo);
      if (!mapa[sku]) {
        mapa[sku] = new Set();
      }
      mapa[sku].add(ubicacion);
    }
  });

  // 🔐 Limpiar hoja de destino desde la fila 3 hacia abajo
  const ultimaFilaDestino = hojaDestino.getLastRow();
  if (ultimaFilaDestino >= 3) {
    hojaDestino.getRange("A3:B" + ultimaFilaDestino).clearContent();
  }

  // ✍️ Escribir resultados a partir de la fila 3
  let fila = 3;
  for (const sku in mapa) {
    hojaDestino.getRange("A" + fila).setValue(sku);
    hojaDestino.getRange("B" + fila).setValue(Array.from(mapa[sku]).join("; "));
    fila++;
  }

  SpreadsheetApp.flush();

  // Agregar timestamp en celda D2
const ahora = new Date();
const formato = Utilities.formatDate(ahora, ss.getSpreadsheetTimeZone(), "dd/MM/yyyy HH:mm:ss");
hojaDestino.getRange("B1").setValue("⏰ Ultima Actu unificación de Ubicación: " + formato);
}