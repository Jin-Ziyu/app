// Offline mode: a browser-only backend with the same interface as the Supabase client
// (auth, rpc, storage) used when config.js has no Supabase project.
//
// It runs the same game rules as the database functions in supabase/migrations
// (points ledger, idempotent purchases, box odds, game checks, missions, achievements),
// but everything is stored in THIS browser's localStorage. Data does not sync across
// devices and can be edited by anyone with access to the browser. Use Supabase for
// real accounts and tamper-proof points.
import { ITEMS, BOXES, DUPLICATE_REFUND, MISSIONS, CHALLENGES, ACHIEVEMENTS, TRIVIA } from './catalog-data.js';

const KEY = 'fq:local:v1', SESSION = 'fq:local:session', UP = 'fq:local:upload:';
const DOMAIN = 'fanquest.app';
const SLOTS = ['species', 'hair', 'top', 'bottom', 'dress', 'outfit', 'shoes', 'hat', 'glasses', 'jewelry', 'wings', 'bag', 'held', 'background', 'frame', 'pose', 'effect'];
const REQUIRED_DEF = { species: 'sp_bunny', hair: 'hair_bob', background: 'bg_sky', pose: 'ps_wave', frame: 'fr_round' };
const DEFAULT_AVATAR = { species: 'sp_bunny', hair: 'hair_bob', top: 'top_tee_pink', bottom: 'bot_skirt_pink', dress: null, outfit: null, shoes: 'sh_sneakers',
  hat: 'hat_bow', glasses: null, jewelry: null, wings: null, bag: null, held: 'hd_lightstick', background: 'bg_sky', frame: 'fr_round', pose: 'ps_wave',
  effect: 'fx_sparkles', skin: '#fff3f7', eyes: '#4a3b6b', hair_color: '#8a5a44', mode: 'built', custom_path: null };
const WIDGETS = ['fandom', 'schedule', 'todo', 'life', 'points', 'avatar', 'daily', 'missions', 'challenge', 'games', 'collection', 'achievements', 'transactions', 'leaderboard', 'tracker'];
const DEFAULT_SETTINGS = { theme: 'light', accent: 'pastel', accent_custom: '#b9a5ee', background: 'hearts', decor: true, density: 'comfortable', font_scale: 1,
  sidebar: 'expanded', sound: true, motion: true, language: 'en', widgets: WIDGETS.map(id => ({ id, on: true })) };
const GAME = {
  quick_tap: { easy: { duration: 15, multiplier: 0.5, cap: 25, max_rate: 12, daily_rewarded: 5 }, normal: { duration: 10, multiplier: 0.8, cap: 35, max_rate: 12, daily_rewarded: 5 }, hard: { duration: 8, multiplier: 1.2, cap: 45, max_rate: 12, daily_rewarded: 5 } },
  memory_match: { easy: { pairs: 6, base: 15, time_limit: 0, daily_rewarded: 5 }, normal: { pairs: 8, base: 25, time_limit: 0, daily_rewarded: 5 }, hard: { pairs: 10, base: 35, time_limit: 90, daily_rewarded: 5 } },
  trivia: { easy: { questions: 5, seconds: 20, per_correct: 10, daily_cap: 100 }, normal: { questions: 5, seconds: 15, per_correct: 10, daily_cap: 100 }, hard: { questions: 5, seconds: 12, per_correct: 10, daily_cap: 100 } },
};
const RANK = { easy: 1, normal: 2, hard: 3 };
const ITEM = new Map(ITEMS.map((it, i) => [it.id, { ...it, sort: i }]));
const QUESTIONS = TRIVIA.map((q, i) => ({ id: i + 1, level: q[0], question: q[1], question_zh: q[2], choices: q[3], choices_zh: q[4], answer: q[5] }));

class Fail extends Error {}
const fail = key => { throw new Fail(key); };
const clone = o => JSON.parse(JSON.stringify(o));
const now = () => new Date().toISOString();
const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Singapore' });
const addDays = (d, n) => { const x = new Date(d + 'T00:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const rand = () => crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
const pick = arr => arr[Math.floor(rand() * arr.length)];
const shuffle = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const hash = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const isHex = v => typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v);
const uuid = () => crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = rand() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); });

