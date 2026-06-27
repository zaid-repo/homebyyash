# Connect the inquiry form to Google Sheets

1. Open the client's Google Sheet and choose **Extensions > Apps Script**.
2. Replace the editor contents with `Code.gs` from this folder.
3. Add the client's Gmail address to `NOTIFICATION_EMAIL` if email alerts are wanted.
4. Choose **Deploy > New deployment > Web app**.
5. Set **Execute as** to yourself and **Who has access** to anyone.
6. Authorize the script and copy the Web App URL ending in `/exec`.
7. Paste that URL into `googleScriptUrl` in the website's `config.js`.
8. Submit one test inquiry and confirm that a `Website Leads` tab is created.

Do not paste Gmail passwords or Google account credentials into the website.
