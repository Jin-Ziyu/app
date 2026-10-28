// Fan Quest local development server.
//
//   DEMO_PASSWORD='choose-one' npm run dev      -> http://localhost:8787
//
// Serves the static app and a small local stand-in for the Supabase APIs the
// app uses (Auth, RPC, Storage) backed by PGlite running the real migrations.
// This lets you run and test everything offline. It is a development tool:
// deploy the static files + a real Supabase project for production.
//
// Env:
//   PORT            default 8787
//   DEMO_PASSWORD   if set, creates/updates the demo user "jujiang" with this password
//   FQ_DB           "memory" for a throwaway DB (tests); default persists in dev/.data
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import { openDb, createUser, checkPassword, hashPassword, rpc, asUser } from './db.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = +(process.env.PORT || 8787);
const SECRET = process.env.FQ_JWT_SECRET || randomBytes(32).toString('hex');
const ANON_KEY = 'local-dev-anon-key';
const db = await openDb({ dataDir: process.env.FQ_DB === 'memory' ? undefined : join(root, 'dev/.data') });

const DEMO_EMAIL = 'jujiang@fanquest.app';
if (process.env.DEMO_PASSWORD) {
  const ex = await db.query('select id from auth.users where email = $1', [DEMO_EMAIL]);
  if (ex.rows.length) await db.query('update auth.users set encrypted_password = $2 where id = $1', [ex.rows[0].id, hashPassword(process.env.DEMO_PASSWORD)]);
  else await createUser(db, { email: DEMO_EMAIL, password: process.env.DEMO_PASSWORD, username: 'jujiang' });
  console.log('Demo user ready: jujiang (password from DEMO_PASSWORD)');
} else {
  console.log('Tip: start with DEMO_PASSWORD=... to create the demo user "jujiang", or register a new account in the app.');
}

// ---------- tiny JWT ----------
const b64u = b => Buffer.from(b).toString('base64url');
function sign(payload) {
  const h = b64u(JSON.stringify({ alg: 'HS256', typ: 'JWT' })), p = b64u(JSON.stringify(payload));
  return `${h}.${p}.${createHmac('sha256', SECRET).update(`${h}.${p}`).digest('base64url')}`;
}
function verify(token) {
  const [h, p, s] = String(token || '').split('.');
  if (!s || createHmac('sha256', SECRET).update(`${h}.${p}`).digest('base64url') !== s) return null;
  const c = JSON.parse(Buffer.from(p, 'base64url').toString());
  return c.exp * 1000 > Date.now() ? c : null;
}
const refreshTokens = new Map(); // token -> user id
const userJson = u => ({ id: u.id, aud: 'authenticated', role: 'authenticated', email: u.email,
  email_confirmed_at: u.email_confirmed_at, user_metadata: u.raw_user_meta_data || {}, app_metadata: { provider: 'email' },
  created_at: u.created_at, updated_at: u.updated_at || u.created_at });
function session(u) {
  const now = Math.floor(Date.now() / 1000), exp = now + 3600;
  const rt = randomBytes(24).toString('hex'); refreshTokens.set(rt, u.id);
  return { access_token: sign({ sub: u.id, email: u.email, role: 'authenticated', aud: 'authenticated', iat: now, exp, session_id: randomUUID() }),
    token_type: 'bearer', expires_in: 3600, expires_at: exp, refresh_token: rt, user: userJson(u) };
}
const getUser = async id => (await db.query('select * from auth.users where id = $1', [id])).rows[0];
const bearer = req => verify((req.headers.authorization || '').replace(/^Bearer /i, ''));

// ---------- helpers ----------
const send = (res, status, body, headers = {}) => {
  const isBuf = Buffer.isBuffer(body);
  res.writeHead(status, { 'content-type': isBuf ? 'application/octet-stream' : 'application/json', 'cache-control': 'no-store', ...headers });
  res.end(isBuf ? body : JSON.stringify(body));
};
const authErr = (res, status, code, msg) => send(res, status, { code: status, error_code: code, msg });
const readBody = req => new Promise((ok, bad) => {
  const chunks = []; let n = 0;
  req.on('data', c => { n += c.length; if (n > 3 * 1024 * 1024) { bad(new Error('too_large')); req.destroy(); } else chunks.push(c); });
  req.on('end', () => ok(Buffer.concat(chunks))); req.on('error', bad);
});
const json = async req => { const b = await readBody(req); return b.length ? JSON.parse(b.toString()) : {}; };
const pgErr = (res, e) => {
  const status = e.code === '42501' ? 403 : e.code === 'PGRST202' ? 404 : 400;
  send(res, status, { code: e.code || 'P0001', message: e.message, details: e.detail || null, hint: e.hint || null });
};

