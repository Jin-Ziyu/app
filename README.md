# Fan Quest

Fan Quest is an account-based avatar collection and mini-game app, with the original fandom wallet, school planner, focus garden, quests, and backup tools preserved in an authenticated workspace.

## Run locally

Use Node 22.12 or newer. Install dependencies with `npm ci`, link the project with `netlify link`, and run `netlify dev --port 8889`. Open http://localhost:8889. Netlify Dev supplies Identity, Functions, Database and Blobs integrations; a plain static server cannot run the application. The Vite dev server uses port 5173 behind Netlify Dev.

`npm run check` checks TypeScript. `npm test` tests the reward and game engine. With Netlify Dev running, `npx playwright install chromium` and `npm run test:browser` run browser tests. Browser tests intercept Identity and account APIs with isolated fixtures: they test the UI integration, not a deployed database or real email delivery.

## Backend and deployment

The app uses Netlify Identity for accounts, Netlify Database (Postgres) for profiles and transactions, and private Netlify Blobs for uploaded avatar images. No provider secret belongs in frontend code. Identity has been enabled for this project.

The schema is in `db/schema.ts`; Drizzle migrations are committed under `netlify/database/migrations/`. Netlify provisions the database and applies migrations during deployment. Do not run migrations manually. For later schema changes, edit the schema and generate another migration with `npx drizzle-kit generate --name describe_your_change`.

Deploy this repository through the existing Netlify Git integration. Configuration is in `netlify.toml`: Netlify runs `npm run build`, publishes `dist`, and bundles Functions. The original `legacy.html` is included with the server functions and served only through `/api/workspace`; it is not a public static file. Automatic platform validation runs the production build.

Confirm Identity is enabled in project configuration, set the site URL to the HTTPS production URL, and allow the production and local callback URLs as needed. Registration follows the project's Identity settings. With email confirmation enabled, new users must confirm their email. Configure Identity email templates/delivery as required; invitation, confirmation and recovery links are processed by the app. Use invite-only registration if this is a private community.

Account data is accessed only by authenticated Functions. Every query uses the validated Identity user ID, never a client-supplied owner. Database credentials are never shipped to the browser; there is no public database query endpoint. Updates lock the profile row, record monetary changes in a ledger, and commit balance, inventory and request receipts atomically. The database also rejects negative balances. UUID request receipts make retried purchases idempotent. No browser-supplied points or game scores are accepted.

## Configure the initial demo account securely

The `jujiang` alias is implemented, but no account password is embedded or pre-provisioned. An account needs an email address for Identity invitations and recovery; none was supplied with the request.

1. Invite an email address you control through the project's Identity dashboard (or register that address and confirm it).
2. Accept the invitation in Fan Quest and enter the requested demo password directly into the password form. If the account already exists, use password recovery to set it. Do not put the password in source control, environment files, logs, or frontend code.
3. Set `DEMO_ACCOUNT_EMAIL` to that address in Netlify's environment configuration, scoped to Functions/runtime, and redeploy. `.env.example` lists the variable name without a value.
4. Sign in using user ID `jujiang` and the configured password. Email sign-in also works. Password changes are available in Profile & Settings.

The alias resolves on the server; the corresponding email setting is not returned to the frontend. Use an account you control for recovery delivery. No administrative provider credentials are needed in app configuration.

## App behavior

- The app requires an Identity session. Refresh restores the session; logout and cross-tab logout clear the app. Password visibility, error messages, registration, invite acceptance, recovery callbacks, display-name updates and password changes are implemented.
- The SVG avatar supports bunny, cat and bear species; fur/skin, eye and hair colours; hair, tops, bottoms, dresses, shoes, hats, glasses, jewellery, wings, bags, backgrounds, frames, poses and effects. Owned items can be equipped individually. Save appearance changes to the account; save up to eight named looks. Reset keeps inventory intact. A dress visually covers the top and bottom. Custom image portraits replace the dress-up rendering until removed.
- The catalog in `shared/catalog.ts` defines starter and unlockable items. Add items to existing categories there. A new visual category also needs its drawing layer in `src/avatar.ts` and category registration.
- Uploads accept PNG, JPEG and WebP up to 1 MB, with MIME and signature validation on the server and a browser decode/preview step. The browser also rejects dimensions above 4096 × 4096. Avatar files require the owner's session to read.
- Daily gifts award 5 Fan Points, once per UTC day. Consecutive claims grow the streak. Missions award 10 points for finishing a game, 10 for saving an appearance, and 20 for a positive score in the rotating daily game. Bonuses must be claimed in Daily Missions.
- Quick Tap runs for 25 seconds and awards one point per accepted target, capped at 40. Hard mode uses smaller targets. Trivia has five randomly ordered questions, 90 seconds, and awards 10 points per correct answer. Memory Match has six or eight pairs, a three-minute timer, and awards 25 or 40 points for a complete board. Tap and Memory support up to two minutes of pause time. Starting another game replaces the unfinished run. Finishing an incomplete memory round awards zero.
- Only the first three completed runs of each game per UTC day earn points; subsequent rounds are practice. A completed zero-score or abandoned-via-Finish run consumes a rewarded attempt. Restarting unfinished rounds earns nothing. Sequence numbers, target tokens, minimum move intervals, and server deadlines reject duplicate or implausibly fast actions.
- Boxes cost 50, 100 or 200 earned points. Exact rarity odds and per-item odds are shown before spending; the server chooses rarity and then an item using cryptographic randomness. Each box grants one item; duplicates are recorded and do not add another inventory item or refund points. There are no real-money purchases or cash prizes.
- Achievements unlock from game statistics, streaks, inventory and box history. Each earned badge has a once-only 20-point bonus to claim. The profile shows equipped items and recent transactions. Settings include light/dark mode, custom accent, background, density, font size, sidebar, three-widget ordering, audio and animation preferences. English is currently the only translation. Accessibility reduced-motion settings are respected.
- The existing workspace uses an account-specific browser cache and synchronizes its tracker snapshot to the account database. The original browser key is preserved. Use “Import this device’s original data” to explicitly migrate it; existing text backups can also be restored inside the workspace. Existing tracker energy/XP rewards are separate from Fan Points. Do not import someone else's shared-browser backup into your account. Workspace synchronization uses the latest saved snapshot; simultaneous editing from multiple devices can overwrite older workspace changes.

