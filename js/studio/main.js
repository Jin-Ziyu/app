// Fan Quest Studio — boot, auth gate, app shell, router and legacy tracker loader.
import * as api from './api.js';
import { store, onChange, loadCatalog, refresh, profile } from './store.js';
import { applySettings, cachedSettings, currentSettings } from './theme.js';
import { renderAuth } from './auth.js';
import { t } from './i18n.js';
import { esc, $, $$, toast, fmt } from './ui.js';
import { icon } from './icons.js';
import { errorBox } from './components.js';
import { saveSettings } from './settings-sync.js';
import { loadLegacy as loadLegacyScripts } from './legacy-loader.js';

import dashboard from './pages/dashboard.js';
import profilePage from './pages/profile.js';
import lifePage from './pages/life.js';
import timelinePage from './pages/timeline.js';
import { openLife } from './life-store.js';

const PAGES = { dashboard, profile: profilePage, life: lifePage, timeline: timelinePage };
export const LIFE = [['finance', 'wallet', 'life.finance', 'Finance'], ['calories', 'apple', 'life.calories', 'Calories'], ['milktea', 'cup', 'life.milktea', 'Milk tea']];
const NAV = [
  ['dashboard', 'home', 'nav.dashboard', 'Home'], ['timeline', 'clock', 'nav.timeline', 'Timeline'], ['profile', 'gear', 'nav.profile', 'Profile & Settings'],
];
// Legacy tracker views -> nav entry
export const TRACKER = [['game', 'star', 'nav.quests', 'Quests & rewards'], ['home', 'bag', 'nav.collect', 'Collect & spending'],
  ['school', 'cap', 'nav.school', 'School'], ['me', 'paw', 'nav.mochi', 'Mochi & portfolio']];
const NAV_EMOJI = { dashboard: '🏡', timeline: '🗓️', profile: '🎀', 'tracker/journey': '🗺️', 'tracker/game': '⭐', 'tracker/home': '🛍️', 'tracker/school': '📚', 'tracker/me': '🐾',
  'life/finance': '💰', 'life/calories': '🍓', 'life/milktea': '🧋' };
const trackerNavFor = v => (['game', 'school'].includes(v) ? v : ['me', 'settings'].includes(v) ? 'me' : 'home');

const cfg = window.FAN_QUEST_CONFIG || {};
const el = { boot: $('#fq-boot'), auth: $('#fq-auth-root'), app: $('#fq-app'), side: $('#fq-side'), top: $('#fq-top'), view: $('#fq-view'), legacy: $('#fq-legacy-host'), tabbar: $('#fq-tabbar'), scrim: $('#fq-scrim') };
let inApp = false, recovering = /type=recovery/.test(location.hash), current = null, currentPage = null, suppressHash = false;

applySettings(cachedSettings());

// ---------------- boot + auth ----------------
function showAuth(mode = 'login', extra = {}) {
  inApp = false; store.user = null;
  el.boot.hidden = true; el.app.hidden = true;
  renderAuth(el.auth, mode, { dev: !!cfg.devBackend, local: api.isLocal(), onRecovered: () => { recovering = false; toast(t('auth.updated', 'Password updated. Welcome back!'), 'ok'); api.sb().auth.getSession().then(({ data }) => data.session && enterApp(data.session.user)); }, ...extra });
}

async function boot() {
  const client = api.init(cfg);   // falls back to offline mode when no Supabase project is configured
  client.auth.onAuthStateChange((event, session) => {
    // Defer: Supabase recommends not awaiting other calls inside this callback.
    setTimeout(() => {
      if ((event === 'PASSWORD_RECOVERY' || (recovering && session && ['INITIAL_SESSION', 'SIGNED_IN'].includes(event))) && !el.auth.querySelector('#fq-recover')) {
        recovering = true; leaveApp(); return showAuth('recover');
      }
      if (event === 'SIGNED_OUT' || !session) { if (inApp || event === 'INITIAL_SESSION' || event === 'SIGNED_OUT') { leaveApp(); showAuth('login'); } return; }
      if (recovering) return;
      if (!inApp && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) enterApp(session.user);
      else if (session?.user) store.user = session.user;
    }, 0);
  });
  window.addEventListener('offline', () => toast(t('toast.offline', 'You seem to be offline.'), 'err'));
}