// ---------- Auth (GoTrue subset) ----------
async function auth(req, res, path, url) {
  if (req.method === 'POST' && path === '/token') {
    const body = await json(req);
    if (url.searchParams.get('grant_type') === 'password') {
      const u = (await db.query('select * from auth.users where email = $1', [String(body.email || '').toLowerCase()])).rows[0];
      if (!u || !checkPassword(String(body.password || ''), u.encrypted_password)) return authErr(res, 400, 'invalid_credentials', 'Invalid login credentials');
      return send(res, 200, session(u));
    }
    if (url.searchParams.get('grant_type') === 'refresh_token') {
      const id = refreshTokens.get(body.refresh_token);
      if (!id) return authErr(res, 400, 'refresh_token_not_found', 'Invalid Refresh Token: Refresh Token Not Found');
      refreshTokens.delete(body.refresh_token);
      return send(res, 200, session(await getUser(id)));
    }
    return authErr(res, 400, 'unsupported_grant_type', 'Unsupported grant type');
  }
  if (req.method === 'POST' && path === '/signup') {
    const body = await json(req);
    const email = String(body.email || '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return authErr(res, 400, 'validation_failed', 'Unable to validate email address: invalid format');
    if (String(body.password || '').length < 8) return authErr(res, 422, 'weak_password', 'Password should be at least 8 characters.');
    if ((await db.query('select 1 from auth.users where email = $1', [email])).rows.length) return authErr(res, 422, 'user_already_exists', 'User already registered');
    const u = await createUser(db, { email, password: body.password, username: body.data?.username });
    return send(res, 200, session(await getUser(u.id)));
  }
  if (req.method === 'GET' && path === '/user') {
    const c = bearer(req); if (!c) return authErr(res, 401, 'bad_jwt', 'Invalid JWT');
    const u = await getUser(c.sub); if (!u) return authErr(res, 404, 'user_not_found', 'User not found');
    return send(res, 200, userJson(u));
  }
  if (req.method === 'PUT' && path === '/user') {
    const c = bearer(req); if (!c) return authErr(res, 401, 'bad_jwt', 'Invalid JWT');
    const body = await json(req);
    if (body.password !== undefined) {
      if (String(body.password).length < 8) return authErr(res, 422, 'weak_password', 'Password should be at least 8 characters.');
      await db.query('update auth.users set encrypted_password = $2, updated_at = now() where id = $1', [c.sub, hashPassword(body.password)]);
    }
    if (body.data) await db.query(`update auth.users set raw_user_meta_data = raw_user_meta_data || $2::jsonb where id = $1`, [c.sub, JSON.stringify(body.data)]);
    return send(res, 200, userJson(await getUser(c.sub)));
  }
  if (req.method === 'POST' && path === '/recover') {
    const body = await json(req);
    const u = (await db.query('select * from auth.users where email = $1', [String(body.email || '').toLowerCase()])).rows[0];
    if (u) {
      const s = session(u);
      const redirect = url.searchParams.get('redirect_to') || `http://localhost:${PORT}/`;
      const link = `${redirect.split('#')[0]}#access_token=${s.access_token}&expires_at=${s.expires_at}&expires_in=3600&refresh_token=${s.refresh_token}&token_type=bearer&type=recovery`;
      console.log(`\n[dev] Password recovery link for ${u.email} (email is not sent in dev):\n${link}\n`);
    }
    return send(res, 200, {});
  }
  if (req.method === 'POST' && path === '/logout') {
    for (const [t, id] of refreshTokens) { const c = bearer(req); if (c && id === c.sub) refreshTokens.delete(t); }
    res.writeHead(204); return res.end();
  }
  return authErr(res, 404, 'not_found', 'Not found');
}

// ---------- Storage subset (private "avatars" bucket) ----------
async function storage(req, res, path) {
  const c = bearer(req); if (!c) return send(res, 401, { statusCode: '401', error: 'Unauthorized', message: 'Invalid JWT' });
  const m = path.match(/^\/object\/(?:authenticated\/)?([a-z0-9_-]+)\/(.+)$/);
  if (req.method === 'DELETE') {
    const m2 = path.match(/^\/object\/([a-z0-9_-]+)$/); const body = await json(req);
    if (!m2) return send(res, 404, { message: 'not found' });
    const r = await asUser(db, c.sub, () => db.query('delete from storage.objects where bucket_id = $1 and name = any($2) returning name', [m2[1], body.prefixes || []]));
    return send(res, 200, r.rows.map(x => ({ name: x.name })));
  }
  if (!m) return send(res, 404, { message: 'not found' });
  const [, bucket, name] = m;
  const b = (await db.query('select * from storage.buckets where id = $1', [bucket])).rows[0];
  if (!b) return send(res, 404, { statusCode: '404', error: 'Bucket not found', message: 'Bucket not found' });
  if (req.method === 'POST' || req.method === 'PUT') {
    let data; try { data = await readBody(req); } catch { return send(res, 413, { statusCode: '413', error: 'Payload too large', message: 'The object exceeded the maximum allowed size' }); }
    const type = String(req.headers['content-type'] || '').split(';')[0];
    if (b.file_size_limit && data.length > b.file_size_limit) return send(res, 413, { statusCode: '413', error: 'Payload too large', message: 'The object exceeded the maximum allowed size' });
    if (b.allowed_mime_types && !b.allowed_mime_types.includes(type)) return send(res, 415, { statusCode: '415', error: 'invalid_mime_type', message: `mime type ${type} is not supported` });
    try {
      const upsert = req.method === 'PUT' || req.headers['x-upsert'] === 'true';
      const r = await asUser(db, c.sub, () => db.query(
        `insert into storage.objects (bucket_id, name, owner, metadata, data) values ($1, $2, $3, $4, $5)
         on conflict (bucket_id, name) do ${upsert ? 'update set data = excluded.data, metadata = excluded.metadata, updated_at = now()' : 'nothing'} returning id`,
        [bucket, name, c.sub, JSON.stringify({ mimetype: type, size: data.length }), data]));
      if (!r.rows.length) return send(res, 409, { statusCode: '409', error: 'Duplicate', message: 'The resource already exists' });
      return send(res, 200, { Key: `${bucket}/${name}`, Id: r.rows[0].id });
    } catch (e) {
      return send(res, 403, { statusCode: '403', error: 'Unauthorized', message: 'new row violates row-level security policy' });
    }
  }
  if (req.method === 'GET' || req.method === 'HEAD') {
    const r = await asUser(db, c.sub, () => db.query('select data, metadata from storage.objects where bucket_id = $1 and name = $2', [bucket, name]));
    if (!r.rows.length) return send(res, 400, { statusCode: '404', error: 'not_found', message: 'Object not found' });
    res.writeHead(200, { 'content-type': r.rows[0].metadata?.mimetype || 'application/octet-stream', 'cache-control': 'no-store' });
    return res.end(req.method === 'HEAD' ? undefined : Buffer.from(r.rows[0].data));
  }
  return send(res, 405, { message: 'method not allowed' });
}

// ---------- static ----------
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
async function serveStatic(req, res, pathname) {
  if (pathname === '/config.js') {
    return send(res, 200, Buffer.from(`window.FAN_QUEST_CONFIG = ${JSON.stringify({ supabaseUrl: `http://${req.headers.host}/sb`, supabaseAnonKey: ANON_KEY, devBackend: true })};\n`),
      { 'content-type': 'text/javascript; charset=utf-8' });
  }
  let p = normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, '');
  if (!p || p.endsWith('/')) p += 'index.html';
  if (/^(dev|node_modules|tests|scripts|supabase)([/\\]|$)/.test(p) || p.split(/[/\\]/).some(s => s.startsWith('.'))) return send(res, 404, { message: 'not found' });
  const file = join(root, p);
  try {
    if (!(await stat(file)).isFile()) throw new Error();
    const headers = { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'cache-control': 'no-cache' };
    // FQ_CSP=1 applies the production Content-Security-Policy (from netlify.toml) to check nothing breaks.
    if (process.env.FQ_CSP && extname(file) === '.html') headers['content-security-policy'] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";
    res.writeHead(200, headers);
    res.end(await readFile(file));
  } catch { send(res, 404, { message: 'not found' }); }
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname.startsWith('/sb/')) {
      if (req.headers.apikey !== ANON_KEY) return send(res, 401, { message: 'Invalid API key' });
      if (url.pathname.startsWith('/sb/auth/v1')) return await auth(req, res, url.pathname.slice('/sb/auth/v1'.length), url);
      if (url.pathname.startsWith('/sb/storage/v1')) return await storage(req, res, url.pathname.slice('/sb/storage/v1'.length));
      const m = url.pathname.match(/^\/sb\/rest\/v1\/rpc\/([a-z_]+)$/);
      if (m && req.method === 'POST') {
        const c = bearer(req);
        const args = await json(req);
        try { return send(res, 200, await rpc(db, c ? c.sub : null, m[1], args)); }
        catch (e) { return pgErr(res, e); }
      }
      return send(res, 404, { message: 'Only RPC endpoints are available in the dev backend' });
    }
    return await serveStatic(req, res, url.pathname);
  } catch (e) {
    console.error(e);
    send(res, 500, { message: 'internal error' });
  }
}).listen(PORT, () => console.log(`Fan Quest dev server: http://localhost:${PORT}`));
