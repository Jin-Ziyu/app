/* Public browser configuration. Copy to config.js (or let `npm run build` generate it
   from the SUPABASE_URL / SUPABASE_ANON_KEY environment variables).
   The anon / publishable key is designed for browsers: all data access is enforced by
   row level security and database functions. NEVER put a service_role key here. */
window.FAN_QUEST_CONFIG = {
  supabaseUrl: "https://YOUR_PROJECT_ID.supabase.co",
  supabaseAnonKey: "YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY"
};
