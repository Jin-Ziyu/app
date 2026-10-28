// End-to-end browser test of the whole app against the local dev backend.
//   npm i -D playwright && npx playwright install chromium   (once)
//   npm run test:e2e
// Starts its own throwaway server (in-memory DB) and drives the real UI.
import { spawn } from 'node:child_process';
import { deflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8791, BASE = `http://localhost:${PORT}/`;
const PW = 'e2e-demo-pass-1', PW2 = 'e2e-new-pass-2';
const results = [];
let failed = 0;
async function step(name, fn) {
  const t0 = Date.now();
  try { await fn(); results.push(`  ✔ ${name} (${Date.now() - t0}ms)`); }
  catch (e) { failed++; results.push(`  ✘ ${name}\n      ${String(e.message || e).split('\n')[0]}`); }
  console.log(results[results.length - 1]);
}
const assert = (c, m) => { if (!c) throw new Error(m || 'assertion failed'); };

// tiny PNG encoder for the upload test
function png(w, h) {
  const crc = b => { let c, t = []; for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } let x = 0xffffffff; for (const v of b) x = t[(x ^ v) & 255] ^ (x >>> 8); return (x ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const o = y * (w * 3 + 1) + 1 + x * 3; raw[o] = 255; raw[o + 1] = 120 + (x % 100); raw[o + 2] = 180 + (y % 70); }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const server = spawn(process.execPath, [join(root, 'dev/server.mjs')], { env: { ...process.env, PORT: String(PORT), FQ_DB: 'memory', DEMO_PASSWORD: PW }, stdio: ['ignore', 'pipe', 'inherit'] });
let serverOut = '';
await new Promise((ok, bad) => { server.stdout.on('data', d => { serverOut += d; if (String(d).includes('dev server')) ok(); }); setTimeout(() => bad(new Error('server did not start')), 30000); });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
const p = await ctx.newPage();
const pageErrors = [];
p.on('pageerror', e => pageErrors.push(e.message));
const points = async () => Number((await p.locator('#fq-top [data-fq-points]').textContent()).replace(/\D/g, ''));
const go = async h => { await p.evaluate(x => { location.hash = '#/' + x; }, h); await p.waitForTimeout(500); };
const dlgButton = name => p.locator('dialog.fq-dialog button', { hasText: name });
const login = async (id, pw) => { await p.fill('#fq-id', id); await p.fill('#fq-pw', pw); await p.click('#fq-login [type=submit]'); };

console.log('Fan Quest end-to-end');
await step('login page shows, wrong password is rejected, show/hide works', async () => {
  await p.goto(BASE); await p.waitForSelector('#fq-id');
  assert(await p.locator('#fq-app').isHidden(), 'app must be hidden before login');
  await login('jujiang', 'nope-nope'); await p.waitForTimeout(700);
  assert((await p.textContent('#fq-auth-msg')).includes('Incorrect'), 'error message');
  await p.click('[data-toggle-pw="fq-pw"]'); assert(await p.getAttribute('#fq-pw', 'type') === 'text');
  await p.click('[data-toggle-pw="fq-pw"]'); assert(await p.getAttribute('#fq-pw', 'type') === 'password');
});
await step('login with user ID opens the dashboard with the 100-point welcome gift', async () => {
  await login('jujiang', PW); await p.waitForSelector('.fq-hero');
  assert(await points() === 100, 'points ' + await points());
});
await step('session survives a page refresh', async () => {
  await p.reload(); await p.waitForSelector('.fq-hero', { timeout: 10000 });
});
await step('daily login pays +5 once and persists', async () => {
  await p.click('.fq-hero [data-claim-daily]'); await p.waitForTimeout(1200);
  assert(await points() === 105, 'after daily ' + await points());
  await p.reload(); await p.waitForSelector('.fq-hero');
  assert(await p.locator('[data-claim-daily]').count() === 0, 'claim button should be gone');
});
await step('daily mission can be claimed once', async () => {
  await go('missions'); await p.click('[data-claim-mission="m_login"]'); await p.waitForTimeout(1200);
  assert(await points() === 115, 'after mission ' + await points());
  assert(await p.locator('[data-claim-mission="m_login"]').count() === 0, 'claimed');
});
await step('achievement claim (first login)', async () => {
  await go('achievements'); await p.click('[data-claim-ach="a_first_login"]'); await p.waitForTimeout(1200);
  assert(await points() === 125, 'after achievement ' + await points());
});
await step('avatar editor: live preview, colour + item change, save, persists after reload', async () => {
  await go('avatar'); await p.click('[data-tab="hair"]'); await p.click('[data-pick="hair_long"]');
  await p.click('[data-color="hair_color"][data-v="#ff9fc0"]');
  assert(await p.locator('#fq-dirty.on').count() === 1, 'dirty indicator');
  assert((await p.innerHTML('#fq-stage')).includes('#ff9fc0'), 'preview updated');
  await p.click('[data-save]'); await p.waitForTimeout(1200);
  await p.reload(); await p.waitForSelector('.fq-editor'); await p.click('[data-tab="hair"]');
  assert(await p.getAttribute('[data-pick="hair_long"]', 'aria-pressed') === 'true', 'hair persisted');
});
await step('locked items explain how to unlock them', async () => {
  await p.click('[data-tab="character"]'); await p.click('[data-pick="sp_dragon"]');
  await p.waitForSelector('dialog.fq-dialog'); assert((await p.textContent('dialog.fq-dialog')).includes('Blind box'), 'unlock info');
  await dlgButton('Close').click();
});
await step('lookbook: save a look', async () => {
  await p.click('[data-save-look]'); await p.fill('#fq-look-name', 'Pink day'); await dlgButton('Save').click(); await p.waitForTimeout(1200);
  assert((await p.textContent('.fq-looks')).includes('Pink day'));
});
await step('item shop: confirm, buy, owned, equip from wardrobe', async () => {
  const before = await points();
  await go('shop/items/hair'); await p.click('[data-buy="hair_bun"]'); await dlgButton('Buy').click(); await p.waitForTimeout(1200);
  await dlgButton('Close').click(); await p.waitForTimeout(300);
  assert(await points() === before - 40, `points ${before} -> ${await points()}`);
  await go('wardrobe/owned'); await p.click('[data-equip="hair_bun"]'); await p.waitForTimeout(1200);
  assert(await p.locator('.fq-item.equipped', { hasText: 'Space buns' }).count() === 1, 'equipped');
});
await step('blind box: odds shown, confirm, reward revealed and added to collection', async () => {
  await go('shop/boxes');
  await p.click('.fq-boxcard:has([data-open-box="common"]) summary');
  assert((await p.textContent('.fq-boxcard:has([data-open-box="common"]) .fq-odds')).includes('75%'), 'odds visible');
  assert(await p.isDisabled('[data-open-box="premium"]'), 'premium unaffordable');
  const before = await points();
  await p.click('[data-open-box="common"]'); await dlgButton('Open').click();
  await p.waitForSelector('.fq-reveal', { timeout: 10000 });
  const dup = (await p.textContent('.fq-reveal')).includes('Duplicate');
  await p.click('.fq-reveal [data-close]'); await p.waitForTimeout(800);
  assert(await points() <= before - 40 && await points() >= 0, `charged ${before} -> ${await points()}`);
  await go('collection');
  if (!dup) assert(await p.locator('.fq-items .fq-item').count() >= 2, 'collection has box item');
});
await step('Quick Tap: countdown, tapping, server-validated reward', async () => {
  const before = await points();
  await go('games/quick_tap/easy'); await p.click('[data-start]');
  await p.waitForSelector('[data-target]'); await p.waitForTimeout(2800);
  for (let i = 0; i < 24; i++) { await p.locator('[data-target]').dispatchEvent('pointerdown'); await p.waitForTimeout(60); }
  await p.waitForSelector('.fq-results .fq-pill.coin', { timeout: 25000 });
  assert(await points() === before + 12, `tap reward ${before} -> ${await points()}`);
});
await step('Fan Trivia: server checks each answer', async () => {
  const before = await points();
  await go('games/trivia'); await p.click('[data-start]'); await p.waitForTimeout(2800);
  let correct = 0;
  for (let i = 0; i < 5; i++) {
    await p.waitForSelector('[data-a]:not([disabled])'); await p.click('[data-a="0"]');
    await p.waitForSelector('[data-next]:not([hidden])');
    if (await p.locator('.fq-answer.right[data-a="0"]').count()) correct++;
    await p.click('[data-next]');
  }
  await p.waitForSelector('.fq-results', { timeout: 10000 }); await p.waitForTimeout(800);
  assert((await p.textContent('.fq-results .fq-big')).trim() === `${correct}/5`, 'score display');
  assert(await points() === before + correct * 10, `trivia ${before} -> ${await points()} (${correct} correct)`);
});
await step('Memory Match: pause/resume, solve, reward', async () => {
  const before = await points();
  await go('games/memory_match/easy'); await p.click('[data-start]'); await p.waitForTimeout(2800);
  await p.click('[data-pause]'); assert(await p.locator('[data-resume]').isVisible(), 'paused overlay'); await p.click('[data-resume]');
  const n = await p.locator('.fq-mcard').count();
  const seen = new Map(), matched = new Set();
  const flip = async k => { await p.locator('.fq-mcard').nth(k).click(); if (await p.locator('.fq-results').count()) throw new Error('done'); return p.locator('.fq-mcard').nth(k).locator('.f').innerHTML({ timeout: 2000 }); };
  const partner = (m, except) => { for (const [i, x] of seen) if (x === m && i !== except && !matched.has(i)) return i; };
  try { for (let k = 0; k < n && matched.size < n; k++) {
    if (matched.has(k) || seen.has(k)) continue;
    const a = await flip(k); const pa = partner(a, k);
    if (pa !== undefined) { await flip(pa); matched.add(k).add(pa); seen.delete(pa); continue; }
    seen.set(k, a);
    let j = k + 1; while (j < n && (matched.has(j) || seen.has(j))) j++;
    if (j >= n) break;
    const b = await flip(j);
    if (matched.size + 2 >= n && b === a) { matched.add(k).add(j); break; }
    if (b === a) { matched.add(k).add(j); seen.delete(k); continue; }
    seen.set(j, b); await p.waitForTimeout(900);
    const pb = partner(b, j);
    if (pb !== undefined) { await flip(pb); await flip(j); matched.add(pb).add(j); seen.delete(pb); seen.delete(j); }
  } } catch (e) { if (e.message !== 'done') throw e; }
  await p.waitForSelector('.fq-results', { timeout: 20000 }); await p.waitForTimeout(800);
  assert(await points() > before, `memory ${before} -> ${await points()}`);
});
await step('settings: dark mode + language sync to the account', async () => {
  await go('profile/appearance'); await p.click('[data-set="theme"][data-v="dark"]'); await p.waitForTimeout(300);
  await p.selectOption('[data-lang]', 'zh'); await p.waitForTimeout(1500);
  await p.reload(); await p.waitForSelector('#fq-side');
  assert(await p.getAttribute('html', 'data-fq-mode') === 'dark', 'dark persisted');
  assert((await p.textContent('#fq-side')).includes('衣橱'), 'chinese nav');
  await go('profile/appearance'); await p.selectOption('[data-lang]', 'en'); await p.click('[data-set="theme"][data-v="light"]'); await p.waitForTimeout(1200);
});
await step('dashboard widgets can be hidden and reordered', async () => {
  await go('profile/dashboard');
  await p.locator('#fq-widgets li[data-w="points"] [data-widget-on]').uncheck();
  await p.locator('#fq-widgets li[data-w="games"] [data-move="-1"]').click(); await p.waitForTimeout(1200);
  await go('dashboard');
  assert(await p.locator('.fq-card.gold:has-text("Lifetime points")').count() === 0, 'points widget hidden');
});
await step('custom avatar upload: validated, uploaded, persisted', async () => {
  await go('avatar/photo');
  await p.setInputFiles('#fq-file', { name: 'bad.txt', mimeType: 'text/plain', buffer: Buffer.from('nope') });
  assert((await p.textContent('#fq-up-msg')).includes('PNG'), 'type validation');
  await p.setInputFiles('#fq-file', { name: 'me.png', mimeType: 'image/png', buffer: png(120, 140) });
  await p.waitForSelector('[data-use-upload]'); await p.click('[data-use-upload]'); await p.waitForTimeout(1500);
  await p.reload(); await p.waitForSelector('#fq-side .fq-mini'); await p.waitForTimeout(800);
  assert((await p.innerHTML('#fq-side .fq-mini')).includes('<image'), 'custom image shown');
  await go('avatar/photo'); await p.click('[data-use-built]'); await p.click('[data-save]'); await p.waitForTimeout(1200);
});
await step('fan tracker (legacy) loads inside the shell', async () => {
  await go('tracker/school'); await p.waitForSelector('#v-school:not([hidden])', { timeout: 15000 });
  assert(await p.locator('#fq-legacy-host').isVisible(), 'legacy host visible');
  await go('dashboard'); assert(await p.locator('#fq-legacy-host').isHidden());
});
await step('change password: wrong current rejected, then updated', async () => {
  await go('profile/account');
  await p.fill('#fq-cur', 'wrong-one'); await p.fill('#fq-new', PW2); await p.fill('#fq-new2', PW2); await p.click('#fq-pw-form [type=submit]'); await p.waitForTimeout(800);
  assert((await p.textContent('#fq-pw-msg')).includes('incorrect'), 'wrong current');
  await p.fill('#fq-cur', PW); await p.fill('#fq-new', PW2); await p.fill('#fq-new2', PW2); await p.click('#fq-pw-form [type=submit]'); await p.waitForTimeout(1200);
  assert((await p.textContent('#fq-pw-msg')).includes('updated'), 'updated');
});
await step('logout, old password fails, new password works', async () => {
  await p.click('#fq-side [data-fq-logout]'); await p.waitForSelector('#fq-id');
  await p.reload(); await p.waitForSelector('#fq-id'); assert(await p.locator('#fq-app').isHidden(), 'still logged out after reload');
  await login('jujiang', PW); await p.waitForTimeout(900); assert((await p.textContent('#fq-auth-msg')).includes('Incorrect'));
  await login('jujiang', PW2); await p.waitForSelector('.fq-hero, .fq-page .fq-head');
});
await step('registration creates a fresh account', async () => {
  await p.click('#fq-side [data-fq-logout]'); await p.waitForSelector('#fq-id');
  await p.click('[data-mode="register"]');
  await p.fill('#fq-un', 'newfan'); await p.fill('#fq-em', 'newfan@example.com'); await p.fill('#fq-np', 'short'); await p.fill('#fq-np2', 'short');
  await p.click('#fq-reg [type=submit]'); assert((await p.textContent('#fq-auth-msg')).includes('8'), 'short password rejected');
  await p.fill('#fq-np', 'long-enough-1'); await p.fill('#fq-np2', 'long-enough-1'); await p.click('#fq-reg [type=submit]');
  await p.waitForSelector('#fq-side .fq-me'); await go('dashboard'); await p.waitForSelector('.fq-hero'); assert(await points() === 100, 'welcome gift');
});
await step('password recovery by email link', async () => {
  await p.click('#fq-side [data-fq-logout]'); await p.waitForSelector('#fq-id');
  await p.click('[data-mode="reset"]'); await p.fill('#fq-re', 'newfan@example.com'); await p.click('#fq-reset [type=submit]'); await p.waitForTimeout(800);
  const link = serverOut.split('\n').reverse().find(l => l.includes('type=recovery'));
  assert(link, 'reset link issued');
  await p.goto('about:blank'); await p.goto(link.trim()); await p.waitForSelector('#fq-recover');
  await p.fill('#fq-rp', 'recovered-pass-9'); await p.fill('#fq-rp2', 'recovered-pass-9'); await p.click('#fq-recover [type=submit]');
  await p.waitForSelector('#fq-side .fq-me');
  await p.click('#fq-side [data-fq-logout]'); await p.waitForSelector('#fq-id');
  await login('newfan@example.com', 'recovered-pass-9'); await p.waitForSelector('#fq-side .fq-me');
});
await step('mobile layout: bottom tab bar + drawer navigation', async () => {
  await p.setViewportSize({ width: 390, height: 844 });
  await go('dashboard'); assert(await p.locator('#fq-tabbar').isVisible(), 'tab bar');
  await p.click('#fq-tabbar [data-fq-drawer]'); await p.waitForTimeout(400);
  await p.click('#fq-side a[data-nav="collection"]'); await p.waitForTimeout(600);
  assert((await p.evaluate(() => location.hash)) === '#/collection', 'navigated');
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  assert(!overflow, 'no horizontal scroll');
});
await step('no uncaught page errors', async () => { assert(!pageErrors.length, pageErrors.join(' | ')); });

await browser.close();
server.kill();
console.log(`\n${results.length - failed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