// Built-in demo account, created automatically in every browser.
// Only a salted PBKDF2-SHA256 hash is stored here; the password itself is not in the code.
// If the user later changes the password in the app, the new hash is kept in this browser.
const DEMO = { id: '6a756a69-616e-4000-8000-000000000001', username: 'jujiang', email: 'jujiang@' + 'fanquest.app',
  salt: '4NrxVLuTj2FToUJkfPBrmQ==', hash: 'uNzuOqoqiCsCXS2c8aig1SSzzEqJs+wIg7BSrZcW8Wc=' };

// ---------- persistence ----------
function load() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { /* corrupt or blocked */ }
  if (!d || !d.users) d = { users: {}, data: {} };
  if (!Object.values(d.users).some(u => u.username === DEMO.username)) {
    d.users[DEMO.id] = { id: DEMO.id, email: DEMO.email, username: DEMO.username, salt: DEMO.salt, hash: DEMO.hash, created_at: now() };
    d.data[DEMO.id] = newUserData(DEMO.id, DEMO.username);
    addPoints(d.data[DEMO.id], 100, 'welcome', 'Welcome gift');
    try { localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* blocked: works for this session only */ }
  }
  return d;
}
function save(db) {
  try { localStorage.setItem(KEY, JSON.stringify(db)); }
  catch { fail('storage_full'); }
}

// ---------- password hashing (PBKDF2-SHA256) ----------
const enc = new TextEncoder();
const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
async function derive(password, salt) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  return b64(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' }, key, 256));
}
async function hashPassword(pw) { const salt = crypto.getRandomValues(new Uint8Array(16)); return { salt: b64(salt), hash: await derive(pw, salt) }; }
async function checkPassword(pw, u) { return (await derive(pw, unb64(u.salt))) === u.hash; }

// ---------- per-user helpers (mirror of fq_private.*) ----------
function newUserData(uid, username) {
  return {
    profile: { username, display_name: username, points: 0, lifetime_points: 0, streak: 0, best_streak: 0, last_login_day: null,
      avatar: clone(DEFAULT_AVATAR), settings: clone(DEFAULT_SETTINGS), show_on_leaderboard: false, created_at: now() },
    inventory: [], transactions: [], requests: {}, claims: {}, ach: {}, ev: {}, totals: {}, sessions: {}, games: {}, looks: [], txSeq: 0,
  };
}
function prune(u) {
  const d = today(), keep = new Set([0, 1, 2, 3, 4, 5, 6].map(n => addDays(d, -n)));
  for (const k of Object.keys(u.ev)) if (!keep.has(k)) delete u.ev[k];
  for (const [id, s] of Object.entries(u.sessions)) if (s.day !== d) delete u.sessions[id];
  for (const k of Object.keys(u.claims)) if (!k.endsWith('|' + d) && !k.endsWith('|' + addDays(d, -1))) delete u.claims[k];
  u.transactions = u.transactions.slice(0, 200);
  const reqs = Object.entries(u.requests).sort((a, b) => b[1].at.localeCompare(a[1].at)).slice(0, 100);
  u.requests = Object.fromEntries(reqs);
}
function addPoints(u, amount, kind, description, ref = {}) {
  const p = u.profile;
  if (amount < 0 && p.points < -amount) fail('insufficient_points');
  if (amount === 0) return p.points;
  p.points += amount; if (amount > 0) p.lifetime_points += amount;
  u.transactions.unshift({ id: ++u.txSeq, amount, balance_after: p.points, kind, description, ref, created_at: now() });
  return p.points;
}
function logEvent(u, kind, value = 1) {
  const d = today(); u.ev[d] = u.ev[d] || {}; u.ev[d][kind] = (u.ev[d][kind] || 0) + value;
  const t = u.totals[kind] || (u.totals[kind] = { count: 0, sum: 0 }); t.count++; t.sum += value;
}
// Shop and blind boxes were removed: every catalog item is free to wear.
const owns = (u, id) => !!ITEM.get(id);
const claimKey = (k, d = today()) => `${k}|${d}`;
function claimOnce(u, k, d) { const key = claimKey(k, d); if (u.claims[key]) return false; u.claims[key] = true; return true; }
function replay(u, req, action) {
  if (!req) fail('invalid_request');
  const r = u.requests[req]; if (!r) return null;
  if (r.action !== action) fail('invalid_request');
  return { ...r.result, replayed: true };
}
const remember = (u, req, action, result) => { u.requests[req] = { action, result, at: now() }; };

