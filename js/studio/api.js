// Supabase access. All game/economy writes are RPCs validated in the database.
import { t } from './i18n.js';
import { createLocalClient } from './local-backend.js';

let client = null, localMode = false;
export const isLocal = () => localMode;
export const USERNAME_DOMAIN = 'fanquest.app'; // "jujiang" signs in as jujiang@fanquest.app

export function configured(cfg) {
  return !!(cfg && cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase?.createClient &&
    !/YOUR_PROJECT_ID|YOUR_SUPABASE/.test(cfg.supabaseUrl + cfg.supabaseAnonKey));
}
export function init(cfg) {
  // No Supabase project configured -> offline mode (data saved in this browser only).
  if (!configured(cfg)) { localMode = true; client = createLocalClient(); return client; }
  client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' },
  });
  return client;
}
export const sb = () => client;

export class AppError extends Error {
  constructor(key, raw) { super(key); this.key = key; this.raw = raw; }
}
const KNOWN = ['not_signed_in', 'insufficient_points', 'unknown_item', 'not_for_sale', 'already_owned', 'box_unavailable', 'box_misconfigured',
  'invalid_request', 'item_not_owned', 'invalid_avatar', 'invalid_settings', 'invalid_name', 'unknown_game', 'rate_limited', 'session_invalid',
  'session_expired', 'too_fast', 'score_rejected', 'already_answered', 'mission_unavailable', 'not_completed', 'already_claimed',
  'unknown_achievement', 'too_many_looks', 'not_found', 'profile_missing', 'storage_full'];
export function toAppError(e) {
  if (e instanceof AppError) return e;
  const m = String(e?.message || e || '');
  const key = KNOWN.find(k => m === k || m.startsWith(k)) ||
    (/permission denied|JWT|not authenticated/i.test(m) ? 'not_signed_in' :
     /Failed to fetch|NetworkError|network|Load failed/i.test(m) ? 'network' : 'generic');
  return new AppError(key, e);
}
export const errText = e => { const x = toAppError(e); return t('err.' + x.key, ({
  not_signed_in: 'Please sign in again.', insufficient_points: 'Not enough Fan Points.', unknown_item: 'That item does not exist.',
  not_for_sale: 'That item cannot be bought directly.', already_owned: 'You already own this item.', box_unavailable: 'This box is not available right now.',
  box_misconfigured: 'This box is misconfigured. No points were taken.', invalid_request: 'Invalid request. Please refresh and try again.',
  item_not_owned: "You don't own one of those items yet.", invalid_avatar: 'That avatar setup is not valid.', invalid_settings: 'Those settings are not valid.',
  invalid_name: 'Names must be 1–24 characters.', unknown_game: 'Unknown game.', rate_limited: 'Too many requests. Please try again later.',
  session_invalid: 'This round has ended or is invalid. Please start a new one.', session_expired: 'This round expired. Please start again.',
  too_fast: 'That result came in too fast and was not counted.', score_rejected: 'That score did not pass the server check.',
  already_answered: 'That question was already answered.', mission_unavailable: "That mission isn't available today.",
  not_completed: 'Not completed yet.', already_claimed: 'Already claimed.', unknown_achievement: 'Unknown achievement.',
  too_many_looks: 'Your lookbook is full (12 looks max).', not_found: 'Not found.', profile_missing: 'Your profile is missing. Ask the admin to run the database migrations.',
  storage_full: 'This browser\'s storage is full or blocked, so the change was not saved.',
  network: 'Network error. Check your connection.', generic: 'Something went wrong. Please try again.' })[x.key]); };

export async function rpc(name, args = {}) {
  let res;
  try { res = await client.rpc(name, args); } catch (e) { throw toAppError(e); }
  if (res.error) throw toAppError(res.error);
  return res.data;
}

// ---------- auth ----------
export function toEmail(identifier) {
  const v = String(identifier || '').trim();
  return v.includes('@') ? v.toLowerCase() : `${v.toLowerCase()}@${USERNAME_DOMAIN}`;
}
export async function signIn(identifier, password) {
  const { data, error } = await client.auth.signInWithPassword({ email: toEmail(identifier), password });
  if (error) throw error;
  return data;
}
export async function signUp({ email, password, username }) {
  const { data, error } = await client.auth.signUp({ email: email.trim().toLowerCase(), password,
    options: { data: { username }, emailRedirectTo: location.origin + location.pathname } });
  if (error) throw error;
  return data;
}
export async function sendReset(email) {
  const { error } = await client.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: location.origin + location.pathname });
  if (error) throw error;
}
export async function updatePassword(password) {
  const { error } = await client.auth.updateUser({ password });
  if (error) throw error;
}
export async function verifyPassword(email, password) {
  const { error } = await client.auth.signInWithPassword({ email, password });
  return !error;
}
export async function signOut(scope = 'local') { try { await client.auth.signOut({ scope }); } catch { /* already signed out */ } }

// ---------- storage: custom avatar images (private bucket) ----------
const urlCache = new Map();
export async function uploadAvatar(userId, blob) {
  const ext = blob.type === 'image/webp' ? 'webp' : blob.type === 'image/jpeg' ? 'jpg' : 'png';
  const path = `${userId}/avatar-${Date.now().toString(36)}.${ext}`;
  const { error } = await client.storage.from('avatars').upload(path, await blob.arrayBuffer(), { contentType: blob.type, upsert: false, cacheControl: '3600' });
  if (error) throw new AppError('upload', error);
  urlCache.set(path, URL.createObjectURL(blob));
  return path;
}
export async function avatarUrl(path) {
  if (!path) return null;
  if (urlCache.has(path)) return urlCache.get(path);
  const { data, error } = await client.storage.from('avatars').download(path);
  if (error || !data) return null;
  const u = URL.createObjectURL(data); urlCache.set(path, u); return u;
}
export async function removeAvatar(path) { if (path) await client.storage.from('avatars').remove([path]).catch(() => {}); }
