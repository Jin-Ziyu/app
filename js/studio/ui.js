// Small UI helpers: escaping, toasts, dialogs, busy buttons, sounds, confetti.
import { t } from './i18n.js';
import { icon } from './icons.js';

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const fmt = n => Number(n || 0).toLocaleString();
export function fmtDate(d, opts = { day: 'numeric', month: 'short', year: 'numeric' }) {
  try { return new Date(d).toLocaleDateString(document.documentElement.lang || 'en', opts); } catch { return String(d); }
}
export function fmtTime(d) {
  try { return new Date(d).toLocaleString(document.documentElement.lang || 'en', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch { return String(d); }
}
export const prefs = { sound: true, motion: true };

// ---------- toasts ----------
export function toast(msg, kind = '') {
  let host = document.getElementById('fq-toasts');
  if (!host) { host = document.createElement('div'); host.id = 'fq-toasts'; host.setAttribute('role', 'status'); host.setAttribute('aria-live', 'polite'); document.body.append(host); }
  const el = document.createElement('div');
  el.className = `fq-toast ${kind}`;
  el.innerHTML = (kind === 'coin' ? icon('coin') : kind === 'ok' ? icon('check') : kind === 'err' ? icon('info') : '') + `<span>${esc(msg)}</span>`;
  host.append(el);
  while (host.children.length > 3) host.firstElementChild.remove();
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, kind === 'err' ? 4200 : 2600);
}

// ---------- dialogs ----------
export function dialog({ title = '', body = '', actions = [], wide = false, onMount, dismissible = true }) {
  return new Promise(resolve => {
    const d = document.createElement('dialog');
    d.className = `fq-dialog fq-scope${wide ? ' wide' : ''}`;
    d.innerHTML = `<form method="dialog" class="fq-dlg-body">${title ? `<h2>${esc(title)}</h2>` : ''}<div class="fq-dlg-content">${body}</div>` +
      (actions.length ? `<div class="fq-dlg-actions">${actions.map((a, i) => `<button class="fq-btn ${a.kind || ''}" value="${i}" ${a.autofocus ? 'autofocus' : ''}>${esc(a.label)}</button>`).join('')}</div>` : '') + `</form>`;
    document.body.append(d);
    let result = null;
    d.addEventListener('close', () => { d.remove(); resolve(result); });
    d.addEventListener('cancel', e => { if (!dismissible) e.preventDefault(); });
    d.querySelector('form').addEventListener('submit', e => {
      const v = e.submitter?.value;
      if (v !== undefined && actions[+v]) result = actions[+v].value ?? +v;
    });
    const api = { el: d, close: v => { result = v; d.close(); } };
    d.showModal();
    onMount?.(api);
  });
}
export function confirmDialog({ title, body, confirm = t('common.confirm', 'Confirm'), cancel = t('common.cancel', 'Cancel'), kind = 'primary' }) {
  return dialog({ title, body: `<p>${body}</p>`, actions: [{ label: cancel, value: false }, { label: confirm, value: true, kind, autofocus: true }] }).then(v => v === true);
}

// ---------- busy buttons ----------
export async function busy(btn, fn) {
  if (!btn) return fn();
  if (btn.getAttribute('aria-busy') === 'true') return;
  btn.setAttribute('aria-busy', 'true'); btn.disabled = true;
  try { return await fn(); } finally { if (btn.isConnected) { btn.removeAttribute('aria-busy'); btn.disabled = false; } }
}

// ---------- sound (tiny WebAudio synth, no files) ----------
let ac;
export function sound(kind) {
  if (!prefs.sound) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    const notes = { tap: [[880, .05]], flip: [[660, .05]], coin: [[988, .07], [1319, .12]], ok: [[660, .08], [880, .08], [1175, .14]],
      bad: [[300, .12], [220, .16]], open: [[523, .08], [659, .08], [784, .08], [1047, .2]], click: [[600, .03]] }[kind] || [[700, .05]];
    let at = ac.currentTime;
    for (const [f, d] of notes) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.12, at + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, at + d);
      o.connect(g).connect(ac.destination); o.start(at); o.stop(at + d + 0.02); at += d * 0.9;
    }
  } catch { /* audio unavailable */ }
}

// ---------- confetti ----------
export function confetti(n = 60) {
  if (!prefs.motion) return;
  const host = document.createElement('div'); host.className = 'fq-confetti';
  const colors = ['#ff9fc0', '#ffd76a', '#a3e3bd', '#8fb8f5', '#b9a5ee', '#ffb36b'];
  for (let i = 0; i < n; i++) {
    const c = document.createElement('i');
    c.style.left = Math.random() * 100 + 'vw'; c.style.background = colors[i % colors.length];
    c.style.animationDelay = Math.random() * 0.4 + 's'; c.style.animationDuration = 1.2 + Math.random() * 0.9 + 's';
    host.append(c);
  }
  document.body.append(host); setTimeout(() => host.remove(), 2600);
}

export const debounce = (fn, ms) => { let tm; return (...a) => { clearTimeout(tm); tm = setTimeout(() => fn(...a), ms); }; };
export const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); }));