function validateAvatar(uid, u, p) {
  if (!p || typeof p !== 'object') fail('invalid_avatar');
  const out = {};
  for (const s of SLOTS) {
    const v = p[s] || null;
    if (!v) { out[s] = REQUIRED_DEF[s] || null; continue; }
    const it = ITEM.get(v);
    if (!it || it.slot !== s) fail('invalid_avatar');
    if (!owns(u, v)) fail('item_not_owned');
    out[s] = v;
  }
  for (const [c, def] of [['skin', '#fff3f7'], ['eyes', '#4a3b6b'], ['hair_color', '#6b4a3a']]) {
    if (p[c] != null && !isHex(p[c])) fail('invalid_avatar');
    out[c] = (p[c] || def).toLowerCase();
  }
  if ((p.mode || 'built') === 'custom') {
    const path = p.custom_path;
    if (!path || !new RegExp(`^${uid}/[A-Za-z0-9_-]{1,64}\\.(png|jpg|jpeg|webp)$`).test(path)) fail('invalid_avatar');
    let exists = false; try { exists = localStorage.getItem(UP + path) != null; } catch { /* blocked */ }
    if (!exists) fail('invalid_avatar');
    out.mode = 'custom'; out.custom_path = path;
  } else { out.mode = 'built'; out.custom_path = null; }
  return out;
}
function validateSettings(p) {
  const o = clone(DEFAULT_SETTINGS);
  const pickIn = (k, list) => { if (list.includes(p[k])) o[k] = p[k]; };
  pickIn('theme', ['light', 'dark', 'system']); pickIn('accent', ['pastel', 'pink', 'purple', 'blue', 'mint', 'custom']);
  if (isHex(p.accent_custom)) o.accent_custom = p.accent_custom.toLowerCase();
  pickIn('background', ['plain', 'hearts', 'stars', 'clouds', 'dots']); pickIn('density', ['compact', 'comfortable', 'spacious']);
  pickIn('sidebar', ['expanded', 'collapsed', 'hidden']); pickIn('language', ['en', 'zh']);
  for (const b of ['decor', 'sound', 'motion']) if (typeof p[b] === 'boolean') o[b] = p[b];
  if (typeof p.font_scale === 'number' && p.font_scale >= 0.85 && p.font_scale <= 1.3) o.font_scale = Math.round(p.font_scale * 100) / 100;
  if (Array.isArray(p.widgets)) {
    const seen = new Set(), w = [];
    for (const x of p.widgets) if (WIDGETS.includes(x?.id) && !seen.has(x.id)) { seen.add(x.id); w.push({ id: x.id, on: x.on !== false }); }
    for (const id of WIDGETS) if (!seen.has(id)) w.push({ id, on: true });
    o.widgets = w;
  }
  return o;
}
function missionsFor(uid, d) {
  const others = MISSIONS.filter(m => m.id !== 'm_login').sort((a, b) => hash(uid + d + a.id) - hash(uid + d + b.id)).slice(0, 2);
  return [MISSIONS.find(m => m.id === 'm_login'), ...others];
}
const progress = (u, event, d = today()) => (u.ev[d] && u.ev[d][event]) || 0;
function challengeFor(d) {
  const list = [...CHALLENGES].sort((a, b) => a.id.localeCompare(b.id));
  const n = Math.round((Date.parse(d + 'T00:00:00Z') - Date.parse('2026-01-01T00:00:00Z')) / 864e5);
  return list[((n % list.length) + list.length) % list.length];
}
function metric(u, m) {
  const t = k => u.totals[k] || { count: 0, sum: 0 };
  switch (m) {
    case 'logins': return t('daily_login').count;
    case 'best_streak': return u.profile.best_streak;
    case 'games_played': return t('game_finished').count;
    case 'trivia_correct': return t('trivia_correct').sum;
    case 'boxes_opened': return t('box_opened').count;
    case 'items_owned': return u.inventory.length;
    case 'legendary_owned': return u.inventory.filter(v => ITEM.get(v.item_id)?.rarity === 'Legendary').length;
    case 'missions_claimed': return t('mission_claimed').count;
    case 'looks_saved': return u.looks.length;
    case 'points_earned': return u.profile.lifetime_points;
    default: return 0;
  }
}
const sessionsToday = (u, game) => Object.values(u.sessions).filter(s => s.game === game && s.day === today());

