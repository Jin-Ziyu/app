// Local PGlite database with the Supabase shim + Fan Quest migrations applied.
// Used by dev/server.mjs and the test suite. Not for production.
import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export async function openDb({ dataDir } = {}) {
  let fresh = true;
  if (dataDir) {
    fresh = !existsSync(join(dataDir, 'PG_VERSION'));
    mkdirSync(dataDir, { recursive: true });
  }
  const db = dataDir ? new PGlite(dataDir) : new PGlite();
  await db.waitReady;
  if (fresh) await db.exec(readFileSync(join(root, 'dev/supabase-shim.sql'), 'utf8'));
  // Migrations are idempotent, so re-applying on every start keeps a dev DB current.
  const dir = join(root, 'supabase/migrations');
  for (const f of readdirSync(dir).filter(f => f.endsWith('.sql')).sort()) {
    await db.exec(readFileSync(join(dir, f), 'utf8'));
  }
  return db;
}

export function hashPassword(pw) {
  const salt = randomBytes(16);
  return 'scrypt$' + salt.toString('hex') + '$' + scryptSync(pw, salt, 32).toString('hex');
}
export function checkPassword(pw, stored) {
  if (!stored || !stored.startsWith('scrypt$')) return false;
  const [, salt, hash] = stored.split('$');
  const a = scryptSync(pw, Buffer.from(salt, 'hex'), 32);
  return timingSafeEqual(a, Buffer.from(hash, 'hex'));
}

export async function createUser(db, { email, password, username }) {
  const r = await db.query(
    `insert into auth.users (email, encrypted_password, raw_user_meta_data, email_confirmed_at)
     values ($1, $2, $3, now()) returning id, email, raw_user_meta_data, created_at`,
    [email.toLowerCase(), hashPassword(password), JSON.stringify(username ? { username } : {})]);
  return r.rows[0];
}

// Run fn inside a transaction as the given user, exactly like PostgREST does.
let chain = Promise.resolve();
export function asUser(db, userId, fn) {
  const run = async () => {
    await db.exec('begin');
    try {
      await db.query(`select set_config('request.jwt.claims', $1, true)`,
        [JSON.stringify(userId ? { sub: userId, role: 'authenticated' } : { role: 'anon' })]);
      await db.exec(userId ? 'set local role authenticated' : 'set local role anon');
      const out = await fn();
      await db.exec('commit');
      return out;
    } catch (e) {
      await db.exec('rollback').catch(() => {});
      throw e;
    }
  };
  const p = chain.then(run, run);
  chain = p.catch(() => {});
  return p;
}

// Call a public RPC with named args (PostgREST style).
export async function rpc(db, userId, name, args = {}) {
  if (!/^fq_[a-z_]+$/.test(name)) throw Object.assign(new Error('Unknown function'), { code: 'PGRST202' });
  const keys = Object.keys(args);
  for (const k of keys) if (!/^p_[a-z_]+$/.test(k)) throw new Error('bad arg');
  const sql = `select public.${name}(${keys.map((k, i) => `${k} => $${i + 1}`).join(', ')}) as r`;
  const vals = keys.map(k => (args[k] !== null && typeof args[k] === 'object') ? JSON.stringify(args[k]) : args[k]);
  const res = await asUser(db, userId, () => db.query(sql, vals));
  return res.rows[0].r;
}