## Verification checklist

- [x] TypeScript validation (`npm run check`).
- [x] 19 engine tests (`npm test`).
- [x] 9 browser tests with mocked Identity/account APIs (`npm run test:browser`).
- [x] Unauthenticated local requests rejected by all three protected read endpoints.
- [x] Desktop visual review and mobile viewport/navigation checks.


Automated engine tests cover daily duplicate claims and streak resets, mission eligibility, insufficient funds, repeat ownership, box odds and duplicate rewards, avatar ownership and colour validation, settings validation, once-only achievement bonuses and per-game daily reward caps, hidden game answers/cards, tap replay/speed/timers, pause limits, trivia scoring and expiration, full memory boards, invalid flips and abandoned rounds.

Unauthenticated local HTTP checks verify 401 responses from `/api/quest`, `/api/avatar`, and `/api/workspace`. Browser tests exercise the authentication gate and refresh, password visibility, daily wallet updates, avatar saves/presets, confirmed item redemption, box odds/results, tap pause/resume, trivia results, memory flips, settings persistence, logout and mobile navigation using mocked APIs.

After the first deployment and demo-account configuration, verify these flows against real services:

- [ ] Invite acceptance, email confirmation, username login, refresh, logout and password recovery/change.
- [ ] Account isolation with two separate users.
- [ ] Save an avatar, reload on a second device, and confirm inventory/settings/balance persistence.
- [ ] Upload/remove a valid image; reject an invalid or oversized image.
- [ ] Complete all games; check once-only ledger awards and the daily reward cap.
- [ ] Claim a daily gift and missions twice; verify the second claim is rejected.
- [ ] Open a box, retry the same request ID, and verify exactly one charge and reward.
- [ ] Concurrent purchases with a low balance cannot overspend.
- [ ] Import an original tracker backup and confirm cross-device workspace synchronization.

Real Identity sign-in, email delivery, database transactions and cross-device persistence could not be exercised before the initial deployment and account setup. These are implemented integrations, not claims of completed live-service testing. Optional leaderboards and public community feeds are not included. The games have bounded server-validated rewards, but no browser game can fully prevent automated play; no competitive leaderboard is exposed. The small trivia bank contains general fandom knowledge rather than copyrighted artist-specific content. Browser game actions require a network connection; there is no offline point-award fallback.

## Changed and added files

- Updated `index.html` into the Vite app entry; preserved the old application in `legacy.html`.
- Added `src/main.ts`, `src/style.css`, `src/avatar.ts`, `src/env.d.ts` for the responsive app, authentication UI, games, wardrobe, profile and settings.
- Added `shared/catalog.ts` and `shared/engine.ts` for items, rules, validation, and server-owned game state.
- Added `db/schema.ts`, `db/index.ts`, `db/runtime.d.ts`, `drizzle.config.ts`, and two generated migration directories for profiles, ledger and request receipts.
- Added `netlify/functions/quest.mts`, `login.mts`, `avatar.mts`, and `workspace.mts` for authenticated account actions and private assets.
- Added `package.json`, `package-lock.json`, `tsconfig.json`, `netlify.toml`, `.gitignore`, `.env.example`, and `playwright.config.ts` for tooling and deployment.
- Copied the existing manifest and icon into `public/` so their public URLs remain available.
- Added `tests/engine.test.ts` and `tests/browser/app.spec.ts`; updated this guide with setup and validation instructions.