// ---------- RPCs (same names/arguments/results as the SQL functions) ----------
const RPC = {
  fq_get_catalog() {
    return {
      items: [...ITEM.values()].map(({ id, slot, name, name_zh, rarity, price, starter, boxes, art, sort }) => ({ id, slot, name, name_zh, rarity, price, starter, boxes, art, sort })),
      boxes: BOXES.map(b => ({ ...b, duplicate_refund: DUPLICATE_REFUND,
        pool: Object.fromEntries(Object.keys(b.odds).map(r => [r, ITEMS.filter(i => i.boxes.includes(b.id) && i.rarity === r).map(i => i.id)]).filter(([, v]) => v.length)) })),
      achievements: ACHIEVEMENTS.map((a, i) => ({ ...a, sort: i })),
      games: clone(GAME),
    };
  },
  fq_get_state(_, uid, u) {
    const d = today(), p = u.profile, ch = challengeFor(d);
    return {
      today: d,
      profile: { ...clone(p), streak: p.last_login_day && p.last_login_day >= addDays(d, -1) ? p.streak : 0,
        avatar: { ...DEFAULT_AVATAR, ...p.avatar }, settings: { ...DEFAULT_SETTINGS, ...p.settings } },
      daily_claimed: !!u.claims[claimKey('daily_login')],
      inventory: clone(u.inventory).sort((a, b) => b.acquired_at.localeCompare(a.acquired_at)),
      transactions: clone(u.transactions.slice(0, 50)),
      looks: clone(u.looks),
      missions: missionsFor(uid, d).map(m => ({ id: m.id, title: m.title, title_zh: m.title_zh, target: m.target, reward: m.reward,
        progress: Math.min(m.target, progress(u, m.event)), claimed: !!u.claims[claimKey('mission:' + m.id)] })),
      challenge: { ...ch, completed: !!u.claims[claimKey('challenge')] },
      achievements: ACHIEVEMENTS.map(a => ({ id: a.id, target: a.target, progress: Math.min(a.target, metric(u, a.metric)), claimed: !!u.ach[a.id] })),
      games: {
        quick_tap: { rewarded_today: sessionsToday(u, 'quick_tap').filter(s => s.awarded > 0).length, best: u.games.quick_tap?.best ?? null, played: u.games.quick_tap?.played || 0 },
        memory_match: { rewarded_today: sessionsToday(u, 'memory_match').filter(s => s.awarded > 0).length, best: u.games.memory_match?.best ?? null, played: u.games.memory_match?.played || 0 },
        trivia: { points_today: sessionsToday(u, 'trivia').reduce((a, s) => a + s.awarded, 0), best: u.games.trivia?.best ?? null, played: u.games.trivia?.played || 0 },
      },
    };
  },
  fq_claim_daily(_, uid, u) {
    const d = today(), p = u.profile;
    if (!claimOnce(u, 'daily_login', d)) return { awarded: 0, already: true };
    const streak = p.last_login_day === addDays(d, -1) ? p.streak + 1 : 1;
    p.streak = streak; p.best_streak = Math.max(p.best_streak, streak); p.last_login_day = d;
    const balance = addPoints(u, 5, 'daily', 'Daily login reward', { day: d, streak });
    logEvent(u, 'daily_login');
    return { awarded: 5, already: false, streak, balance };
  },
  fq_save_avatar({ p_avatar }, uid, u) { const clean = validateAvatar(uid, u, p_avatar); u.profile.avatar = clean; logEvent(u, 'avatar_saved'); return clean; },
  fq_save_settings({ p_settings }, uid, u) { const clean = validateSettings({ ...DEFAULT_SETTINGS, ...u.profile.settings, ...(p_settings || {}) }); u.profile.settings = clean; return clean; },
  fq_set_profile({ p_display_name, p_show_on_leaderboard }, uid, u) {
    const nm = String(p_display_name || '').replace(/[\u0000-\u001f<>]/g, '').trim();
    if (nm.length < 1 || nm.length > 24) fail('invalid_name');
    u.profile.display_name = nm; u.profile.show_on_leaderboard = !!p_show_on_leaderboard;
    return { display_name: nm, show_on_leaderboard: !!p_show_on_leaderboard };
  },
  fq_buy_item({ p_item_id, p_request_id }, uid, u) {
    const prev = replay(u, p_request_id, 'buy'); if (prev) return prev;
    const it = ITEM.get(p_item_id); if (!it) fail('unknown_item');
    if (!it.price || it.starter) fail('not_for_sale');
    if (owns(u, it.id)) fail('already_owned');
    const balance = addPoints(u, -it.price, 'shop', 'Bought ' + it.name, { item_id: it.id });
    u.inventory.push({ item_id: it.id, source: 'shop', acquired_at: now() });
    logEvent(u, 'item_bought');
    const res = { item_id: it.id, cost: it.price, balance, replayed: false };
    remember(u, p_request_id, 'buy', res); return res;
  },
  fq_open_box({ p_box_id, p_request_id }, uid, u) {
    const prev = replay(u, p_request_id, 'box'); if (prev) return prev;
    const b = BOXES.find(x => x.id === p_box_id); if (!b) fail('box_unavailable');
    let balance = addPoints(u, -b.cost, 'blind_box', 'Opened ' + b.name, { box_id: b.id });
    const order = ['Common', 'Rare', 'Epic', 'Legendary'].filter(r => b.odds[r]);
    const total = order.reduce((a, r) => a + b.odds[r], 0);
    let roll = rand() * total, rarity = order[order.length - 1];
    for (const r of order) { roll -= b.odds[r]; if (roll < 0) { rarity = r; break; } }
    const pool = ITEMS.filter(i => i.boxes.includes(b.id) && i.rarity === rarity);
    if (!pool.length) fail('box_misconfigured');
    const fresh = pool.filter(i => !owns(u, i.id));
    let item, duplicate = false, refund = 0;
    if (fresh.length) { item = pick(fresh); u.inventory.push({ item_id: item.id, source: 'box:' + b.id, acquired_at: now() }); }
    else { item = pick(pool); duplicate = true; refund = DUPLICATE_REFUND[rarity] || 0; if (refund) balance = addPoints(u, refund, 'duplicate', 'Duplicate refund', { item_id: item.id, box_id: b.id }); }
    logEvent(u, 'box_opened');
    const res = { box_id: b.id, item_id: item.id, rarity, duplicate, refund, cost: b.cost, balance, replayed: false };
    remember(u, p_request_id, 'box', res); return res;
  },
  fq_start_game({ p_game, p_difficulty }, uid, u) {
    const cfg = GAME[p_game]?.[p_difficulty]; if (!cfg) fail('unknown_game');
    if (Object.keys(u.sessions).length >= 300) fail('rate_limited');
    for (const s of Object.values(u.sessions)) if (s.game === p_game && s.status === 'active') s.status = 'abandoned';
    let questions = [];
    if (p_game === 'trivia') {
      const lv = { easy: ['easy'], normal: ['easy', 'normal'], hard: ['normal', 'hard'] }[p_difficulty];
      questions = shuffle(QUESTIONS.filter(q => lv.includes(q.level))).slice(0, cfg.questions).map(q => q.id);
    }
    const id = uuid();
    u.sessions[id] = { id, game: p_game, difficulty: p_difficulty, status: 'active', questions, answers: {}, started: Date.now(), day: today(), awarded: 0 };
    return { session_id: id, game: p_game, difficulty: p_difficulty, config: { ...cfg },
      questions: p_game === 'trivia' ? questions.map(qid => { const q = QUESTIONS[qid - 1]; return { id: q.id, question: q.question, question_zh: q.question_zh, choices: q.choices, choices_zh: q.choices_zh }; }) : null };
  },
  fq_answer_trivia({ p_session_id, p_question_id, p_choice }, uid, u) {
    const s = u.sessions[p_session_id];
    if (!s || s.game !== 'trivia' || s.status !== 'active') fail('session_invalid');
    if (Date.now() - s.started > 600000) fail('session_expired');
    if (!s.questions.includes(p_question_id)) fail('session_invalid');
    if (s.answers[p_question_id] !== undefined) fail('already_answered');
    const q = QUESTIONS[p_question_id - 1], ok = p_choice === q.answer;
    s.answers[p_question_id] = ok;
    let awarded = 0;
    if (ok) {
      const cfg = GAME.trivia[s.difficulty];
      const todayPts = sessionsToday(u, 'trivia').reduce((a, x) => a + x.awarded, 0);
      awarded = Math.max(0, Math.min(cfg.per_correct, cfg.daily_cap - todayPts));
      if (awarded) { addPoints(u, awarded, 'game', 'Trivia: correct answer', { session_id: s.id }); s.awarded += awarded; }
      logEvent(u, 'trivia_correct');
    }
    return { correct: ok, answer: q.answer, awarded, balance: u.profile.points };
  },
  fq_finish_game({ p_session_id, p_score, p_moves }, uid, u) {
    const s = u.sessions[p_session_id];
    if (!s || s.status !== 'active') fail('session_invalid');
    const elapsed = (Date.now() - s.started) / 1000;
    if (elapsed > 1800) fail('session_expired');
    const cfg = GAME[s.game][s.difficulty];
    let score = 0, moves = null, award = 0, practice = false, reason = null;
    const rewarded = () => sessionsToday(u, s.game).filter(x => x.awarded > 0).length;
    if (s.game === 'quick_tap') {
      score = Math.max(0, p_score | 0);
      if (elapsed < cfg.duration - 1) fail('too_fast');
      if (score > cfg.duration * cfg.max_rate) fail('score_rejected');
      if (rewarded() >= cfg.daily_rewarded) practice = true; else award = Math.min(cfg.cap, Math.floor(score * cfg.multiplier));
    } else if (s.game === 'memory_match') {
      moves = p_moves | 0;
      if (moves < cfg.pairs) fail('score_rejected');
      if (elapsed < cfg.pairs) fail('too_fast');
      score = Math.max(5, cfg.base - Math.max(0, moves - Math.ceil(cfg.pairs * 1.5)));
      if (cfg.time_limit > 0 && elapsed > cfg.time_limit + 5) { score = 0; reason = 'time_up'; }
      if (rewarded() >= cfg.daily_rewarded) practice = true; else award = score;
    } else score = Object.values(s.answers).filter(Boolean).length;
    let balance = u.profile.points;
    if (award > 0) { balance = addPoints(u, award, 'game', s.game === 'quick_tap' ? 'Quick Tap reward' : 'Memory Match reward', { session_id: s.id, score }); s.awarded += award; }
    s.status = 'finished'; s.score = score; s.moves = moves;
    const g = u.games[s.game] || (u.games[s.game] = { played: 0, best: null });
    g.played++;
    g.best = s.game === 'memory_match' ? (g.best == null ? moves : Math.min(g.best, moves)) : Math.max(g.best ?? 0, score);
    logEvent(u, 'game_finished'); logEvent(u, s.game + '_finished');
    const ch = challengeFor(s.day);
    let chDone = false, chAward = 0;
    if (ch.game === s.game && RANK[s.difficulty] >= RANK[ch.difficulty] && !reason) {
      const met = ch.metric === 'moves' ? moves != null && moves <= ch.target : score >= ch.target;
      if (met && claimOnce(u, 'challenge', s.day)) { chDone = true; chAward = ch.reward; balance = addPoints(u, ch.reward, 'challenge', 'Daily Challenge: ' + ch.title, { challenge: ch.id }); logEvent(u, 'challenge_done'); }
    }
    return { game: s.game, score, moves, awarded: award, practice, reason, challenge_completed: chDone, challenge_awarded: chAward, balance,
      total_awarded: award + chAward + (s.game === 'trivia' ? s.awarded : 0) };
  },
  fq_claim_mission({ p_mission_id }, uid, u) {
    const m = missionsFor(uid, today()).find(x => x.id === p_mission_id); if (!m) fail('mission_unavailable');
    if (progress(u, m.event) < m.target) fail('not_completed');
    if (!claimOnce(u, 'mission:' + m.id, today())) fail('already_claimed');
    const balance = addPoints(u, m.reward, 'mission', 'Mission: ' + m.title, { mission: m.id });
    logEvent(u, 'mission_claimed');
    return { mission: m.id, awarded: m.reward, balance };
  },
  fq_claim_achievement({ p_achievement_id }, uid, u) {
    const a = ACHIEVEMENTS.find(x => x.id === p_achievement_id); if (!a) fail('unknown_achievement');
    if (metric(u, a.metric) < a.target) fail('not_completed');
    if (u.ach[a.id]) fail('already_claimed');
    u.ach[a.id] = now();
    const balance = addPoints(u, a.reward, 'achievement', 'Achievement: ' + a.title, { achievement: a.id });
    return { achievement: a.id, awarded: a.reward, balance };
  },
  fq_save_look({ p_name, p_avatar }, uid, u) {
    const nm = String(p_name || '').replace(/[\u0000-\u001f<>]/g, '').trim();
    if (nm.length < 1 || nm.length > 24) fail('invalid_name');
    if (u.looks.length >= 12) fail('too_many_looks');
    const look = { id: uuid(), name: nm, avatar: validateAvatar(uid, u, p_avatar), created_at: now() };
    u.looks.push(look); return clone(look);
  },
  fq_delete_look({ p_look_id }, uid, u) {
    const i = u.looks.findIndex(l => l.id === p_look_id); if (i < 0) fail('not_found');
    u.looks.splice(i, 1); return { deleted: p_look_id };
  },
  fq_leaderboard(_, uid, u, db) {
    const rows = Object.entries(db.data).filter(([, x]) => x.profile.show_on_leaderboard)
      .map(([id, x]) => ({ id, name: x.profile.display_name || x.profile.username, points: x.profile.lifetime_points }))
      .sort((a, b) => b.points - a.points);
    const ranked = rows.map(r => ({ ...r, rank: 1 + rows.filter(o => o.points > r.points).length }));
    const me = ranked.find(r => r.id === uid);
    return { top: ranked.filter(r => r.rank <= 10).map(r => ({ rank: r.rank, name: r.name, points: r.points, me: r.id === uid })),
      me: me ? { rank: me.rank, points: me.points } : null, opted_in: u.profile.show_on_leaderboard };
  },
};
const READ_ONLY = new Set(['fq_get_catalog', 'fq_get_state', 'fq_leaderboard']);

