// End-to-end test of OFFLINE mode (no Supabase): serve the folder as a plain static site,
// e.g. `python3 -m http.server 8797`, then: BASE=http://127.0.0.1:8797/ node tests/e2e-offline.mjs
import { chromium } from 'playwright';
import { deflateSync } from 'node:zlib';

const BASE = process.env.BASE || 'http://127.0.0.1:8797/';
const PW = 'offline-pass-1', PW2 = 'offline-pass-2';
let failed = 0, n = 0;
async function step(name, fn) { n++; try { await fn(); console.log('  ✔ ' + name); } catch (e) { failed++; console.log('  ✘ ' + name + '\n      ' + String(e.message).split('\n')[0]); } }
const assert = (c, m) => { if (!c) throw new Error(m || 'assertion failed'); };
function png(w, h) {
  const crc = b => { let c, t = []; for (let k = 0; k < 256; k++) { c = k; for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[k] = c >>> 0; } let x = 0xffffffff; for (const v of b) x = t[(x ^ v) & 255] ^ (x >>> 8); return (x ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const raw = Buffer.alloc((w * 3 + 1) * h, 200);
  for (let y = 0; y < h; y++) raw[y * (w * 3 + 1)] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
const p = await ctx.newPage();
const errors = []; p.on('pageerror', e => errors.push(e.message));
const points = async () => Number((await p.locator('#fq-top [data-fq-points]').textContent()).replace(/\D/g, ''));
const go = async h => { await p.evaluate(x => { location.hash = '#/' + x; }, h); await p.waitForTimeout(500); };
const dlg = name => p.locator('dialog.fq-dialog button', { hasText: name });
const login = async (id, pw) => { await p.fill('#fq-id', id); await p.fill('#fq-pw', pw); await p.click('#fq-login [type=submit]'); };

console.log('Fan Quest offline mode');
await step('no Supabase config -> login screen in offline mode (not "Setup required")', async () => {
  await p.goto(BASE); await p.waitForSelector('#fq-id');
  assert((await p.textContent('#fq-auth-root')).includes('Offline mode'), 'offline badge');
});
await step('unknown user is rejected', async () => {
  await login('jujiang', PW); await p.waitForTimeout(1500);
  assert((await p.textContent('#fq-auth-msg')).includes('Incorrect'));
});
await step('built-in jujiang account logs in (set DEMO_PASSWORD to check)', async () => {
  if (!process.env.DEMO_PASSWORD) return;
  await login('jujiang', process.env.DEMO_PASSWORD); await p.waitForSelector('#fq-side .fq-me', { timeout: 10000 });
  assert(await points() === 100, 'welcome points');
  await p.click('#fq-side [data-fq-logout]'); await p.waitForSelector('#fq-id');
});
await step('register a new user without email, 100 welcome points', async () => {
  await p.click('[data-mode="register"]'); await p.fill('#fq-un', 'fan2'); await p.fill('#fq-np', PW); await p.fill('#fq-np2', PW);
  await p.click('#fq-reg [type=submit]'); await p.waitForSelector('#fq-side .fq-me', { timeout: 10000 });
  await go('dashboard'); await p.waitForSelector('.fq-hero'); assert(await points() === 100);
});
await step('password is stored hashed, not in plain text', async () => {
  const raw = await p.evaluate(() => localStorage.getItem('fq:local:v1'));
  assert(!raw.includes(PW), 'plaintext password found'); assert(raw.includes('"hash"'));
});
await step('daily + mission + achievement, persisted across reload', async () => {
  await p.click('.fq-hero [data-claim-daily]'); await p.waitForTimeout(600);
  await go('missions'); await p.click('[data-claim-mission="m_login"]'); await p.waitForTimeout(600);
  await go('achievements'); await p.click('[data-claim-ach="a_first_login"]'); await p.waitForTimeout(600);
  assert(await points() === 125, 'points ' + await points());
  await p.reload(); await p.waitForSelector('#fq-side .fq-me'); assert(await points() === 125, 'after reload');
});
await step('avatar edit + save persists', async () => {
  await go('avatar'); await p.click('[data-tab="hair"]'); await p.click('[data-pick="hair_long"]'); await p.click('[data-save]'); await p.waitForTimeout(600);
  await p.reload(); await p.waitForSelector('.fq-editor'); await p.click('[data-tab="hair"]');
  assert(await p.getAttribute('[data-pick="hair_long"]', 'aria-pressed') === 'true');
});
await step('item purchase and blind box', async () => {
  await go('shop/items/hair'); await p.click('[data-buy="hair_bun"]'); await dlg('Buy').click(); await p.waitForTimeout(600); await dlg('Close').click();
  assert(await points() === 85, 'after buy ' + await points());
  await go('shop/boxes'); await p.click('[data-open-box="common"]'); await dlg('Open').click();
  await p.waitForSelector('.fq-reveal', { timeout: 8000 }); await p.click('.fq-reveal [data-close]'); await p.waitForTimeout(400);
  assert(await points() >= 35 && await points() <= 45, 'after box ' + await points());
});
await step('trivia game pays per correct answer', async () => {
  const before = await points();
  await go('games/trivia'); await p.click('[data-start]'); await p.waitForTimeout(2800);
  let correct = 0;
  for (let i = 0; i < 5; i++) { await p.waitForSelector('[data-a]:not([disabled])'); await p.click('[data-a="0"]'); await p.waitForSelector('[data-next]:not([hidden])');
    if (await p.locator('.fq-answer.right[data-a="0"]').count()) correct++; await p.click('[data-next]'); }
  await p.waitForSelector('.fq-results'); await p.waitForTimeout(400);
  assert(await points() === before + correct * 10, `${before} -> ${await points()} (${correct})`);
});
await step('quick tap (server-style checks still apply)', async () => {
  const before = await points();
  await go('games/quick_tap/normal'); await p.click('[data-start]'); await p.waitForTimeout(2800);
  for (let i = 0; i < 20; i++) { await p.locator('[data-target]').dispatchEvent('pointerdown'); await p.waitForTimeout(50); }
  await p.waitForSelector('.fq-results .fq-pill.coin', { timeout: 20000 });
  assert(await points() === before + 16, `${before} -> ${await points()}`);
});
await step('photo upload persists', async () => {
  await go('avatar/photo'); await p.setInputFiles('#fq-file', { name: 'me.png', mimeType: 'image/png', buffer: png(100, 120) });
  await p.click('[data-use-upload]'); await p.waitForTimeout(800);
  await p.reload(); await p.waitForSelector('#fq-side .fq-mini'); await p.waitForTimeout(500);
  assert((await p.innerHTML('#fq-side .fq-mini')).includes('<image'));
});
await step('settings persist (dark mode)', async () => {
  await go('profile/appearance'); await p.click('[data-set="theme"][data-v="dark"]'); await p.waitForTimeout(900);
  await p.reload(); await p.waitForSelector('#fq-side'); assert(await p.getAttribute('html', 'data-fq-mode') === 'dark');
  await go('profile/appearance'); await p.click('[data-set="theme"][data-v="light"]'); await p.waitForTimeout(900);
});
await step('change password, logout, login by user ID with new password', async () => {
  await go('profile/account');
  await p.fill('#fq-cur', PW); await p.fill('#fq-new', PW2); await p.fill('#fq-new2', PW2); await p.click('#fq-pw-form [type=submit]'); await p.waitForTimeout(1500);
  assert((await p.textContent('#fq-pw-msg')).includes('updated'));
  await p.click('#fq-side [data-fq-logout]'); await p.waitForSelector('#fq-id');
  await login('fan2', PW); await p.waitForTimeout(1500); assert((await p.textContent('#fq-auth-msg')).includes('Incorrect'), 'old pw rejected');
  await login('fan2', PW2); await p.waitForSelector('#fq-side .fq-me', { timeout: 10000 });
});
await step('fan tracker still loads', async () => {
  await go('tracker/school'); await p.waitForSelector('#v-school:not([hidden])', { timeout: 15000 });
});
await step('no page errors', async () => { assert(!errors.length, errors.join(' | ')); });
await browser.close();
console.log(`\n${n - failed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
