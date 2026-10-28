// Reusable view fragments (return HTML strings).
import { renderAvatar, tryOn, SLOT_VIEW } from './avatar.js';
import { store, itemName, RARITY_COLOR, profile } from './store.js';
import { t, L } from './i18n.js';
import { esc, fmt, fmtTime } from './ui.js';
import { icon } from './icons.js';

export const slotLabel = s => t('slot.' + s, { species: 'Character', hair: 'Hair', top: 'Tops', bottom: 'Bottoms', dress: 'Dresses', outfit: 'Outfits', shoes: 'Shoes',
  hat: 'Hats & bows', glasses: 'Glasses', jewelry: 'Jewellery', wings: 'Wings', bag: 'Bags', held: 'Held items', background: 'Backgrounds', frame: 'Frames', pose: 'Poses', effect: 'Effects' }[s]);
export const rarityLabel = r => t('rarity.' + r, r);
export const rarityBadge = r => `<span class="fq-badge r-${esc(r)}">${esc(rarityLabel(r))}</span>`;

export function avatarSvg(av = profile()?.avatar, opts = {}) {
  return renderAvatar(av, store.items, { customUrl: av?.mode === 'custom' ? (opts.customUrl ?? store.customUrl) : null, title: opts.title || t('nav.avatar', 'My avatar'), ...opts });
}
export function itemThumb(it, base = profile()?.avatar) {
  return renderAvatar(tryOn({ ...base, mode: 'built' }, it), store.items, { view: SLOT_VIEW[it.slot] || 'full', animate: false, title: itemName(it) });
}
export const coins = n => `<span class="fq-num">${fmt(n)}</span>`;
export const pointsPill = n => `<span class="fq-pill coin">${icon('coin')}${coins(n)}</span>`;
export const bar = (v, max, cls = '') => `<div class="fq-bar ${cls}" role="progressbar" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${v}"><span style="width:${max ? Math.min(100, v / max * 100) : 0}%"></span></div>`;
export const ring = (pct, label = pct + '%') => `<div class="fq-ring" style="--p:${pct}"><span>${esc(label)}</span></div>`;
export const empty = (msg, ic = 'sparkle', action = '') => `<div class="fq-empty">${icon(ic)}<span>${esc(msg)}</span>${action}</div>`;
export const errorBox = (msg, retryAttr = 'data-fq-retry') => `<div class="fq-error" role="alert"><span>${esc(msg)}</span><button class="fq-btn sm" ${retryAttr}>${icon('refresh')}${esc(t('common.retry', 'Retry'))}</button></div>`;
export const skeleton = (n = 3, h = 90) => `<div class="fq-grid" style="--min:220px">${Array.from({ length: n }, () => `<div class="fq-skel" style="height:${h}px"></div>`).join('')}</div>`;

const TX_LABEL = { welcome: 'Welcome gift', daily: 'Daily login', game: 'Game reward', shop: 'Shop purchase', blind_box: 'Blind box', duplicate: 'Duplicate refund',
  mission: 'Mission reward', achievement: 'Achievement', challenge: 'Daily Challenge', migration: 'v1 balance carried over' };
