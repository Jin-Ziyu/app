// Creates (or resets the password of) the demo account on your Supabase project.
// Runs on YOUR computer with the service_role key — never in the browser.
//
//   SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=... DEMO_PASSWORD='...' npm run create-demo-user
//
// The user signs in with the user ID "jujiang" (mapped to jujiang@fanquest.app by the app).
import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'node:fs';

if (existsSync('.env')) for (const line of readFileSync('.env', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/); if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const { SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: service, DEMO_PASSWORD: password } = process.env;
const username = (process.env.DEMO_USERNAME || 'jujiang').toLowerCase();
if (!url || !service || !password) {
  console.error('Need SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and DEMO_PASSWORD in the environment (or .env).');
  process.exit(1);
}
if (password.length < 8) { console.error('DEMO_PASSWORD must be at least 8 characters.'); process.exit(1); }
const email = `${username}@fanquest.app`;
const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } }).auth.admin;

let existing = null;
for (let page = 1; page < 50 && !existing; page++) {
  const { data, error } = await admin.listUsers({ page, perPage: 200 });
  if (error) { console.error(error.message); process.exit(1); }
  existing = data.users.find(u => u.email === email);
  if (data.users.length < 200) break;
}
if (existing) {
  const { error } = await admin.updateUserById(existing.id, { password, email_confirm: true });
  if (error) { console.error(error.message); process.exit(1); }
  console.log(`Updated password for ${username} (${email}).`);
} else {
  const { error } = await admin.createUser({ email, password, email_confirm: true, user_metadata: { username } });
  if (error) { console.error(error.message); process.exit(1); }
  console.log(`Created demo user ${username} (${email}). A profile with 100 welcome points is created automatically.`);
}
