# Fan Quest — setup, deployment and status

> **No Supabase? Nothing to do.** With the placeholder `config.js`, the app runs in **offline mode**: publish the folder (e.g. GitHub Pages), open it, and create your account on first visit. Data is saved only in that browser. Follow the steps below only if you want real accounts, cross-device sync and server-validated points.

## 1. Supabase backend

1. Create a project at <https://supabase.com>.
2. **SQL Editor** → run these two files in order (paste and press Run):
   1. `supabase/migrations/20261025000000_fan_quest_schema.sql` — tables, row level security, storage bucket, server functions
   2. `supabase/migrations/20261025000001_fan_quest_seed.sql` — items, boxes, missions, challenges, achievements, trivia

   Both are safe to re-run. With the Supabase CLI you can use `supabase db push` instead.
   *Upgrading from the earlier prototype?* The schema migration renames the old `fq_*` tables to `fq_v1_*`, carries point balances over, and the seed carries matching inventory items over.
3. **Authentication → Providers → Email**: enable email + password.
   * Keep **Confirm email** on for real users. The demo account below is created already confirmed.
4. **Authentication → URL Configuration**: set **Site URL** to your deployed URL (e.g. `https://your-site.netlify.app`) and add it, plus `http://localhost:8787` for local testing, to **Redirect URLs**. Password-reset emails link back here.
5. **Project Settings → API**: copy the **Project URL** and the **anon / publishable** key. These are public browser values; row level security protects the data. **Never** use the `service_role` key in the browser.
6. If the SQL editor reports that it cannot write to `storage.buckets`, create a **private** bucket named `avatars` in **Storage** (2 MB limit, `image/png, image/jpeg, image/webp`), then re-run the schema file for the storage policies.

### Security model (what the database enforces)

* Signed-in users can only **read** their own rows; there are no client insert/update/delete grants on any Fan Quest table.
* Every write is a `SECURITY DEFINER` function that identifies the caller with `auth.uid()`.
* Points change only through one internal function that refuses to go below zero and writes a ledger row in the same transaction, so a failed purchase never charges.
* Purchases and box openings take a request ID; a retried request returns the original result instead of charging twice.
* Daily rewards, missions, challenges and achievements are one-time claims enforced by unique keys.
* Blind-box rarity and item are chosen on the server from the published odds and pool.
* Trivia answers never leave the server until you answer. Game sessions are single-use, with minimum durations, maximum tap rates and daily reward caps.
* Avatar saves are checked against what you own. Settings are whitelisted. Uploads are confined to your own private storage folder.
* Helper functions live in a private schema that the API does not expose.

## 2. Create the demo account securely

The app accepts **user ID `jujiang`**, which it maps to the address `jujiang@fanquest.app`. The password is never stored in the code or the repository. Pick one of these:

**Option A: Dashboard (simplest).** Authentication → Users → **Add user** → **Create new user**:
* Email: `jujiang@fanquest.app`
* Password: the demo password from your brief (type it here; don't commit it anywhere)
* Tick **Auto Confirm User**.

A profile with 100 welcome Fan Points is created automatically.

**Option B: Script.** Run this on your own computer; the service-role key never goes near the browser:
```bash
cp .env.example .env     # fill SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DEMO_PASSWORD (do not commit .env)
npm install
npm run create-demo-user # creates the user, or resets its password if it exists
```

Notes:
* `fanquest.app` is a made-up address, so the demo account **cannot reset its password by email**. Change it in-app under Profile & Settings → Account & security, or in the dashboard. Accounts registered with a real email can use "Forgot password?".
* To use your real email instead, create the user with that email; you can then log in with the email.

## 3. Run locally

**Against the built-in dev backend (no Supabase):**
```bash
npm install
DEMO_PASSWORD='choose-a-password' npm run dev    # http://localhost:8787, log in as jujiang
```
In dev mode, password-reset links are printed in the terminal instead of being emailed.

**Against your Supabase project:**
```bash
cp .env.example .env            # set SUPABASE_URL + SUPABASE_ANON_KEY
npm run build                   # writes dist/ with config.js
npx serve dist                  # or: cd dist && python3 -m http.server 8080
```
Or edit `config.js` directly with the two public values and serve the project folder over HTTP. Opening `index.html` as a `file://` URL won't work.

## 4. Deploy to Netlify

1. Push the project to GitHub (the `.gitignore` already excludes `.env`, `dist/` and the dev database).
2. Netlify → **Add new site → Import an existing project** → pick the repo. `netlify.toml` already sets:
   * Build command `node scripts/build-config.mjs`, publish directory `dist`
   * Security headers, including a strict Content-Security-Policy (tested with `FQ_CSP=1 npm run test:e2e`)
3. **Site settings → Environment variables**: add `SUPABASE_URL` and `SUPABASE_ANON_KEY` (anon/publishable key only; the build refuses a service-role key).
4. Deploy, then add the Netlify URL to Supabase **Authentication → URL Configuration** (step 1.4).
5. Smoke test: log in as `jujiang`, claim the daily reward, play a game, open a box, refresh, and confirm everything persisted.

**Other hosts** (GitHub Pages, Vercel, Cloudflare Pages): run `npm run build` with the two variables set and publish `dist/`. On GitHub Pages without a build step, commit a `config.js` containing only the two public values.

## 5. Environment variables

| Variable | Where | Secret? |
|---|---|---|
| `SUPABASE_URL` | Netlify build, local build | No (public) |
| `SUPABASE_ANON_KEY` | Netlify build, local build | No (public; protected by RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Only for `npm run create-demo-user` on your machine | **Yes**: never in the browser, never committed |
| `DEMO_PASSWORD` | `create-demo-user` and `npm run dev` | **Yes**: keep it out of git |
| `PORT`, `FQ_DB`, `FQ_CSP` | Dev server only | No |

See `.env.example`.

## 6. Feature checklist (tested)

Automated: `npm test` (16 database tests) and `npm run test:e2e` (24 browser steps), all passing, including under the production CSP. Run against the real migrations on a local Postgres with the real supabase-js client.

- [x] Login with user ID; wrong password shows an error; show/hide password
- [x] Session survives refresh; logout (this device / all devices); logged-out state survives refresh
- [x] Registration with validation; welcome gift of 100 points
- [x] Password recovery: reset email link, then set a new password, then log in with it
- [x] Change password (wrong current password rejected; old password stops working)
- [x] Daily login +5 once per day, streak tracking, persisted
- [x] Daily missions: progress from server events, one-time claims
- [x] Achievements: server-checked, one-time claims
- [x] Avatar editor: species/colours/items, live preview, save, undo, reset, persisted after reload
- [x] Locked items explain how to unlock; lookbook save/apply/delete
- [x] Custom avatar upload: type/size/dimension validation, preview, private upload, persisted
- [x] Item shop: confirm, buy, balance updates, owned, equip
- [x] Blind boxes: odds and pool shown, confirmation, server roll, reveal, inventory, duplicate refund, can't afford = disabled
- [x] Quick Tap / Fan Trivia / Memory Match: countdown, timer, score, pause/resume, restart, results, server reward
- [x] Daily Challenge reward (database test) and challenge card
- [x] Settings: theme, accent, pattern, decorations, density, text size, sidebar, sound, motion, language; synced and persisted
- [x] Dashboard widgets: reorder and hide
- [x] Legacy fan tracker loads inside the new navigation
- [x] Mobile layout: bottom tab bar, drawer, no horizontal scroll
- [x] Security: clients cannot write tables, read other users, call private helpers or see trivia answers; idempotent spending; no negative balances; odds statistically match

## 7. Known limitations

* **Not run against a live Supabase project from here.** Everything was tested on the same SQL in a local Postgres with a stand-in for Supabase's Auth/Storage APIs and the real supabase-js client. Expect small differences in auth settings (email confirmation, rate limits, password rules). Do the smoke test after deploying.
* **Quick Tap and Memory Match scores come from the browser.** The server bounds them (single-use sessions, minimum play time, maximum tap rate, minimum moves, daily reward caps) but can't replay gameplay, so a determined user could fake a score within those bounds. Trivia is fully server-checked.
* **The demo user ID uses a made-up email**, so it can't reset by email (see §2).
* **The legacy tracker's data still lives in the browser** (localStorage, per device) as before. It isn't migrated to Supabase. In dark mode some of its original cards stay light.
* **Translations**: the new Studio is English + 简体中文. The legacy tracker keeps its original mixed English/Chinese text.
* **Daily reset** is midnight Singapore time. Change `fq_private.today()` in the schema for another time zone.
* **Blind boxes use Fan Points only.** If Fan Points ever become purchasable with real money, check the loot-box rules where you operate (odds disclosure, age limits).
* Fonts load from Google Fonts. Offline, the app falls back to system fonts.

## 8. Files changed in this upgrade

**Modified:** `index.html` (now a 25 KB app shell; the legacy markup is unchanged inside it), `config.js`, `config.example.js`, `README.md`, `SETUP.md`.

**Moved out of `index.html`, content unchanged:** `css/legacy.css`, `js/legacy/app.js`, `assets/legacy-data.js`.

**Replaced:** `supabase/schema.sql` → `supabase/migrations/20261025000000_fan_quest_schema.sql` + `…01_fan_quest_seed.sql`. The previous Studio overlay (inline in `index.html`) has been replaced by `js/studio/`.

**New:** `css/studio.css`; `js/studio/{main,api,store,auth,avatar,components,actions,theme,settings-sync,i18n,icons,ui,preload}.js`; `js/studio/pages/*.js` (9 pages); `js/studio/games/*.js` (3 games); `vendor/supabase-js-2.117.2.js` (pinned, self-hosted); `scripts/{catalog,build-seed,build-config,create-demo-user}.mjs`; `dev/{server,db}.mjs`, `dev/supabase-shim.sql`; `tests/{sql.test,e2e}.mjs`; `package.json`, `netlify.toml`, `.env.example`, `.gitignore`.
