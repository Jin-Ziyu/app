// App state: catalogue (static per session) + the signed-in user's state from fq_get_state().
import { rpc, avatarUrl, isLocal } from './api.js';
import { L } from './i18n.js';

export const store = {
  user: null,          // Supabase auth user
  catalog: null,       // { items, boxes, achievements, games }
  items: new Map(),    // id -> item
  state: null,         // fq_get_state() result
  customUrl: null,     // object URL for an uploaded avatar image
  leaderboard: null,
  error: null,
};
const listeners = new Set();
export const onChange = fn => (listeners.add(fn), () => listeners.delete(fn));
export const emit = () => listeners.forEach(fn => { try { fn(store); } catch (e) { console.error(e); } });

export async function loadCatalog() {
  const c = await rpc('fq_get_catalog');
  store.catalog = c;
  store.items = new Map(c.items.map(i => [i.id, i]));
}
export async function refresh({ silent = false } = {}) {
  try {
    const s = await rpc('fq_get_state');
    store.state = s; store.error = null;
    const av = s.profile.avatar;
    store.customUrl = av.mode === 'custom' ? await avatarUrl(av.custom_path) : null;
  } catch (e) {
    store.error = e;
    if (!silent) throw e;
  } finally { emit(); }
}
// Apply a balance returned by a mutating RPC immediately, then refresh in the background.
export function applyBalance(balance) {
  if (store.state && Number.isFinite(balance)) { store.state.profile.points = balance; emit(); }
  refresh({ silent: true });
}

export const profile = () => store.state?.profile;
export const SLOTS = ['species', 'hair', 'top', 'bottom', 'dress', 'outfit', 'shoes', 'hat', 'glasses', 'jewelry', 'wings', 'bag', 'held', 'background', 'frame', 'pose', 'effect'];
export const REQUIRED = ['species', 'hair', 'background', 'pose', 'frame'];
export const RARITY_ORDER = { Common: 1, Rare: 2, Epic: 3, Legendary: 4 };
export const RARITY_COLOR = { Common: '#9fd9bf', Rare: '#8fb8f5', Epic: '#c39bff', Legendary: '#ffcf4d' };

export function ownedSet() {
  const s = new Set((store.state?.inventory || []).map(i => i.item_id));
  // The shop and blind boxes were removed, so in offline mode every item is unlocked.
  for (const it of store.items.values()) if (it.starter || isLocal()) s.add(it.id);
  return s;
}
export const isOwned = id => ownedSet().has(id);
export const itemName = it => L(it, 'name');
export function equippedIds(av = profile()?.avatar) { return new Set(SLOTS.map(s => av?.[s]).filter(Boolean)); }
export function collectible() { return [...store.items.values()].filter(i => !i.starter); }
export function collectionStats() {
  const all = collectible(); const own = new Set((store.state?.inventory || []).map(i => i.item_id));
  const have = all.filter(i => own.has(i.id));
  const by = (key) => { const m = {}; for (const i of all) { const k = i[key]; m[k] = m[k] || { total: 0, have: 0 }; m[k].total++; if (own.has(i.id)) m[k].have++; } return m; };
  return { total: all.length, have: have.length, pct: all.length ? Math.round(have.length / all.length * 100) : 0, rarity: by('rarity'), slot: by('slot') };
}
export function boxesFor(itemId) { const it = store.items.get(itemId); return (store.catalog?.boxes || []).filter(b => it?.boxes?.includes(b.id)); }