async function enterApp(user) {
  if (inApp) return;
  inApp = true; store.user = user;
  openLife(user.id);
  el.auth.hidden = true; el.auth.innerHTML = ''; el.boot.hidden = true; el.app.hidden = false;
  renderShell();
  el.view.innerHTML = `<div class="fq-page"><div class="fq-skel" style="height:150px"></div><div class="fq-grid" style="--min:240px">${'<div class="fq-skel" style="height:160px"></div>'.repeat(6)}</div></div>`;
  try {
    await Promise.all([loadCatalog(), refresh()]);
    applySettings(profile().settings);
    renderShell();
    route();
    loadLegacy().catch(() => {});
  } catch (e) {
    console.error(e);
    el.view.innerHTML = `<div class="fq-page">${errorBox(api.errText(e))}<button class="fq-btn" data-fq-logout>${icon('logout')}${esc(t('nav.logout', 'Log out'))}</button></div>`;
    el.view.querySelector('[data-fq-retry]').onclick = () => { inApp = false; enterApp(user); };
  }
}
function leaveApp() {
  inApp = false; current = null; currentPage = null;
  store.state = null; store.catalog = null; store.items = new Map();
  el.app.hidden = true; el.view.innerHTML = '';
}
export async function logout(scope = 'local') {
  if (currentPage?.leave && !(await currentPage.leave())) return;
  await api.signOut(scope);
  leaveApp(); showAuth('login');
}

// ---------------- shell ----------------
function badgeCounts() {
  const s = store.state; if (!s) return {};
  return {};
}
function renderShell() {
  const p = profile();
  const counts = badgeCounts();
  const navLink = ([id, ic, key, en], prefix = '') => {
    const emo = NAV_EMOJI[prefix + id];
    const href = prefix ? `#/${prefix}${id}` : `#/${id}`;
    const n = counts[id];
    return `<a href="${href}" data-nav="${prefix}${id}" title="${esc(t(key, en))}">${icon(ic)}<span>${esc(t(key, en))}</span>${n ? `<b class="fq-dotn" aria-label="${n}">${n}</b>` : ''}</a>`;
  };
  el.side.innerHTML = `
    <a class="fq-ticket" href="#/dashboard" aria-label="Fan Quest">
      <span class="fq-ticket-stub" aria-hidden="true"><i>ADMIT</i><b>01</b></span>
      <span class="fq-ticket-main"><small class="fq-ticket-kicker">★ ${esc(t('nav.tagline', 'fan diary'))} ★</small><b>Fan Quest</b>
        <span class="fq-ticket-meta"><span>${new Date().getFullYear()} TOUR</span><span>SEAT ${esc((p?.username || 'A1').slice(0, 2).toUpperCase())}-01</span></span>
        <span class="fq-ticket-bar" aria-hidden="true"></span></span></a>
    ${p ? `<a class="fq-me" href="#/profile" title="${esc(p.display_name || p.username)}"><span class="fq-mini fq-pic"><img src="assets/avatar.png" alt=""></span>
      <div><b>${esc(p.display_name || p.username)}</b><span class="fq-pts">@${esc(p.username)}</span></div></a>` : ''}
    <nav class="fq-nav" aria-label="${esc(t('nav.studio', 'Studio'))}"><div class="fq-nav-label">${esc(t('nav.studio', 'Studio'))}</div>${NAV.map(n => navLink(n)).join('')}
      <div class="fq-nav-label">${esc(t('nav.tracker', 'Fan tracker'))}</div>${TRACKER.map(n => navLink(n, 'tracker/')).join('')}
      <div class="fq-nav-label">${esc(t('nav.life', 'Life'))}</div>${LIFE.map(n => navLink(n, 'life/')).join('')}</nav>
    <div class="fq-side-foot">
      <button class="fq-btn sm ghost fq-hide-mobile" data-fq-collapse title="${esc(t('nav.collapse', 'Collapse sidebar'))}">${icon(currentSettings().sidebar === 'collapsed' ? 'chevR' : 'chevL')}<span class="fq-lbl">${esc(t(currentSettings().sidebar === 'collapsed' ? 'nav.expand' : 'nav.collapse', currentSettings().sidebar === 'collapsed' ? 'Expand' : 'Collapse'))}</span></button>
      <button class="fq-btn sm ghost" data-fq-logout title="${esc(t('nav.logout', 'Log out'))}">${icon('logout')}<span class="fq-lbl">${esc(t('nav.logout', 'Log out'))}</span></button>
    </div>`;
  const dark = document.documentElement.dataset.fqMode === 'dark';
  el.top.innerHTML = `<button class="fq-iconbtn fq-only-mobile fq-menu-btn" data-fq-drawer aria-label="${esc(t('nav.menu', 'Menu'))}">${icon('menu')}</button>
    <h1 class="fq-title" id="fq-title"></h1>
    <button class="fq-iconbtn" data-fq-theme aria-label="${dark ? 'Light mode' : 'Dark mode'}" title="${dark ? 'Light mode' : 'Dark mode'}">${icon(dark ? 'sun' : 'moon')}</button>`;
  el.tabbar.innerHTML = [['dashboard', 'home', 'nav.dashboard', 'Home'], ['timeline', 'clock', 'nav.timeline', 'Timeline']]
    .map(([id, ic, k, en]) => `<a href="#/${id}" data-nav="${id}">${icon(ic)}<span>${esc(t(k, en))}</span></a>`).join('') +
    `<a href="#/tracker/home" data-nav-tracker>${icon('heart')}<span>${esc(t('nav.trackerTab', 'Tracker'))}</span></a>` +
    `<a href="#/life/finance" data-nav="life/finance">${icon('wallet')}<span>${esc(t('nav.life', 'Life'))}</span></a>` +
    `<button data-fq-drawer>${icon('menu')}<span>${esc(t('nav.more', 'More'))}</span></button>`;
  markNav();
}
function markNav() {
  const id = current?.page === 'tracker' ? 'tracker/' + trackerNavFor(current.params[0] || 'home') : current?.page === 'life' ? 'life/' + (LIFE.some(x => x[0] === current.params[0]) ? current.params[0] : 'finance') : current?.page;
  $$('[data-nav]').forEach(a => a.setAttribute('aria-current', a.dataset.nav === id ? 'page' : 'false'));
  $$('[data-nav-tracker]').forEach(a => a.setAttribute('aria-current', current?.page === 'tracker' ? 'page' : 'false'));
}
function setTitle(text) { const h = $('#fq-title'); if (h) h.textContent = text; document.title = text ? `${text} · Fan Quest` : 'Fan Quest'; }

