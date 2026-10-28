# Fan Quest 🌸

A cute fan-community app: your original **Fan tracker** (fandom spending and collections, school planner, Princess Mochi) plus **Fan Quest Studio**, a customizable avatar and collectible game with Fan Points, mini-games, daily missions, achievements and a blind-box shop.

Plain HTML/CSS/JavaScript (ES modules, no framework, no bundler) with a **Supabase** backend. All points, rewards, purchases and inventory are validated in the database.

## What's inside

| Area | Highlights |
|---|---|
| **Account** | Login with user ID or email, show/hide password, clear errors, session kept after refresh, registration, password recovery by email, change password (checks the current one), log out (this device or everywhere). |
| **My Avatar** | Layered SVG avatar with a live preview. 12 species, 10 hairstyles, tops, bottoms, dresses, full outfits, shoes, hats, glasses, jewellery, wings, bags, held items, backgrounds, frames, poses and animated effects. Skin/fur, eye and hair colours (presets + custom). Save, undo, reset to default, lookbook (12 saved looks), custom photo upload with validation and preview. |
| **Wardrobe** | Every item shown as owned, equipped or locked, with how to unlock it. Equip/unequip in one tap. |
| **Fan Points** | Balance, full transaction history, server-validated earning and spending. Never negative, no double claims, no double charges. |
| **Blind Box Shop** | Common (50), Rare (100), Premium (200). Odds and the full reward pool are shown before you buy, with a confirmation step, server-side random selection, an opening animation and the reveal. Duplicates are refunded. There is also a direct item shop. |
| **Games** | Quick Tap, Fan Trivia, Memory Match and a rotating Daily Challenge. Each has difficulty levels, a countdown, timer and score, pause where it makes sense, restart, a results screen, and mouse/touch/keyboard controls. |
| **Daily Missions** | Login reward and streak, 3 rotating missions per day, daily challenge, reset countdown. |
| **Collection & Achievements** | Completion %, per-rarity and per-category progress, 14 achievement badges, an opt-in leaderboard. |
| **Profile & Settings** | Profile and stats; light/dark/system theme; pastel/pink/purple/blue/mint/custom accent; background patterns; floating decorations; density; text size; sidebar mode; sound; animations; English/简体中文; dashboard widget order and visibility. All synced to your account. |
| **Fan tracker** | The original app (Journey, Quests, Collect, School, Mochi), unchanged and loaded inside the new navigation. |

## Two ways to run

* **Offline mode (default, zero setup).** If `config.js` has no Supabase project, the app runs entirely in the browser: you create your account on first visit (e.g. user ID `jujiang`), and everything is saved in that browser's storage. Perfect for GitHub Pages. Trade-offs: no syncing between devices, no email password reset, clearing browser data erases progress, and a tech-savvy user could edit their own points.
* **Supabase mode.** Put your Supabase URL and anon key in `config.js` (see SETUP.md) for real accounts, cross-device sync and tamper-proof, server-validated points.

## Quick start with the local dev backend

```bash
npm install
DEMO_PASSWORD='choose-a-password' npm run dev      # http://localhost:8787
```

`npm run dev` starts a **local development backend**: an embedded Postgres (PGlite) running the real migrations, plus a small stand-in for Supabase Auth, RPC and Storage. Sign in with user ID **jujiang** and the password you set in `DEMO_PASSWORD`. Data persists in `dev/.data/`; delete that folder to start fresh. For production, use a real Supabase project (see **SETUP.md**).

## Project layout

```
index.html                 App shell (auth, sidebar, pages) + the legacy tracker markup
config.js                  Public Supabase URL + anon key (generated at build time)
css/legacy.css             Original tracker styles (unchanged)
css/studio.css             New app shell, studio pages, themes
js/legacy/app.js           Original tracker logic (unchanged, lazy-loaded)
assets/legacy-data.js      Original embedded images/catalogues (moved out of index.html)
assets/dk-cards.js         DK photocard checklist (appended to KCOL.svt)
assets/svt-merch.js        Seventeen plush/keyring merch + DREAMING Incheon merch checklist (appended to KCOL.svt; thumbnails in assets/mc/)
js/studio/                 New app: main.js (boot/router), api.js, store.js, avatar.js (renderer),
                           auth.js, theme.js, i18n.js, icons.js, components.js, actions.js
js/studio/pages/           dashboard, avatar, wardrobe, games, missions, shop, collection, achievements, profile
js/studio/games/           quick-tap, trivia, memory
supabase/migrations/       Schema (tables, RLS, RPCs) + generated catalogue seed
scripts/build-seed.mjs     Regenerates the seed migration from the catalogue
scripts/build-config.mjs   Netlify build: writes config.js and copies the site to dist/
scripts/create-demo-user.mjs  Creates/resets the demo account with the service key (run locally)
dev/                       Local dev backend (PGlite + Supabase API stand-in). Not deployed.
tests/sql.test.mjs         Database tests (security, economy, games)
tests/e2e.mjs              Browser end-to-end test of the whole app (Supabase mode)
tests/e2e-offline.mjs      Browser end-to-end test of offline mode
js/studio/local-backend.js Offline mode: same rules as the database functions, stored in localStorage
js/studio/catalog-data.js  Items, boxes, missions, challenges, achievements, trivia (single source of truth)
```

## Tests

```bash
npm test                    # 16 database tests on the real migrations
npm i -D playwright && npx playwright install chromium
npm run test:e2e            # 24 end-to-end browser steps against the dev backend
FQ_CSP=1 npm run test:e2e   # same, with the production Content-Security-Policy
```

## Adding new items

Add a row to `ITEMS` in `js/studio/catalog-data.js`, reusing an existing `shape` for that slot with new colours. Then run `npm run seed` and apply `supabase/migrations/…_fan_quest_seed.sql`. Give the item a `price` to sell it, `boxes` to put it in blind-box pools, or `starter: true` to make it free for everyone. The generator checks that every box rarity has items. New shapes need a small drawing function in `js/studio/avatar.js`.

See **SETUP.md** for backend setup, the demo account, deployment, the tested-features checklist and known limitations.
