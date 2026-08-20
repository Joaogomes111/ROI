const SHEET_NAME = "Leads";

const HEADERS = [
  "Data de conversao",
  "Nome",
  "Empresa",
  "Email",
  "WhatsApp",
  "CNPJ",
  "Cargo",
  "Resultado %",
  "Faixa do diagnostico",
  "Origem",
];

function setupSheet() {
  getLeadSheet_();
  return json_({ ok: true, message: "Lead sheet is ready for RD import." });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const payload = JSON.parse((e.postData && e.postData.contents) || "{}");
    const sheet = getLeadSheet_();
    const lead = payload.lead || {};
    const diagnostic = payload.diagnostic || {};

    sheet.appendRow([
      payload.created_at ? new Date(payload.created_at) : new Date(),
      lead.nome || "",
      lead.empresa || "",
      lead.email || "",
      lead.whatsapp || "",
      lead.cnpj || "",
      lead.cargo || "",
      diagnostic.percentage === 0 ? 0 : diagnostic.percentage || "",
      diagnostic.band || "",
      "Diagnostico Simples Nacional Hibrido",
    ]);

    return json_({ ok: true });
  } catch (error) {
    return json_({ ok: false, error: String(error) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json_({ ok: true, message: "ROI diagnostic webhook is online." });
}

function getLeadSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getMaxColumns() < HEADERS.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), HEADERS.length - sheet.getMaxColumns());
  }

  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.setFrozenRows(1);

  if (sheet.getMaxColumns() > HEADERS.length) {
    sheet.deleteColumns(HEADERS.length + 1, sheet.getMaxColumns() - HEADERS.length);
  }

  sheet.autoResizeColumns(1, HEADERS.length);

  return sheet;
}

function json_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