document.addEventListener('click', async e => {
  const b = e.target.closest('[data-fq-drawer],[data-fq-logout],[data-fq-collapse],[data-fq-theme]');
  if (!b) { if (e.target === el.scrim) el.app.classList.remove('fq-drawer-open'); return; }
  if (b.matches('[data-fq-drawer]')) el.app.classList.toggle('fq-drawer-open');
  if (b.matches('[data-fq-logout]')) logout();
  if (b.matches('[data-fq-collapse]')) { const s = currentSettings(); saveSettings({ sidebar: s.sidebar === 'collapsed' ? 'expanded' : 'collapsed' }); renderShell(); }
  if (b.matches('[data-fq-theme]')) { const dark = document.documentElement.dataset.fqMode === 'dark'; saveSettings({ theme: dark ? 'light' : 'dark' }); renderShell(); setTitle(current && pageTitle()); if (currentPage && current.page !== 'tracker') currentPage.render(el.view, ctx(), 'settings'); }
});
el.side.addEventListener('click', e => { if (e.target.closest('a')) el.app.classList.remove('fq-drawer-open'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') el.app.classList.remove('fq-drawer-open'); });

// Keep shell numbers fresh without re-rendering the whole page.
onChange(() => {
  if (!inApp || !store.state) return;
  const p = profile();
  $$('[data-fq-points]').forEach(n => { n.textContent = fmt(p.points); });
  const counts = badgeCounts();
  for (const k of ['missions', 'achievements']) {
    const a = el.side.querySelector(`[data-nav="${k}"]`); if (!a) continue;
    a.querySelector('.fq-dotn')?.remove();
    if (counts[k]) a.insertAdjacentHTML('beforeend', `<b class="fq-dotn" aria-label="${counts[k]}">${counts[k]}</b>`);
  }
  if (currentPage?.live && current.page !== 'tracker') currentPage.render(el.view, ctx(), 'store');
});

// ---------------- router ----------------
function parseHash() {
  const h = location.hash;
  if (!h.startsWith('#/')) return { page: 'dashboard', params: [] };
  const [page, ...params] = h.slice(2).split('/').map(decodeURIComponent);
  return { page: PAGES[page] || page === 'tracker' ? page : 'dashboard', params };
}
export function go(path) { location.hash = '#/' + path.replace(/^#?\/?/, ''); }
const ctx = () => ({ params: current?.params || [], go, logout, rerenderShell: renderShell });
function pageTitle() {
  if (!current) return '';
  if (current.page === 'tracker') { const n = TRACKER.find(x => x[0] === trackerNavFor(current.params[0] || 'home')); return n ? t(n[2], n[3]) : 'Fan tracker'; }
  if (current.page === 'life') { const n = LIFE.find(x => x[0] === current.params[0]) || LIFE[0]; return t(n[2], n[3]); }
  const n = NAV.find(x => x[0] === current.page); return n ? t(n[2], n[3]) : '';
}
let lastHash = location.hash;
async function route() {
  if (!inApp || !store.state) return;
  if (suppressHash) { suppressHash = false; lastHash = location.hash; return; }
  const next = parseHash();
  const changed = current && (next.page !== current.page || (currentPage?.leaveOnParams && next.params.join('/') !== current.params.join('/')));
  if (currentPage?.leave && changed && !(await currentPage.leave())) {
    suppressHash = true; location.hash = lastHash; return;
  }
  lastHash = location.hash;
  const samePage = current && current.page === next.page;
  current = next;
  el.app.classList.remove('fq-drawer-open');
  markNav(); setTitle(pageTitle());
  if (next.page === 'tracker') { currentPage = null; return showTracker(!next.params[0] || next.params[0] === 'journey' ? 'home' : next.params[0]); }
  el.legacy.hidden = true; el.view.hidden = false;
  // Fandom pages paint the whole page (body.stage-*); drop that when leaving the tracker.
  document.body.classList.remove('stage', 'stage-exo', 'stage-svt', 'stage-and2ble');
  if (!samePage) currentPage?.destroy?.();
  currentPage = PAGES[next.page];
  currentPage.render(el.view, ctx(), samePage ? 'params' : 'route');
  if (!samePage) { window.scrollTo({ top: 0 }); el.view.focus({ preventScroll: true }); }
}
window.addEventListener('hashchange', route);
window.addEventListener('fq-life-change', () => {
  if (!inApp) return;
  if (current?.page === 'life' || current?.page === 'timeline') currentPage?.refresh?.();
  else if (current?.page === 'dashboard') currentPage?.render(el.view, ctx(), 'life');
});
window.addEventListener('fq-legacy-change', () => { if (!inApp) return; if (current?.page === 'timeline') currentPage?.refresh?.(); else if (current?.page === 'dashboard' && currentPage?.render) currentPage.render(el.view, ctx(), 'legacy'); });

// ---------------- legacy tracker ----------------
let legacyHooked = false;
function loadLegacy() {
  return loadLegacyScripts().then(() => {
    if (legacyHooked) return;
    legacyHooked = true;
    const orig = window.go;
    window.go = v => {
      orig(v);
      if (current?.page === 'tracker' && current.params[0] !== v) { suppressHash = true; current.params = [v]; location.hash = '#/tracker/' + v; markNav(); setTitle(pageTitle()); }
    };
  });
}
async function showTracker(view) {
  if (!legacyHooked) {
    el.view.hidden = false; el.legacy.hidden = true;
    el.view.innerHTML = `<div class="fq-page" style="align-items:center;padding-top:80px"><span class="fq-spinner"></span><b>${esc(t('app.loading', 'Loading…'))}</b></div>`;
    try { await loadLegacy(); } catch {
      el.view.innerHTML = `<div class="fq-page">${errorBox(t('common.loadError', "Couldn't load. Check your connection and try again."))}</div>`;
      el.view.querySelector('[data-fq-retry]').onclick = () => showTracker(view); return;
    }
  }
  if (current?.page !== 'tracker') return;
  el.view.hidden = true; el.view.innerHTML = ''; el.legacy.hidden = false;
  window.go(view);
}

boot().catch(e => { console.error(e); el.boot.hidden = true; showAuth('login', { message: '' }); });
