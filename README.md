# Road to Mil — Trading Dashboard (Netlify edition)

WHAT'S IN THIS FOLDER
```
index.html                 the dashboard (Netlify serves this)
netlify.toml                Netlify build/function config
package.json                declares the @netlify/blobs dependency
netlify/functions/data.mjs  the cloud storage API (Netlify Function)
README.md                   this file
```

WHAT CHANGED FROM THE OLD VERSION
The old version auto-saved to a local `.xlsx` file next to `index.html`,
using a browser API that only works with actual local files. That doesn't
make sense once this is hosted on the web, so it's been replaced:

- All tracker data (actuals, start date, logo, display name) now
  auto-saves to **Netlify Blobs** — a small cloud key/value store that
  Netlify provisions automatically for every site, via a serverless
  function at `/api/data`.
- The browser still keeps a local copy too (localStorage), so the
  dashboard keeps working instantly and offline; the cloud copy is what
  keeps every device/browser that opens the site in sync.
- The **Download Excel / Download CSV** buttons still work exactly as
  before — use them any time you want a manual snapshot file.
- The local-file auto-backup feature (File System Access API,
  "Link Excel Backup File") has been removed — it doesn't apply to a
  hosted site.


DEPLOYING TO NETLIFY
This needs Netlify's build step (to install `@netlify/blobs` and bundle
the function), so a plain drag-and-drop of the folder into Netlify's
"Deploys" tab won't wire up the function. Two easy ways to do it:

**Option A — Git (recommended)**
1. Push this folder to a new GitHub/GitLab/Bitbucket repo.
2. In Netlify: **Add new site → Import an existing project**, pick the
   repo. Build settings are already in `netlify.toml`, so you can leave
   the defaults.
3. Deploy. Netlify Blobs needs no setup — it's provisioned automatically
   the first time the function runs.

**Option B — Netlify CLI**
```
npm install -g netlify-cli
cd road-to-mil-netlify
netlify deploy --prod
```

**Local testing before you deploy**
```
netlify dev
```
This serves `index.html` and emulates `/api/data` (including Blobs)
on `http://localhost:8888`.


ONE TRACKER PER EXCHANGE
Netlify Blobs storage is scoped per **site**, so each deployed Netlify
site is automatically its own independent tracker — there's no folder
trick needed anymore. To track another exchange:

1. Deploy this same project again as a **new** Netlify site (in Netlify:
   Add new site → pick the same repo → give it a new site name, e.g.
   `road-to-mil-blofin`). Each site gets its own storage automatically.
2. Open that site and set its **Display name** in Settings (e.g.
   "Blofin", "Binance") — this is just a label and doesn't affect
   storage, but keeps the header/exports readable.


OPTIONAL: LOCK THE SITE WITH A PASSCODE
Anyone with your Netlify URL could otherwise read/write your tracker
data. To require a passcode:
1. In Netlify: **Site configuration → Environment variables**, add
   `RTM_SECRET` = a passphrase of your choice. Redeploy.
2. In the dashboard's Settings tab, under Cloud Sync, enter the same
   passphrase in **Sync passcode**. It's stored only in your browser
   and sent as a header on each request.
Leave `RTM_SECRET` unset if you don't want this (fine for a private,
hard-to-guess Netlify URL you don't share).


IMPORTANT
- Your old `road_to_mil_backup.xlsx` files are no longer written to
  automatically — they're just historical snapshots now. Keep them if
  you want the old data; the dashboard will pull the current numbers
  from the cloud (or from this browser) once it's running on Netlify.
- If you ever open `index.html` directly as a local file (not through
  Netlify), `/api/data` won't exist — the dashboard falls back to
  browser-only storage automatically and shows "○ Local only" in
  Settings. Nothing breaks; it just won't sync across devices until
  it's served by Netlify again.

## Trading Actual + Capital Add-On (update)

The Settings tab's editable table now has three related columns:

- **Trading Actual ($)** — editable. Your pure trading result for the week.
- **Capital Add-On ($)** — editable. Any extra capital you deposited that week (optional, defaults to $0).
- **Actual ($)** — calculated, read-only. `Trading Actual + Capital Add-On`. This is what drives Return %, vs Target, Hit/Miss, the chart, and everything else downstream — same as the old manually-entered Actual did.

If you were already using this tool before this update, your existing Actual entries are preserved automatically: on first load they're treated as your Trading Actual (minus any Capital Add-On already logged for that week), and the calculated Actual recomputes to the same number you had before.

CSV/Excel exports and the standalone HTML snapshot all include the new columns. Re-importing a file exported from this tool picks Trading Actual back up directly; importing an older export (or a third-party CSV) that only has "Actual (USD)" still works — it's treated as the Trading Actual for that row.

**Known gap:** the "Save Dashboard JPEG" export still doesn't show Trading Actual / Capital Add-On (same canvas-layout limitation noted above) — it does still show the correct calculated Actual.
