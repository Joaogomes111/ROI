const SHEET_NAME = "Leads";

const HEADERS = [
  "Recebido em",
  "Nome",
  "Empresa",
  "Email",
  "WhatsApp",
  "CNPJ",
  "Cargo",
  "Resultado %",
  "Score bruto",
  "Score maximo",
  "Faixa",
  "Fatores",
  "Respostas",
  "Respostas JSON",
  "URL da pagina",
  "Referrer",
  "UTM source",
  "UTM medium",
  "UTM campaign",
  "UTM content",
  "UTM term",
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const payload = JSON.parse((e.postData && e.postData.contents) || "{}");
    const sheet = getLeadSheet_();
    const lead = payload.lead || {};
    const diagnostic = payload.diagnostic || {};
    const tracking = payload.tracking || {};
    const answers = payload.answers || [];

    sheet.appendRow([
      new Date(),
      lead.nome || "",
      lead.empresa || "",
      lead.email || "",
      lead.whatsapp || "",
      lead.cnpj || "",
      lead.cargo || "",
      diagnostic.percentage || "",
      diagnostic.raw_score || "",
      diagnostic.max_score || "",
      diagnostic.band || "",
      Array.isArray(diagnostic.factors) ? diagnostic.factors.join("\n") : "",
      Array.isArray(answers)
        ? answers.map(function (answer) {
            return answer.id + " - " + answer.question + ": " + answer.answer;
          }).join("\n\n")
        : "",
      JSON.stringify(answers),
      tracking.page_url || "",
      tracking.referrer || "",
      tracking.utm_source || "",
      tracking.utm_medium || "",
      tracking.utm_campaign || "",
      tracking.utm_content || "",
      tracking.utm_term || "",
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

  const firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const hasHeaders = firstRow.some(function (value) {
    return value !== "";
  });

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, HEADERS.length);
  }

  return sheet;
}

function json_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