// ---------- Supabase-shaped client ----------
export function createLocalClient() {
  const listeners = new Set();
  let session = null;
  try { const uid = localStorage.getItem(SESSION); const db = load(); if (uid && db.users[uid]) session = makeSession(db.users[uid]); } catch { session = null; }
  function makeSession(u) { return { access_token: 'local', token_type: 'bearer', user: { id: u.id, email: u.email, user_metadata: { username: u.username }, created_at: u.created_at } }; }
  const emit = (event, s) => listeners.forEach(fn => { try { fn(event, s); } catch (e) { console.error(e); } });
  const authErr = message => ({ data: { user: null, session: null }, error: Object.assign(new Error(message), { message }) });
  const setSession = s => { session = s; try { s ? localStorage.setItem(SESSION, s.user.id) : localStorage.removeItem(SESSION); } catch { /* blocked */ } };
  const findByEmail = (db, email) => Object.values(db.users).find(x => x.email === email);

  const auth = {
    onAuthStateChange(fn) { listeners.add(fn); setTimeout(() => fn('INITIAL_SESSION', session), 0); return { data: { subscription: { unsubscribe: () => listeners.delete(fn) } } }; },
    async getSession() { return { data: { session }, error: null }; },
    async signInWithPassword({ email, password }) {
      const db = load(); const e = String(email || '').toLowerCase();
      const u = findByEmail(db, e) || (e.endsWith('@' + DOMAIN) ? Object.values(db.users).find(x => x.username === e.split('@')[0]) : null);
      if (!u || !(await checkPassword(password, u))) return authErr('Invalid login credentials');
      setSession(makeSession(u)); emit('SIGNED_IN', session);
      return { data: { user: session.user, session }, error: null };
    },
    async signUp({ email, password, options }) {
      const username = String(options?.data?.username || '').toLowerCase();
      email = String(email || '').trim().toLowerCase() || `${username}@${DOMAIN}`;
      if (!/^[a-z0-9_]{3,20}$/.test(username)) return authErr('Usernames are 3–20 letters, numbers or underscores.');
      if (String(password || '').length < 8) return authErr('Password should be at least 8 characters.');
      const db = load();
      if (findByEmail(db, email) || Object.values(db.users).some(x => x.username === username)) return authErr('That user ID or email is already registered on this device.');
      const id = uuid();
      db.users[id] = { id, email, username, created_at: now(), ...(await hashPassword(password)) };
      db.data[id] = newUserData(id, username);
      addPoints(db.data[id], 100, 'welcome', 'Welcome gift');
      try { save(db); } catch { return authErr('This browser storage is full or blocked.'); }
      setSession(makeSession(db.users[id])); emit('SIGNED_IN', session);
      return { data: { user: session.user, session }, error: null };
    },
    async updateUser({ password }) {
      if (!session) return authErr('Not signed in');
      if (String(password || '').length < 8) return authErr('Password should be at least 8 characters.');
      const db = load(); Object.assign(db.users[session.user.id], await hashPassword(password)); save(db);
      emit('USER_UPDATED', session); return { data: { user: session.user }, error: null };
    },
    async resetPasswordForEmail() { return { data: null, error: Object.assign(new Error('offline_reset'), { message: 'offline_reset' }) }; },
    async signOut() { setSession(null); emit('SIGNED_OUT', null); return { error: null }; },
  };

  async function rpc(name, args = {}) {
    const fn = RPC[name];
    if (!fn) return { data: null, error: { message: 'unknown_function' } };
    if (!session) return { data: null, error: { message: 'not_signed_in' } };
    const db = load(), uid = session.user.id, u = db.data[uid];
    if (!u) return { data: null, error: { message: 'profile_missing' } };
    prune(u);
    try {
      const before = JSON.stringify(u);
      const data = fn(args, uid, u, db);
      if (!READ_ONLY.has(name) || JSON.stringify(u) !== before) save(db);
      return { data: clone(data), error: null };
    } catch (e) {
      if (e instanceof Fail) return { data: null, error: { message: e.message } };
      console.error(e); return { data: null, error: { message: 'generic' } };
    }
  }

  const storage = {
    from() {
      return {
        async upload(path, body, { contentType } = {}) {
          if (!session || !path.startsWith(session.user.id + '/')) return { data: null, error: { message: 'Unauthorized' } };
          const bytes = new Uint8Array(body);
          if (bytes.length > 2 * 1024 * 1024) return { data: null, error: { message: 'The object exceeded the maximum allowed size' } };
          let bin = ''; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
          try { localStorage.setItem(UP + path, `data:${contentType};base64,${btoa(bin)}`); } catch { return { data: null, error: { message: 'Storage full' } }; }
          return { data: { path }, error: null };
        },
        async download(path) {
          let url = null; try { url = localStorage.getItem(UP + path); } catch { /* blocked */ }
          if (!url || !session || !path.startsWith(session.user.id + '/')) return { data: null, error: { message: 'not_found' } };
          const [head, data] = url.split(','); const bin = atob(data);
          const bytes = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
          return { data: new Blob([bytes], { type: head.slice(5, head.indexOf(';')) }), error: null };
        },
        async remove(paths) { for (const p of paths) try { if (session && p.startsWith(session.user.id + '/')) localStorage.removeItem(UP + p); } catch { /* blocked */ } return { data: [], error: null }; },
      };
    },
  };
  return { auth, rpc, storage, local: true };
}
