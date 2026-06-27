const SHEET_NAME = "Website Leads";
const NOTIFICATION_EMAIL = "homebyyash@gmail.com";
const SPREADSHEET_ID = "1IWGKgzTuRguwW5V-HupOk1MV8C6KcA3lJRFbHMBgtso";

function doPost(event) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const payload = JSON.parse(event.postData.contents);
    if (payload.website) return jsonResponse({ success: true });

    const required = ["firstName", "lastName", "email", "interest"];
    const missing = required.some((field) => !String(payload[field] || "").trim());
    if (missing) return jsonResponse({ success: false, message: "Missing required fields." });

    const spreadsheet = getLeadsSpreadsheet();
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      sheet.appendRow(["Timestamp", "First Name", "Last Name", "Email", "Phone", "Interest", "Message", "Source"]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#0d3b2d").setFontColor("#ffffff");
    }

    sheet.appendRow([
      new Date(), clean(payload.firstName), clean(payload.lastName), clean(payload.email),
      clean(payload.phone), clean(payload.interest), clean(payload.message), clean(payload.source)
    ]);

    if (NOTIFICATION_EMAIL) {
      MailApp.sendEmail({
        to: NOTIFICATION_EMAIL,
        subject: `New website inquiry from ${clean(payload.firstName)} ${clean(payload.lastName)}`,
        htmlBody: `<p><strong>Interest:</strong> ${escapeHtml(payload.interest)}</p><p><strong>Email:</strong> ${escapeHtml(payload.email)}</p><p><strong>Phone:</strong> ${escapeHtml(payload.phone || "Not provided")}</p><p><strong>Message:</strong><br>${escapeHtml(payload.message || "No message")}</p>`
      });
    }

    return jsonResponse({ success: true, spreadsheetUrl: spreadsheet.getUrl(), sheetName: SHEET_NAME });
  } catch (error) {
    return jsonResponse({ success: false, message: error.message });
  } finally {
    lock.releaseLock();
  }
}

function getLeadsSpreadsheet() {
  if (SPREADSHEET_ID) return SpreadsheetApp.openById(SPREADSHEET_ID);

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error("No active spreadsheet found. Paste your Google Sheet ID into SPREADSHEET_ID.");
  }

  return spreadsheet;
}

function clean(value) {
  const text = String(value || "").trim();
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  }[character]));
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