export function txDescription(tx) {
  const r = tx.ref || {};
  const it = r.item_id && store.items.get(r.item_id);
  const box = r.box_id && store.catalog?.boxes.find(b => b.id === r.box_id);
  if (tx.kind === 'shop' && it) return `${t('tx.shop', 'Shop purchase')} · ${itemName(it)}`;
  if (tx.kind === 'blind_box' && box) return `${t('tx.blind_box', 'Blind box')} · ${L(box)}`;
  if (tx.kind === 'duplicate' && it) return `${t('tx.duplicate', 'Duplicate refund')} · ${itemName(it)}`;
  if (tx.kind === 'achievement' && r.achievement) { const a = store.catalog?.achievements.find(x => x.id === r.achievement); if (a) return `${t('tx.achievement', 'Achievement')} · ${L(a, 'title')}`; }
  if (tx.kind === 'mission' || tx.kind === 'game' || tx.kind === 'challenge') return tx.description;
  return t('tx.' + tx.kind, TX_LABEL[tx.kind] || tx.description);
}
export function txList(list, limit = 50) {
  if (!list?.length) return empty(t('tx.none', 'No point transactions yet.'), 'coin');
  return `<div class="fq-list">${list.slice(0, limit).map(tx => `<div class="fq-li">
      <div class="grow"><b>${esc(txDescription(tx))}</b><small>${esc(fmtTime(tx.created_at))} · ${t('common.points', 'Fan Points')}: ${fmt(tx.balance_after)}</small></div>
      <span class="fq-amt ${tx.amount >= 0 ? 'pos' : 'neg'}">${tx.amount > 0 ? '+' : ''}${fmt(tx.amount)}</span></div>`).join('')}</div>`;
}
export function missionIcon(id) {
  return { m_login: 'calendar', m_play2: 'gamepad', m_play4: 'joystick', m_trivia3: 'bulb', m_tap: 'bolt', m_memory: 'cards', m_style: 'avatar', m_box: 'gift', m_shop: 'bag', m_challenge: 'target' }[id] || 'scroll';
}
export function missionRow(m) {
  const done = m.progress >= m.target;
  return `<div class="fq-mission ${m.claimed ? 'done' : ''}">
    <div class="ic">${icon(m.claimed ? 'check' : missionIcon(m.id))}</div>
    <div style="min-width:0"><b class="fq-h3">${esc(L(m, 'title'))}</b>
      <div class="fq-row" style="margin-top:6px;gap:8px;flex-wrap:nowrap"><div style="flex:1;min-width:60px">${bar(m.progress, m.target, 'sm')}</div><span class="fq-num fq-small" style="font-weight:800">${m.progress}/${m.target}</span></div></div>
    ${m.claimed ? `<span class="fq-badge ok">${icon('check')} ${esc(t('common.claimed', 'Claimed'))}</span>`
      : `<button class="fq-btn sm ${done ? 'gold' : ''}" data-claim-mission="${esc(m.id)}" ${done ? '' : 'disabled'}>${icon('coin')} +${m.reward}</button>`}
  </div>`;
}
export function itemCard(it, { owned, equipped, action = '', clickAttr = '', showPrice = true, base } = {}) {
  const how = !owned && it.price ? `<span class="price">${icon('coin')}${fmt(it.price)}</span>` : '';
  const tag = clickAttr ? 'button' : 'div';
  return `<${tag} class="fq-item r-${esc(it.rarity)} ${owned ? '' : 'locked'} ${equipped ? 'equipped' : ''}" ${clickAttr} ${tag === 'button' ? `type="button" aria-pressed="${!!equipped}" aria-label="${esc(itemName(it))}${owned ? '' : ' (' + esc(t('common.locked', 'Locked')) + ')'}"` : ''}>
    <div class="thumb">${itemThumb(it, base)}</div>
    <div class="nm">${esc(itemName(it))}</div>
    <div class="meta">${rarityBadge(it.rarity)}${showPrice ? how : ''}</div>${action}</${tag}>`;
}
export function rarityVar(r) { return `--rc:${RARITY_COLOR[r] || 'var(--acc)'}`; }

// Berry, the app's own little strawberry mascot (original drawing).
export const BERRY = `<svg class="fq-berry-svg" viewBox="0 0 120 130" aria-hidden="true">
  <path d="M60 126C30 126 10 92 10 62c0-18 14-30 30-30 8 0 15 3 20 7 5-4 12-7 20-7 16 0 30 12 30 30 0 30-20 64-50 64z" fill="#ef4a63"/>
  <path d="M60 126C30 126 10 92 10 62c0-6 2-11 5-16-1 30 18 66 45 72 27-6 46-42 45-72 3 5 5 10 5 16 0 30-20 64-50 64z" fill="#d23250" opacity=".55"/>
  <g fill="#ffe7a3">${[[34, 70], [50, 96], [86, 70], [70, 98], [60, 116], [28, 90], [92, 90], [44, 58], [78, 58]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2.6" ry="4"/>`).join('')}</g>
  <path d="M60 40c-6-12-20-18-34-14 8 4 14 9 18 15-10-1-20 3-24 11 14 2 28-2 40-10 12 8 26 12 40 10-4-8-14-12-24-11 4-6 10-11 18-15-14-4-28 2-34 14z" fill="#59b85c"/>
  <path d="M60 40c0-12 3-24 10-32" stroke="#3f8f45" stroke-width="5" stroke-linecap="round" fill="none"/>
  <ellipse cx="44" cy="80" rx="7" ry="4.5" fill="#ff9fb1" opacity=".9"/><ellipse cx="76" cy="80" rx="7" ry="4.5" fill="#ff9fb1" opacity=".9"/>
  <ellipse cx="47" cy="72" rx="4.5" ry="5.5" fill="#3a1a22"/><ellipse cx="73" cy="72" rx="4.5" ry="5.5" fill="#3a1a22"/>
  <circle cx="48.5" cy="70" r="1.6" fill="#fff"/><circle cx="74.5" cy="70" r="1.6" fill="#fff"/>
  <path d="M54 82q6 6 12 0" stroke="#3a1a22" stroke-width="3" stroke-linecap="round" fill="none"/></svg>`;
