// Applies interface settings (theme, accent, density, font size, …) to the document.
import { setLang } from './i18n.js';
import { prefs } from './ui.js';

export const ACCENTS = {
  pastel: ['#c9b3f5', '#ffb3cf'], pink: ['#ff9fc0', '#ffc9a8'], purple: ['#b18cf2', '#f2a6d8'],
  blue: ['#8fb8f5', '#a9e4f2'], mint: ['#8fdcb8', '#ffe08a'],
};
export const DEFAULT_SETTINGS = {
  theme: 'light', accent: 'pastel', accent_custom: '#b9a5ee', background: 'hearts', decor: true, density: 'comfortable',
  font_scale: 1, sidebar: 'expanded', sound: true, motion: true, language: 'en',
  widgets: ['fandom', 'schedule', 'todo', 'life', 'points', 'avatar', 'daily', 'missions', 'challenge', 'games', 'collection', 'achievements', 'transactions', 'leaderboard', 'tracker'].map(id => ({ id, on: true })),
};
const lum = hex => { const n = parseInt(hex.slice(1), 16); const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const mixHex = (a, b, t) => { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const x = p(a), y = p(b); return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join(''); };

let mq;
export function applySettings(s0) {
  const s = { ...DEFAULT_SETTINGS, ...(s0 || {}) };
  const root = document.documentElement;
  const dark = s.theme === 'dark' || (s.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  root.dataset.fqMode = dark ? 'dark' : 'light';
  root.dataset.fqAccent = s.accent;
  root.dataset.fqPattern = s.background;
  root.dataset.fqDensity = s.density;
  root.dataset.fqSidebar = s.sidebar;
  root.dataset.fqMotion = s.motion ? 'on' : 'off';
  const [a1, a2] = s.accent === 'custom' ? [s.accent_custom, mixHex(s.accent_custom, '#ffb3c7', 0.5)] : (ACCENTS[s.accent] || ACCENTS.pastel);
  root.style.setProperty('--acc', a1);
  root.style.setProperty('--acc-2', a2);
  root.style.setProperty('--acc-ink', lum(a1) < 0.33 ? '#ffffff' : '#4b2c55');
  root.style.setProperty('--fq-scale', String(Math.min(1.3, Math.max(0.85, +s.font_scale || 1))));
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#191630' : a1);
  let decor = document.getElementById('fq-decor');
  if (s.decor && !decor) {
    decor = document.createElement('div'); decor.id = 'fq-decor'; decor.className = 'fq-decor'; decor.setAttribute('aria-hidden', 'true');
    decor.innerHTML = Array.from({ length: 12 }, (_, i) => `<i style="left:${(i * 37) % 100}%;top:${(i * 53 + 11) % 100}%;animation-delay:-${i * 1.3}s"></i>`).join('');
    document.body.prepend(decor);
  } else if (!s.decor && decor) decor.remove();
  prefs.sound = !!s.sound; prefs.motion = !!s.motion;
  setLang(s.language);
  if (s.theme === 'system' && !mq) { mq = matchMedia('(prefers-color-scheme: dark)'); mq.addEventListener?.('change', () => applySettings(current)); }
  current = s;
  try { localStorage.setItem('fq:settings', JSON.stringify(s)); } catch { /* storage unavailable */ }
  return s;
}
let current = DEFAULT_SETTINGS;
export const currentSettings = () => current;
export function cachedSettings() { try { return JSON.parse(localStorage.getItem('fq:settings') || 'null'); } catch { return null; } }
