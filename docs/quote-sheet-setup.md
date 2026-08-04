# Quote form → Google Sheet setup

The `/quote` form posts to `/api/quote`, which delivers to two places: an email
via Resend, and a Google Sheet via the Apps Script below. Either can fail
without losing the lead; only a total failure returns an error to the visitor.

## 1. Create the sheet

New Google Sheet, name it whatever you like. Add a header row:

```
Received | Name | Company | Email | Phone | Prefers | Service | Budget | Timeline | Language | Chat | Details
```

## 2. Add the script

**Extensions → Apps Script**, replace everything with this, and set `SECRET` to
a long random string of your choosing:

```js
const SECRET = 'CHANGE-ME-to-a-long-random-string'

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents)
    if (SECRET && body.secret !== SECRET) {
      return ContentService.createTextOutput('forbidden')
    }
    SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().appendRow([
      body.receivedAt || new Date().toISOString(),
      body.name || '',
      body.company || '',
      body.email || '',
      body.phone || '',
      body.preferredContact || '',
      body.service || '',
      body.budget || '',
      body.timeline || '',
      body.language || '',
      body.conversationId || '',
      body.details || '',
    ])
    return ContentService.createTextOutput('ok')
  } catch (err) {
    return ContentService.createTextOutput('error: ' + err)
  }
}
```

## 3. Deploy it

**Deploy → New deployment → Web app**

- Execute as: **Me**
- Who has access: **Anyone**

"Anyone" is required because our server calls it without a Google login. The
`SECRET` check is what actually protects it, so do not leave it blank.

Copy the deployment URL — it looks like
`https://script.google.com/macros/s/AKfy…/exec`.

## 4. Set the environment variables

Locally in `.env.local`, and in Vercel for Production and Preview:

| Variable | Value |
|---|---|
| `QUOTE_SHEET_WEBHOOK_URL` | the `/exec` URL from step 3 |
| `QUOTE_SHEET_WEBHOOK_SECRET` | the same string you put in `SECRET` |
| `QUOTE_NOTIFY_EMAIL` | where quote emails should land (optional — falls back to the company contact email) |

```bash
vercel env add QUOTE_SHEET_WEBHOOK_URL production
vercel env add QUOTE_SHEET_WEBHOOK_SECRET production
```

Environment variables only take effect on a new build, so redeploy afterwards.

## 5. Check it

```bash
curl -X POST http://localhost:3000/api/quote \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","email":"test@example.com","details":"Checking the pipe","service":"apps"}'
```

Expect `{"ok":true,"delivered":{"email":true,"sheet":true}}`. A `false` means
that destination is not configured yet — the route still succeeds as long as one
of them worked.

## Re-deploying the script

Editing the script is not enough: **Deploy → Manage deployments → edit → Version:
New version**. Otherwise the old code keeps serving.
