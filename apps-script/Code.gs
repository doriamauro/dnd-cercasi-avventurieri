const SHEET_NAME = 'Prenotazioni';

function doGet() {
  const sheet = getSheet_();
  const values = sheet.getRange(2, 1, 5, 2).getValues();

  const result = values.map(([personaggio, giocatore]) => ({
    personaggio,
    giocatore
  }));

  return json_(result);
}

function doPost(e) {
  const personaggio = String(e.parameter.personaggio || '').trim();
  const giocatore = String(e.parameter.giocatore || '').trim();

  if (!personaggio || !giocatore) {
    return json_({ success: false, message: 'Dati mancanti.' });
  }

  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(5000);

    const sheet = getSheet_();
    const values = sheet.getRange(2, 1, 5, 2).getValues();
    const rowIndex = values.findIndex(([name]) =>
      String(name).toLowerCase() === personaggio.toLowerCase()
    );

    if (rowIndex === -1) {
      return json_({ success: false, message: 'Personaggio non valido.' });
    }

    const currentPlayer = String(values[rowIndex][1] || '').trim();
    if (currentPlayer) {
      return json_({
        success: false,
        message: 'Peccato, questo personaggio è appena stato prenotato da un altro giocatore.'
      });
    }

    sheet.getRange(rowIndex + 2, 2).setValue(giocatore);

    return json_({
      success: true,
      personaggio,
      giocatore
    });
  } catch (error) {
    return json_({ success: false, message: 'Errore temporaneo. Riprova.' });
  } finally {
    lock.releaseLock();
  }
}

function getSheet_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('Foglio "' + SHEET_NAME + '" non trovato.');
  }
  return sheet;
}

function json_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
