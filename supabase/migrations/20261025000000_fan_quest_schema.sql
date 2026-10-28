-- =====================================================================
-- Fan Quest Studio — database schema (v2)
-- Run this first, then 20261025000001_fan_quest_seed.sql.
-- Safe to re-run: every statement is idempotent.
--
-- Security model
--  * Clients (anon / authenticated roles) get NO insert/update/delete
--    on any Fan Quest table. Every write goes through the SECURITY
--    DEFINER functions below, which read the caller from auth.uid().
--  * Points can only change inside fq_private.add_points(), which
--    refuses to go below zero, writes a ledger row and runs inside the
--    caller's transaction (so a failed redemption never charges).
--  * Spending calls take a client-generated request id; repeating a
--    request returns the stored result instead of charging twice.
--  * Helpers live in the fq_private schema, which is not exposed by
--    the Supabase API and is not executable by clients.
-- =====================================================================

create schema if not exists fq_private;
revoke all on schema fq_private from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then execute 'revoke all on schema fq_private from anon'; end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then execute 'revoke all on schema fq_private from authenticated'; end if;
end $$;

-- ---------------------------------------------------------------------
-- Upgrade path from the v1 prototype schema (fq_profiles.avatar_config).
-- Old tables are renamed to fq_v1_* so balances can be carried over.
-- ---------------------------------------------------------------------
do $$ begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'fq_profiles' and column_name = 'avatar_config') then
    alter table public.fq_profiles rename to fq_v1_profiles;
    if to_regclass('public.fq_inventory') is not null then alter table public.fq_inventory rename to fq_v1_inventory; end if;
    if to_regclass('public.fq_transactions') is not null then alter table public.fq_transactions rename to fq_v1_transactions; end if;
    if to_regclass('public.fq_claims') is not null then alter table public.fq_claims rename to fq_v1_claims; end if;
    drop table if exists public.fq_box_catalog;
    drop function if exists public.fq_claim_daily();
    drop function if exists public.fq_claim_game_reward(text, integer, uuid);
    drop function if exists public.fq_open_blind_box(text, uuid);
    drop function if exists public.fq_new_user_profile() cascade;
  end if;
end $$;

-- ---------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------
create table if not exists public.fq_profiles (
  user_id             uuid primary key references auth.users(id) on delete cascade,
  username            text not null,
  display_name        text not null default '',
  points              integer not null default 0 check (points >= 0),
  lifetime_points     integer not null default 0 check (lifetime_points >= 0),
  streak              integer not null default 0 check (streak >= 0),
  best_streak         integer not null default 0 check (best_streak >= 0),
  last_login_day      date,
  avatar              jsonb not null default '{}'::jsonb,
  settings            jsonb not null default '{}'::jsonb,
  show_on_leaderboard boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create unique index if not exists fq_profiles_username_key on public.fq_profiles (lower(username));

create table if not exists public.fq_items (
  id       text primary key,
  slot     text not null check (slot in ('species','hair','top','bottom','dress','outfit','shoes','hat','glasses','jewelry','wings','bag','held','background','frame','pose','effect')),
  name     text not null,
  name_zh  text not null default '',
  rarity   text not null check (rarity in ('Common','Rare','Epic','Legendary')),
  price    integer check (price is null or price > 0),
  starter  boolean not null default false,
  boxes    text[] not null default '{}',
  art      jsonb not null default '{}'::jsonb,
  sort     integer not null default 0,
  active   boolean not null default true
);

create table if not exists public.fq_boxes (
  id               text primary key,
  name             text not null,
  name_zh          text not null default '',
  description      text not null default '',
  description_zh   text not null default '',
  cost             integer not null check (cost > 0),
  odds             jsonb not null,
  duplicate_refund jsonb not null default '{}'::jsonb,
  sort             integer not null default 0,
  active           boolean not null default true
);

create table if not exists public.fq_inventory (
  user_id     uuid not null references auth.users(id) on delete cascade,
  item_id     text not null references public.fq_items(id),
  source      text not null,
  acquired_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

create table if not exists public.fq_transactions (
  id            bigint generated always as identity primary key,
  user_id       uuid not null references auth.users(id) on delete cascade,
  amount        integer not null,
  balance_after integer not null check (balance_after >= 0),
  kind          text not null,
  description   text not null,
  ref           jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);
create index if not exists fq_transactions_user_idx on public.fq_transactions (user_id, created_at desc);

-- Idempotency log for spending actions.
create table if not exists public.fq_requests (
  user_id    uuid not null references auth.users(id) on delete cascade,
  request_id uuid not null,
  action     text not null,
  result     jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, request_id)
);

-- One-per-day claims (daily login, missions, daily challenge).
create table if not exists public.fq_claims (
  user_id   uuid not null references auth.users(id) on delete cascade,
  claim_key text not null,
  claim_day date not null,
  created_at timestamptz not null default now(),
  primary key (user_id, claim_key, claim_day)
);

create table if not exists public.fq_achievement_claims (
  user_id        uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null,
  claimed_at     timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- Server-recorded actions; missions and achievements are computed from these.
create table if not exists public.fq_events (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  kind       text not null,
  value      integer not null default 1,
  day        date not null,
  meta       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists fq_events_user_kind_day_idx on public.fq_events (user_id, kind, day);

create table if not exists public.fq_game_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  game        text not null check (game in ('quick_tap','memory_match','trivia')),
  difficulty  text not null check (difficulty in ('easy','normal','hard')),
  status      text not null default 'active' check (status in ('active','finished','abandoned')),
  questions   integer[] not null default '{}',
  started_at  timestamptz not null default now(),
  finished_at timestamptz,
  score       integer,
  moves       integer,
  awarded     integer not null default 0,
  day         date not null,
  result      jsonb not null default '{}'::jsonb
);
create index if not exists fq_game_sessions_user_idx on public.fq_game_sessions (user_id, game, day);

create table if not exists public.fq_trivia_answers (
  session_id  uuid not null references public.fq_game_sessions(id) on delete cascade,
  question_id integer not null,
  choice      integer not null,
  correct     boolean not null,
  answered_at timestamptz not null default now(),
  primary key (session_id, question_id)
);

create table if not exists public.fq_looks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  avatar     jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists fq_looks_user_idx on public.fq_looks (user_id, created_at);

create table if not exists public.fq_missions (
  id       text primary key,
  title    text not null,
  title_zh text not null default '',
  event    text not null,
  target   integer not null check (target > 0),
  reward   integer not null check (reward > 0),
  active   boolean not null default true
);

create table if not exists public.fq_challenges (
  id         text primary key,
  game       text not null,
  difficulty text not null,
  metric     text not null check (metric in ('score','moves','correct')),
  target     integer not null,
  reward     integer not null check (reward > 0),
  title      text not null,
  title_zh   text not null default '',
  active     boolean not null default true
);

create table if not exists public.fq_achievements (
  id             text primary key,
  icon           text not null default 'medal',
  metric         text not null,
  target         integer not null check (target > 0),
  reward         integer not null check (reward >= 0),
  title          text not null,
  title_zh       text not null default '',
  description    text not null default '',
  description_zh text not null default '',
  sort           integer not null default 0,
  active         boolean not null default true
);

-- Trivia lives in the private schema so answers are never readable by clients.
create table if not exists fq_private.trivia (
  id          integer primary key,
  level       text not null check (level in ('easy','normal','hard')),
  question    text not null,
  question_zh text not null default '',
  choices     jsonb not null,
  choices_zh  jsonb not null,
  answer      integer not null,
  active      boolean not null default true
);

-- ---------------------------------------------------------------------
-- Privileges + row level security
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['fq_profiles','fq_items','fq_boxes','fq_inventory','fq_transactions','fq_requests','fq_claims',
                           'fq_achievement_claims','fq_events','fq_game_sessions','fq_trivia_answers','fq_looks',
                           'fq_missions','fq_challenges','fq_achievements'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from public', t);
    if exists (select 1 from pg_roles where rolname = 'anon') then execute format('revoke all on table public.%I from anon', t); end if;
    if exists (select 1 from pg_roles where rolname = 'authenticated') then execute format('revoke all on table public.%I from authenticated', t); end if;
  end loop;
end $$;

-- Read-only catalogue for signed-in users.
grant select on public.fq_items, public.fq_boxes, public.fq_missions, public.fq_challenges, public.fq_achievements to authenticated;
drop policy if exists fq_items_read on public.fq_items;
create policy fq_items_read on public.fq_items for select to authenticated using (active);
drop policy if exists fq_boxes_read on public.fq_boxes;
create policy fq_boxes_read on public.fq_boxes for select to authenticated using (active);
drop policy if exists fq_missions_read on public.fq_missions;
create policy fq_missions_read on public.fq_missions for select to authenticated using (active);
drop policy if exists fq_challenges_read on public.fq_challenges;
create policy fq_challenges_read on public.fq_challenges for select to authenticated using (active);
drop policy if exists fq_achievements_read on public.fq_achievements;
create policy fq_achievements_read on public.fq_achievements for select to authenticated using (active);

-- Own rows only, read-only.
grant select on public.fq_profiles, public.fq_inventory, public.fq_transactions, public.fq_looks, public.fq_claims,
                public.fq_achievement_claims to authenticated;
drop policy if exists fq_profiles_own on public.fq_profiles;
create policy fq_profiles_own on public.fq_profiles for select to authenticated using (user_id = auth.uid());
drop policy if exists fq_inventory_own on public.fq_inventory;
create policy fq_inventory_own on public.fq_inventory for select to authenticated using (user_id = auth.uid());
drop policy if exists fq_transactions_own on public.fq_transactions;
create policy fq_transactions_own on public.fq_transactions for select to authenticated using (user_id = auth.uid());
drop policy if exists fq_looks_own on public.fq_looks;
create policy fq_looks_own on public.fq_looks for select to authenticated using (user_id = auth.uid());
drop policy if exists fq_claims_own on public.fq_claims;
create policy fq_claims_own on public.fq_claims for select to authenticated using (user_id = auth.uid());
drop policy if exists fq_ach_claims_own on public.fq_achievement_claims;
create policy fq_ach_claims_own on public.fq_achievement_claims for select to authenticated using (user_id = auth.uid());
-- fq_requests, fq_events, fq_game_sessions, fq_trivia_answers: no client access at all.

-- ---------------------------------------------------------------------
-- Storage: private bucket for custom avatar uploads (<user id>/file.ext)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 2097152, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists fq_avatar_read on storage.objects;
create policy fq_avatar_read on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists fq_avatar_insert on storage.objects;
create policy fq_avatar_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists fq_avatar_update on storage.objects;
create policy fq_avatar_update on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists fq_avatar_delete on storage.objects;
create policy fq_avatar_delete on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- =====================================================================
-- Private helpers
-- =====================================================================

-- "Today" for daily rewards. Change the time zone here if needed.
create or replace function fq_private.today() returns date
language sql stable set search_path = '' as $$
  select (now() at time zone 'Asia/Singapore')::date
$$;

create or replace function fq_private.require_user() returns uuid
language plpgsql stable set search_path = '' as $$
declare u uuid := auth.uid();
begin
  if u is null then raise exception 'not_signed_in'; end if;
  return u;
end $$;

-- Lock the caller's profile row so concurrent calls for one user serialize.
create or replace function fq_private.lock_profile(p_uid uuid) returns void
language plpgsql set search_path = '' as $$
begin
  perform 1 from public.fq_profiles where user_id = p_uid for update;
  if not found then raise exception 'profile_missing'; end if;
end $$;

create or replace function fq_private.add_points(p_uid uuid, p_amount integer, p_kind text, p_desc text, p_ref jsonb default '{}'::jsonb)
returns integer language plpgsql set search_path = '' as $$
declare bal integer;
begin
  if p_amount = 0 then
    select points into bal from public.fq_profiles where user_id = p_uid;
    return bal;
  elsif p_amount > 0 then
    update public.fq_profiles
       set points = points + p_amount, lifetime_points = lifetime_points + p_amount, updated_at = now()
     where user_id = p_uid returning points into bal;
  else
    update public.fq_profiles set points = points + p_amount, updated_at = now()
     where user_id = p_uid and points >= -p_amount returning points into bal;
    if bal is null then raise exception 'insufficient_points'; end if;
  end if;
  if bal is null then raise exception 'profile_missing'; end if;
  insert into public.fq_transactions (user_id, amount, balance_after, kind, description, ref)
  values (p_uid, p_amount, bal, p_kind, p_desc, coalesce(p_ref, '{}'::jsonb));
  return bal;
end $$;

create or replace function fq_private.log_event(p_uid uuid, p_kind text, p_value integer default 1, p_meta jsonb default '{}'::jsonb)
returns void language sql set search_path = '' as $$
  insert into public.fq_events (user_id, kind, value, day, meta)
  values (p_uid, p_kind, p_value, fq_private.today(), coalesce(p_meta, '{}'::jsonb));
$$;

create or replace function fq_private.owns(p_uid uuid, p_item text) returns boolean
language sql stable set search_path = '' as $$
  select exists (select 1 from public.fq_items i where i.id = p_item and i.active and i.starter)
      or exists (select 1 from public.fq_inventory v where v.user_id = p_uid and v.item_id = p_item);
$$;

-- Returns the stored result of a repeated spending request, or null.
create or replace function fq_private.replay(p_uid uuid, p_request uuid, p_action text) returns jsonb
language plpgsql set search_path = '' as $$
declare r public.fq_requests%rowtype;
begin
  if p_request is null then raise exception 'invalid_request'; end if;
  select * into r from public.fq_requests where user_id = p_uid and request_id = p_request;
  if not found then return null; end if;
  if r.action <> p_action then raise exception 'invalid_request'; end if;
  return r.result || jsonb_build_object('replayed', true);
end $$;

create or replace function fq_private.remember(p_uid uuid, p_request uuid, p_action text, p_result jsonb) returns void
language sql set search_path = '' as $$
  insert into public.fq_requests (user_id, request_id, action, result) values (p_uid, p_request, p_action, p_result);
$$;

create or replace function fq_private.is_hex(p text) returns boolean
language sql immutable set search_path = '' as $$ select p ~ '^#[0-9a-fA-F]{6}$' $$;

-- Validates an avatar config against ownership and returns a clean copy.
create or replace function fq_private.validate_avatar(p_uid uuid, p jsonb) returns jsonb
language plpgsql stable set search_path = '' as $$
declare
  out jsonb := '{}'::jsonb;
  s text; v text; it public.fq_items%rowtype;
  slots text[] := array['species','hair','top','bottom','dress','outfit','shoes','hat','glasses','jewelry','wings','bag','held','background','frame','pose','effect'];
  required text[] := array['species','hair','background','pose','frame'];
  defaults jsonb := '{"species":"sp_bunny","hair":"hair_bob","background":"bg_sky","pose":"ps_wave","frame":"fr_round"}'::jsonb;
  c text; path text;
begin
  if p is null or jsonb_typeof(p) <> 'object' then raise exception 'invalid_avatar'; end if;
  foreach s in array slots loop
    v := nullif(p ->> s, '');
    if v is null then
      if s = any(required) then out := out || jsonb_build_object(s, defaults ->> s); else out := out || jsonb_build_object(s, null); end if;
      continue;
    end if;
    select * into it from public.fq_items where id = v and active;
    if not found or it.slot <> s then raise exception 'invalid_avatar' using detail = 'Unknown item ' || v || ' for ' || s; end if;
    if not fq_private.owns(p_uid, v) then raise exception 'item_not_owned' using detail = v; end if;
    out := out || jsonb_build_object(s, v);
  end loop;
  foreach c in array array['skin','eyes','hair_color'] loop
    v := p ->> c;
    if v is not null and not fq_private.is_hex(v) then raise exception 'invalid_avatar' using detail = 'Bad colour for ' || c; end if;
    out := out || jsonb_build_object(c, coalesce(lower(v), case c when 'skin' then '#fff3f7' when 'eyes' then '#4a3b6b' else '#6b4a3a' end));
  end loop;
  if coalesce(p ->> 'mode', 'built') = 'custom' then
    path := p ->> 'custom_path';
    if path is null or path !~ ('^' || p_uid::text || '/[A-Za-z0-9_-]{1,64}\.(png|jpg|jpeg|webp)$') then
      raise exception 'invalid_avatar' using detail = 'Bad upload path';
    end if;
    if not exists (select 1 from storage.objects o where o.bucket_id = 'avatars' and o.name = path) then
      raise exception 'invalid_avatar' using detail = 'Upload not found';
    end if;
    out := out || jsonb_build_object('mode', 'custom', 'custom_path', path);
  else
    out := out || jsonb_build_object('mode', 'built', 'custom_path', null);
  end if;
  return out;
end $$;

create or replace function fq_private.default_avatar() returns jsonb
language sql immutable set search_path = '' as $$
  select '{"species":"sp_bunny","hair":"hair_bob","top":"top_tee_pink","bottom":"bot_skirt_pink","dress":null,"outfit":null,
           "shoes":"sh_sneakers","hat":"hat_bow","glasses":null,"jewelry":null,"wings":null,"bag":null,"held":"hd_lightstick",
           "background":"bg_sky","frame":"fr_round","pose":"ps_wave","effect":"fx_sparkles",
           "skin":"#fff3f7","eyes":"#4a3b6b","hair_color":"#8a5a44","mode":"built","custom_path":null}'::jsonb
$$;

create or replace function fq_private.default_settings() returns jsonb
language sql immutable set search_path = '' as $$
  select '{"theme":"light","accent":"pastel","accent_custom":"#b9a5ee","background":"hearts","decor":true,
           "density":"comfortable","font_scale":1,"sidebar":"expanded","sound":true,"motion":true,"language":"en",
           "widgets":[{"id":"fandom","on":true},{"id":"schedule","on":true},{"id":"todo","on":true},{"id":"life","on":true},{"id":"points","on":true},{"id":"avatar","on":true},{"id":"daily","on":true},{"id":"missions","on":true},
                      {"id":"challenge","on":true},{"id":"games","on":true},{"id":"collection","on":true},
                      {"id":"achievements","on":true},{"id":"transactions","on":true},{"id":"leaderboard","on":true},
                      {"id":"tracker","on":true}]}'::jsonb
$$;

create or replace function fq_private.validate_settings(p jsonb) returns jsonb
language plpgsql immutable set search_path = '' as $$
declare
  d jsonb := fq_private.default_settings();
  o jsonb := d;
  ids text[] := array['fandom','schedule','todo','life','points','avatar','daily','missions','challenge','games','collection','achievements','transactions','leaderboard','tracker'];
  w jsonb; wid text; seen text[] := '{}'; widgets jsonb := '[]'::jsonb; fs numeric;
begin
  if p is null or jsonb_typeof(p) <> 'object' then raise exception 'invalid_settings'; end if;
  if p ->> 'theme' in ('light','dark','system') then o := o || jsonb_build_object('theme', p ->> 'theme'); end if;
  if p ->> 'accent' in ('pastel','pink','purple','blue','mint','custom') then o := o || jsonb_build_object('accent', p ->> 'accent'); end if;
  if fq_private.is_hex(p ->> 'accent_custom') then o := o || jsonb_build_object('accent_custom', lower(p ->> 'accent_custom')); end if;
  if p ->> 'background' in ('plain','hearts','stars','clouds','dots') then o := o || jsonb_build_object('background', p ->> 'background'); end if;
  if jsonb_typeof(p -> 'decor') = 'boolean' then o := o || jsonb_build_object('decor', p -> 'decor'); end if;
  if p ->> 'density' in ('compact','comfortable','spacious') then o := o || jsonb_build_object('density', p ->> 'density'); end if;
  if jsonb_typeof(p -> 'font_scale') = 'number' then
    fs := (p ->> 'font_scale')::numeric;
    if fs between 0.85 and 1.3 then o := o || jsonb_build_object('font_scale', round(fs, 2)); end if;
  end if;
  if p ->> 'sidebar' in ('expanded','collapsed','hidden') then o := o || jsonb_build_object('sidebar', p ->> 'sidebar'); end if;
  if jsonb_typeof(p -> 'sound') = 'boolean' then o := o || jsonb_build_object('sound', p -> 'sound'); end if;
  if jsonb_typeof(p -> 'motion') = 'boolean' then o := o || jsonb_build_object('motion', p -> 'motion'); end if;
  if p ->> 'language' in ('en','zh') then o := o || jsonb_build_object('language', p ->> 'language'); end if;
  if jsonb_typeof(p -> 'widgets') = 'array' then
    for w in select * from jsonb_array_elements(p -> 'widgets') loop
      wid := w ->> 'id';
      if wid = any(ids) and not wid = any(seen) then
        seen := seen || wid;
        widgets := widgets || jsonb_build_array(jsonb_build_object('id', wid, 'on', coalesce((w ->> 'on')::boolean, true)));
      end if;
    end loop;
    foreach wid in array ids loop
      if not wid = any(seen) then widgets := widgets || jsonb_build_array(jsonb_build_object('id', wid, 'on', true)); end if;
    end loop;
    o := o || jsonb_build_object('widgets', widgets);
  end if;
  return o;
end $$;

create or replace function fq_private.diff_rank(p text) returns integer
language sql immutable set search_path = '' as $$ select case p when 'easy' then 1 when 'normal' then 2 when 'hard' then 3 else 0 end $$;

-- Server-side game rules. Clients receive these to drive the UI.
create or replace function fq_private.game_config(p_game text, p_difficulty text) returns jsonb
language sql immutable set search_path = '' as $$
  select case p_game
    when 'quick_tap' then case p_difficulty
      when 'easy'   then '{"duration":15,"multiplier":0.5,"cap":25,"max_rate":12,"daily_rewarded":5}'
      when 'normal' then '{"duration":10,"multiplier":0.8,"cap":35,"max_rate":12,"daily_rewarded":5}'
      when 'hard'   then '{"duration":8,"multiplier":1.2,"cap":45,"max_rate":12,"daily_rewarded":5}' end
    when 'memory_match' then case p_difficulty
      when 'easy'   then '{"pairs":6,"base":15,"time_limit":0,"daily_rewarded":5}'
      when 'normal' then '{"pairs":8,"base":25,"time_limit":0,"daily_rewarded":5}'
      when 'hard'   then '{"pairs":10,"base":35,"time_limit":90,"daily_rewarded":5}' end
    when 'trivia' then case p_difficulty
      when 'easy'   then '{"questions":5,"seconds":20,"per_correct":10,"daily_cap":100}'
      when 'normal' then '{"questions":5,"seconds":15,"per_correct":10,"daily_cap":100}'
      when 'hard'   then '{"questions":5,"seconds":12,"per_correct":10,"daily_cap":100}' end
  end::jsonb
$$;

-- Today's missions for a user: the login mission + 2 rotating ones.
create or replace function fq_private.missions_for(p_uid uuid, p_day date) returns setof public.fq_missions
language sql stable set search_path = '' as $$
  (select * from public.fq_missions where id = 'm_login' and active)
  union all
  (select * from public.fq_missions where active and id <> 'm_login'
    order by md5(p_uid::text || p_day::text || id) limit 2)
$$;

create or replace function fq_private.mission_progress(p_uid uuid, p_event text, p_day date) returns integer
language sql stable set search_path = '' as $$
  select coalesce(sum(value), 0)::integer from public.fq_events where user_id = p_uid and kind = p_event and day = p_day
$$;

-- Same challenge for everyone on a given day.
create or replace function fq_private.challenge_for(p_day date) returns public.fq_challenges
language sql stable set search_path = '' as $$
  select c from (select c, row_number() over (order by c.id) - 1 as rn, count(*) over () as n
                   from public.fq_challenges c where c.active) x
   where x.rn = ((p_day - date '2026-01-01') % x.n + x.n) % x.n
$$;

create or replace function fq_private.metric(p_uid uuid, p_metric text) returns integer
language plpgsql stable set search_path = '' as $$
declare r integer;
begin
  case p_metric
    when 'logins' then select count(*) into r from public.fq_events where user_id = p_uid and kind = 'daily_login';
    when 'best_streak' then select best_streak into r from public.fq_profiles where user_id = p_uid;
    when 'games_played' then select count(*) into r from public.fq_events where user_id = p_uid and kind = 'game_finished';
    when 'trivia_correct' then select coalesce(sum(value),0) into r from public.fq_events where user_id = p_uid and kind = 'trivia_correct';
    when 'boxes_opened' then select count(*) into r from public.fq_events where user_id = p_uid and kind = 'box_opened';
    when 'items_owned' then select count(*) into r from public.fq_inventory where user_id = p_uid;
    when 'legendary_owned' then select count(*) into r from public.fq_inventory v join public.fq_items i on i.id = v.item_id
                                  where v.user_id = p_uid and i.rarity = 'Legendary';
    when 'missions_claimed' then select count(*) into r from public.fq_events where user_id = p_uid and kind = 'mission_claimed';
    when 'looks_saved' then select count(*) into r from public.fq_looks where user_id = p_uid;
    when 'points_earned' then select lifetime_points into r from public.fq_profiles where user_id = p_uid;
    else r := 0;
  end case;
  return coalesce(r, 0);
end $$;

-- New auth user -> profile with a unique username and a welcome gift.
create or replace function fq_private.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare base text; uname text;
begin
  base := lower(regexp_replace(coalesce(nullif(new.raw_user_meta_data ->> 'username', ''), split_part(coalesce(new.email, ''), '@', 1)), '[^a-zA-Z0-9_]', '', 'g'));
  if length(base) < 3 then base := 'fan' || substr(replace(new.id::text, '-', ''), 1, 6); end if;
  base := left(base, 20);
  uname := base;
  if exists (select 1 from public.fq_profiles where lower(username) = uname) then
    uname := left(base, 15) || '_' || substr(md5(new.id::text), 1, 4);
  end if;
  insert into public.fq_profiles (user_id, username, display_name, avatar, settings)
  values (new.id, uname, uname, fq_private.default_avatar(), fq_private.default_settings())
  on conflict (user_id) do nothing;
  if found then
    perform fq_private.add_points(new.id, 100, 'welcome', 'Welcome gift');
  end if;
  return new;
end $$;

drop trigger if exists fq_on_auth_user_created on auth.users;
create trigger fq_on_auth_user_created after insert on auth.users
  for each row execute function fq_private.handle_new_user();

-- =====================================================================
-- Public RPCs (callable by signed-in users)
-- =====================================================================

create or replace function public.fq_get_catalog() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  perform fq_private.require_user();
  return jsonb_build_object(
    'items', coalesce((select jsonb_agg(to_jsonb(i) - 'active' order by i.slot, i.sort, i.id) from public.fq_items i where i.active), '[]'::jsonb),
    'boxes', coalesce((select jsonb_agg(jsonb_build_object(
        'id', b.id, 'name', b.name, 'name_zh', b.name_zh, 'description', b.description, 'description_zh', b.description_zh,
        'cost', b.cost, 'odds', b.odds, 'duplicate_refund', b.duplicate_refund,
        'pool', (select coalesce(jsonb_object_agg(r.rarity, r.ids), '{}'::jsonb) from (
                   select i.rarity, jsonb_agg(i.id order by i.sort, i.id) as ids from public.fq_items i
                    where i.active and b.id = any(i.boxes) and b.odds ? i.rarity group by i.rarity) r)
      ) order by b.sort) from public.fq_boxes b where b.active), '[]'::jsonb),
    'achievements', coalesce((select jsonb_agg(to_jsonb(a) - 'active' order by a.sort) from public.fq_achievements a where a.active), '[]'::jsonb),
    'games', jsonb_build_object(
      'quick_tap', jsonb_build_object('easy', fq_private.game_config('quick_tap','easy'), 'normal', fq_private.game_config('quick_tap','normal'), 'hard', fq_private.game_config('quick_tap','hard')),
      'memory_match', jsonb_build_object('easy', fq_private.game_config('memory_match','easy'), 'normal', fq_private.game_config('memory_match','normal'), 'hard', fq_private.game_config('memory_match','hard')),
      'trivia', jsonb_build_object('easy', fq_private.game_config('trivia','easy'), 'normal', fq_private.game_config('trivia','normal'), 'hard', fq_private.game_config('trivia','hard')))
  );
end $$;

create or replace function public.fq_get_state() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  uid uuid := fq_private.require_user();
  d date := fq_private.today();
  p public.fq_profiles%rowtype;
  ch public.fq_challenges;
  eff_streak integer;
begin
  select * into p from public.fq_profiles where user_id = uid;
  if not found then raise exception 'profile_missing'; end if;
  eff_streak := case when p.last_login_day >= d - 1 then p.streak else 0 end;
  ch := fq_private.challenge_for(d);
  return jsonb_build_object(
    'today', d,
    'profile', jsonb_build_object('username', p.username, 'display_name', p.display_name, 'points', p.points,
        'lifetime_points', p.lifetime_points, 'streak', eff_streak, 'best_streak', p.best_streak,
        'last_login_day', p.last_login_day, 'avatar', fq_private.default_avatar() || p.avatar,
        'settings', fq_private.default_settings() || p.settings,
        'show_on_leaderboard', p.show_on_leaderboard, 'created_at', p.created_at),
    'daily_claimed', exists (select 1 from public.fq_claims where user_id = uid and claim_key = 'daily_login' and claim_day = d),
    'inventory', coalesce((select jsonb_agg(jsonb_build_object('item_id', v.item_id, 'source', v.source, 'acquired_at', v.acquired_at)
                            order by v.acquired_at desc) from public.fq_inventory v where v.user_id = uid), '[]'::jsonb),
    'transactions', coalesce((select jsonb_agg(to_jsonb(t) - 'user_id' order by t.id desc) from
                               (select * from public.fq_transactions where user_id = uid order by id desc limit 50) t), '[]'::jsonb),
    'looks', coalesce((select jsonb_agg(jsonb_build_object('id', l.id, 'name', l.name, 'avatar', l.avatar, 'created_at', l.created_at)
                        order by l.created_at) from public.fq_looks l where l.user_id = uid), '[]'::jsonb),
    'missions', coalesce((select jsonb_agg(jsonb_build_object('id', m.id, 'title', m.title, 'title_zh', m.title_zh,
                           'target', m.target, 'reward', m.reward,
                           'progress', least(m.target, fq_private.mission_progress(uid, m.event, d)),
                           'claimed', exists (select 1 from public.fq_claims c where c.user_id = uid and c.claim_key = 'mission:' || m.id and c.claim_day = d)))
                         from fq_private.missions_for(uid, d) m), '[]'::jsonb),
    'challenge', case when ch.id is null then null else jsonb_build_object('id', ch.id, 'game', ch.game, 'difficulty', ch.difficulty,
                   'metric', ch.metric, 'target', ch.target, 'reward', ch.reward, 'title', ch.title, 'title_zh', ch.title_zh,
                   'completed', exists (select 1 from public.fq_claims c where c.user_id = uid and c.claim_key = 'challenge' and c.claim_day = d)) end,
    'achievements', coalesce((select jsonb_agg(jsonb_build_object('id', a.id, 'target', a.target,
                               'progress', least(a.target, fq_private.metric(uid, a.metric)),
                               'claimed', exists (select 1 from public.fq_achievement_claims c where c.user_id = uid and c.achievement_id = a.id))
                               order by a.sort) from public.fq_achievements a where a.active), '[]'::jsonb),
    'games', jsonb_build_object(
      'quick_tap', jsonb_build_object('rewarded_today', (select count(*) from public.fq_game_sessions where user_id = uid and game = 'quick_tap' and day = d and awarded > 0),
                                      'best', (select max(score) from public.fq_game_sessions where user_id = uid and game = 'quick_tap' and status = 'finished'),
                                      'played', (select count(*) from public.fq_game_sessions where user_id = uid and game = 'quick_tap' and status = 'finished')),
      'memory_match', jsonb_build_object('rewarded_today', (select count(*) from public.fq_game_sessions where user_id = uid and game = 'memory_match' and day = d and awarded > 0),
                                      'best', (select min(moves) from public.fq_game_sessions where user_id = uid and game = 'memory_match' and status = 'finished'),
                                      'played', (select count(*) from public.fq_game_sessions where user_id = uid and game = 'memory_match' and status = 'finished')),
      'trivia', jsonb_build_object('points_today', (select coalesce(sum(awarded),0) from public.fq_game_sessions where user_id = uid and game = 'trivia' and day = d),
                                   'best', (select max(score) from public.fq_game_sessions where user_id = uid and game = 'trivia' and status = 'finished'),
                                   'played', (select count(*) from public.fq_game_sessions where user_id = uid and game = 'trivia' and status = 'finished')))
  );
end $$;

create or replace function public.fq_claim_daily() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := fq_private.require_user(); d date := fq_private.today(); p public.fq_profiles%rowtype; new_streak integer; bal integer;
begin
  perform fq_private.lock_profile(uid);
  insert into public.fq_claims (user_id, claim_key, claim_day) values (uid, 'daily_login', d) on conflict do nothing;
  if not found then
    return jsonb_build_object('awarded', 0, 'already', true);
  end if;
  select * into p from public.fq_profiles where user_id = uid;
  new_streak := case when p.last_login_day = d - 1 then p.streak + 1 else 1 end;
  update public.fq_profiles set streak = new_streak, best_streak = greatest(best_streak, new_streak), last_login_day = d where user_id = uid;
  bal := fq_private.add_points(uid, 5, 'daily', 'Daily login reward', jsonb_build_object('day', d, 'streak', new_streak));
  perform fq_private.log_event(uid, 'daily_login');
  return jsonb_build_object('awarded', 5, 'already', false, 'streak', new_streak, 'balance', bal);
end $$;

create or replace function public.fq_save_avatar(p_avatar jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := fq_private.require_user(); clean jsonb;
begin
  clean := fq_private.validate_avatar(uid, p_avatar);
  update public.fq_profiles set avatar = clean, updated_at = now() where user_id = uid;
  perform fq_private.log_event(uid, 'avatar_saved');
  return clean;
end $$;

create or replace function public.fq_save_settings(p_settings jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := fq_private.require_user(); clean jsonb; cur jsonb;
begin
  select fq_private.default_settings() || settings into cur from public.fq_profiles where user_id = uid;
  clean := fq_private.validate_settings(cur || coalesce(p_settings, '{}'::jsonb));
  update public.fq_profiles set settings = clean, updated_at = now() where user_id = uid;
  return clean;
end $$;

create or replace function public.fq_set_profile(p_display_name text, p_show_on_leaderboard boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := fq_private.require_user(); nm text;
begin
  nm := btrim(regexp_replace(coalesce(p_display_name, ''), '[[:cntrl:]<>]', '', 'g'));
  if length(nm) < 1 or length(nm) > 24 then raise exception 'invalid_name'; end if;
  update public.fq_profiles set display_name = nm, show_on_leaderboard = coalesce(p_show_on_leaderboard, false), updated_at = now()
   where user_id = uid;
  return jsonb_build_object('display_name', nm, 'show_on_leaderboard', coalesce(p_show_on_leaderboard, false));
end $$;

create or replace function public.fq_buy_item(p_item_id text, p_request_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := fq_private.require_user(); it public.fq_items%rowtype; prev jsonb; bal integer; res jsonb;
begin
  perform fq_private.lock_profile(uid);
  prev := fq_private.replay(uid, p_request_id, 'buy');
  if prev is not null then return prev; end if;
  select * into it from public.fq_items where id = p_item_id and active;
  if not found then raise exception 'unknown_item'; end if;
  if it.price is null or it.starter then raise exception 'not_for_sale'; end if;
  if fq_private.owns(uid, it.id) then raise exception 'already_owned'; end if;
  bal := fq_private.add_points(uid, -it.price, 'shop', 'Bought ' || it.name, jsonb_build_object('item_id', it.id));
  insert into public.fq_inventory (user_id, item_id, source) values (uid, it.id, 'shop');
  perform fq_private.log_event(uid, 'item_bought', 1, jsonb_build_object('item_id', it.id));
  res := jsonb_build_object('item_id', it.id, 'cost', it.price, 'balance', bal, 'replayed', false);
  perform fq_private.remember(uid, p_request_id, 'buy', res);
  return res;
end $$;

create or replace function public.fq_open_box(p_box_id text, p_request_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := fq_private.require_user();
  b public.fq_boxes%rowtype; prev jsonb; bal integer; res jsonb;
  total numeric; roll numeric; r text; rolled text; pick text; dup boolean := false; refund integer := 0;
begin
  perform fq_private.lock_profile(uid);
  prev := fq_private.replay(uid, p_request_id, 'box');
  if prev is not null then return prev; end if;
  select * into b from public.fq_boxes where id = p_box_id and active;
  if not found then raise exception 'box_unavailable'; end if;

  bal := fq_private.add_points(uid, -b.cost, 'blind_box', 'Opened ' || b.name, jsonb_build_object('box_id', b.id));

  select sum(value::numeric) into total from jsonb_each_text(b.odds);
  if total is null or total <= 0 then raise exception 'box_misconfigured'; end if;
  roll := random() * total;
  for r in select key from jsonb_each_text(b.odds)
           order by case key when 'Common' then 1 when 'Rare' then 2 when 'Epic' then 3 when 'Legendary' then 4 else 5 end loop
    rolled := r;
    roll := roll - (b.odds ->> r)::numeric;
    exit when roll < 0;
  end loop;

  -- Prefer an item the user does not own yet.
  select i.id into pick from public.fq_items i
   where i.active and b.id = any(i.boxes) and i.rarity = rolled and not fq_private.owns(uid, i.id)
   order by random() limit 1;
  if pick is null then
    select i.id into pick from public.fq_items i where i.active and b.id = any(i.boxes) and i.rarity = rolled
     order by random() limit 1;
    if pick is null then raise exception 'box_misconfigured'; end if;   -- rolls back the charge
    dup := true;
    refund := coalesce((b.duplicate_refund ->> rolled)::integer, 0);
    if refund > 0 then
      bal := fq_private.add_points(uid, refund, 'duplicate', 'Duplicate refund', jsonb_build_object('item_id', pick, 'box_id', b.id));
    end if;
  else
    insert into public.fq_inventory (user_id, item_id, source) values (uid, pick, 'box:' || b.id);
  end if;

  perform fq_private.log_event(uid, 'box_opened', 1, jsonb_build_object('box_id', b.id, 'item_id', pick, 'rarity', rolled));
  res := jsonb_build_object('box_id', b.id, 'item_id', pick, 'rarity', rolled, 'duplicate', dup, 'refund', refund,
                            'cost', b.cost, 'balance', bal, 'replayed', false);
  perform fq_private.remember(uid, p_request_id, 'box', res);
  return res;
end $$;

create or replace function public.fq_start_game(p_game text, p_difficulty text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := fq_private.require_user(); d date := fq_private.today(); cfg jsonb; sid uuid; qs integer[]; starts integer;
begin
  cfg := fq_private.game_config(p_game, p_difficulty);
  if cfg is null then raise exception 'unknown_game'; end if;
  select count(*) into starts from public.fq_game_sessions where user_id = uid and day = d;
  if starts >= 300 then raise exception 'rate_limited'; end if;
  update public.fq_game_sessions set status = 'abandoned' where user_id = uid and game = p_game and status = 'active';
  if p_game = 'trivia' then
    select array_agg(id) into qs from (
      select id from fq_private.trivia where active and
        (case p_difficulty when 'easy' then level = 'easy' when 'normal' then level in ('easy','normal') else level in ('normal','hard') end)
      order by random() limit (cfg ->> 'questions')::integer) q;
  end if;
  insert into public.fq_game_sessions (user_id, game, difficulty, questions, day)
  values (uid, p_game, p_difficulty, coalesce(qs, '{}'), d) returning id into sid;
  return jsonb_build_object('session_id', sid, 'game', p_game, 'difficulty', p_difficulty, 'config', cfg,
    'questions', case when p_game = 'trivia' then (
       select jsonb_agg(jsonb_build_object('id', t.id, 'question', t.question, 'question_zh', t.question_zh,
                                           'choices', t.choices, 'choices_zh', t.choices_zh) order by array_position(qs, t.id))
         from fq_private.trivia t where t.id = any(qs)) else null end);
end $$;

create or replace function public.fq_answer_trivia(p_session_id uuid, p_question_id integer, p_choice integer) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := fq_private.require_user(); s public.fq_game_sessions%rowtype; q fq_private.trivia%rowtype;
  ok boolean; award integer := 0; today_pts integer; cfg jsonb; bal integer;
begin
  perform fq_private.lock_profile(uid);
  select * into s from public.fq_game_sessions where id = p_session_id and user_id = uid for update;
  if not found or s.game <> 'trivia' or s.status <> 'active' then raise exception 'session_invalid'; end if;
  if now() - s.started_at > interval '10 minutes' then raise exception 'session_expired'; end if;
  if not p_question_id = any(s.questions) then raise exception 'session_invalid'; end if;
  if exists (select 1 from public.fq_trivia_answers where session_id = s.id and question_id = p_question_id) then
    raise exception 'already_answered';
  end if;
  select * into q from fq_private.trivia where id = p_question_id;
  ok := p_choice = q.answer;
  insert into public.fq_trivia_answers (session_id, question_id, choice, correct) values (s.id, p_question_id, coalesce(p_choice, -1), ok);
  if ok then
    cfg := fq_private.game_config('trivia', s.difficulty);
    select coalesce(sum(awarded), 0) into today_pts from public.fq_game_sessions where user_id = uid and game = 'trivia' and day = s.day;
    award := greatest(0, least((cfg ->> 'per_correct')::integer, (cfg ->> 'daily_cap')::integer - today_pts));
    if award > 0 then
      bal := fq_private.add_points(uid, award, 'game', 'Trivia: correct answer', jsonb_build_object('session_id', s.id));
      update public.fq_game_sessions set awarded = awarded + award where id = s.id;
    end if;
    perform fq_private.log_event(uid, 'trivia_correct');
  end if;
  if bal is null then select points into bal from public.fq_profiles where user_id = uid; end if;
  return jsonb_build_object('correct', ok, 'answer', q.answer, 'awarded', award, 'balance', bal);
end $$;

create or replace function public.fq_finish_game(p_session_id uuid, p_score integer, p_moves integer) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := fq_private.require_user(); s public.fq_game_sessions%rowtype; cfg jsonb;
  elapsed numeric; v_score integer := 0; v_moves integer; award integer := 0; rewarded integer; practice boolean := false;
  ch public.fq_challenges; ch_done boolean := false; ch_award integer := 0; met boolean; bal integer; reason text := null;
begin
  perform fq_private.lock_profile(uid);
  select * into s from public.fq_game_sessions where id = p_session_id and user_id = uid for update;
  if not found or s.status <> 'active' then raise exception 'session_invalid'; end if;
  elapsed := extract(epoch from (now() - s.started_at));
  if elapsed > 1800 then raise exception 'session_expired'; end if;
  cfg := fq_private.game_config(s.game, s.difficulty);

  if s.game = 'quick_tap' then
    v_score := greatest(0, coalesce(p_score, 0));
    if elapsed < (cfg ->> 'duration')::numeric - 1 then raise exception 'too_fast'; end if;
    if v_score > (cfg ->> 'duration')::integer * (cfg ->> 'max_rate')::integer then raise exception 'score_rejected'; end if;
    select count(*) into rewarded from public.fq_game_sessions where user_id = uid and game = s.game and day = s.day and awarded > 0;
    if rewarded >= (cfg ->> 'daily_rewarded')::integer then practice := true;
    else award := least((cfg ->> 'cap')::integer, floor(v_score * (cfg ->> 'multiplier')::numeric)::integer); end if;
  elsif s.game = 'memory_match' then
    v_moves := coalesce(p_moves, 0);
    if v_moves < (cfg ->> 'pairs')::integer then raise exception 'score_rejected'; end if;
    if elapsed < (cfg ->> 'pairs')::numeric * 1.0 then raise exception 'too_fast'; end if;
    v_score := greatest(5, (cfg ->> 'base')::integer - greatest(0, v_moves - ceil((cfg ->> 'pairs')::numeric * 1.5)::integer));
    if (cfg ->> 'time_limit')::integer > 0 and elapsed > (cfg ->> 'time_limit')::numeric + 5 then
      v_score := 0; reason := 'time_up';
    end if;
    select count(*) into rewarded from public.fq_game_sessions where user_id = uid and game = s.game and day = s.day and awarded > 0;
    if rewarded >= (cfg ->> 'daily_rewarded')::integer then practice := true; else award := v_score; end if;
  else -- trivia: score is counted from server-checked answers; points were awarded per answer
    select count(*) filter (where correct) into v_score from public.fq_trivia_answers where session_id = s.id;
  end if;

  if award > 0 then
    bal := fq_private.add_points(uid, award, 'game', case s.game when 'quick_tap' then 'Quick Tap reward' else 'Memory Match reward' end,
                                 jsonb_build_object('session_id', s.id, 'score', v_score));
  end if;
  update public.fq_game_sessions
     set status = 'finished', finished_at = now(), score = v_score, moves = v_moves,
         awarded = awarded + award, result = jsonb_build_object('practice', practice, 'reason', reason)
   where id = s.id;
  perform fq_private.log_event(uid, 'game_finished', 1, jsonb_build_object('game', s.game));
  perform fq_private.log_event(uid, s.game || '_finished', 1, jsonb_build_object('difficulty', s.difficulty));

  -- Daily challenge
  ch := fq_private.challenge_for(s.day);
  if ch.id is not null and ch.game = s.game and fq_private.diff_rank(s.difficulty) >= fq_private.diff_rank(ch.difficulty) and reason is null then
    met := case ch.metric when 'score' then v_score >= ch.target when 'correct' then v_score >= ch.target
                          when 'moves' then v_moves is not null and v_moves <= ch.target else false end;
    if met then
      insert into public.fq_claims (user_id, claim_key, claim_day) values (uid, 'challenge', s.day) on conflict do nothing;
      if found then
        ch_done := true; ch_award := ch.reward;
        bal := fq_private.add_points(uid, ch.reward, 'challenge', 'Daily Challenge: ' || ch.title, jsonb_build_object('challenge', ch.id));
        perform fq_private.log_event(uid, 'challenge_done');
      end if;
    end if;
  end if;
  if bal is null then select points into bal from public.fq_profiles where user_id = uid; end if;
  return jsonb_build_object('game', s.game, 'score', v_score, 'moves', v_moves, 'awarded', award, 'practice', practice,
                            'reason', reason, 'challenge_completed', ch_done, 'challenge_awarded', ch_award, 'balance', bal,
                            'total_awarded', award + ch_award + (case when s.game = 'trivia' then s.awarded else 0 end));
end $$;

create or replace function public.fq_claim_mission(p_mission_id text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := fq_private.require_user(); d date := fq_private.today(); m public.fq_missions; bal integer;
begin
  perform fq_private.lock_profile(uid);
  select * into m from fq_private.missions_for(uid, d) x where x.id = p_mission_id;
  if m.id is null then raise exception 'mission_unavailable'; end if;
  if fq_private.mission_progress(uid, m.event, d) < m.target then raise exception 'not_completed'; end if;
  insert into public.fq_claims (user_id, claim_key, claim_day) values (uid, 'mission:' || m.id, d) on conflict do nothing;
  if not found then raise exception 'already_claimed'; end if;
  bal := fq_private.add_points(uid, m.reward, 'mission', 'Mission: ' || m.title, jsonb_build_object('mission', m.id));
  perform fq_private.log_event(uid, 'mission_claimed', 1, jsonb_build_object('mission', m.id));
  return jsonb_build_object('mission', m.id, 'awarded', m.reward, 'balance', bal);
end $$;

create or replace function public.fq_claim_achievement(p_achievement_id text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := fq_private.require_user(); a public.fq_achievements%rowtype; bal integer;
begin
  perform fq_private.lock_profile(uid);
  select * into a from public.fq_achievements where id = p_achievement_id and active;
  if not found then raise exception 'unknown_achievement'; end if;
  if fq_private.metric(uid, a.metric) < a.target then raise exception 'not_completed'; end if;
  insert into public.fq_achievement_claims (user_id, achievement_id) values (uid, a.id) on conflict do nothing;
  if not found then raise exception 'already_claimed'; end if;
  bal := fq_private.add_points(uid, a.reward, 'achievement', 'Achievement: ' || a.title, jsonb_build_object('achievement', a.id));
  return jsonb_build_object('achievement', a.id, 'awarded', a.reward, 'balance', bal);
end $$;

create or replace function public.fq_save_look(p_name text, p_avatar jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := fq_private.require_user(); nm text; clean jsonb; lid uuid;
begin
  nm := btrim(regexp_replace(coalesce(p_name, ''), '[[:cntrl:]<>]', '', 'g'));
  if length(nm) < 1 or length(nm) > 24 then raise exception 'invalid_name'; end if;
  if (select count(*) from public.fq_looks where user_id = uid) >= 12 then raise exception 'too_many_looks'; end if;
  clean := fq_private.validate_avatar(uid, p_avatar);
  insert into public.fq_looks (user_id, name, avatar) values (uid, nm, clean) returning id into lid;
  return jsonb_build_object('id', lid, 'name', nm, 'avatar', clean);
end $$;

create or replace function public.fq_delete_look(p_look_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := fq_private.require_user();
begin
  delete from public.fq_looks where id = p_look_id and user_id = uid;
  if not found then raise exception 'not_found'; end if;
  return jsonb_build_object('deleted', p_look_id);
end $$;

create or replace function public.fq_leaderboard() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := fq_private.require_user();
begin
  return jsonb_build_object(
    'top', coalesce((select jsonb_agg(jsonb_build_object('rank', x.rk, 'name', x.nm, 'points', x.lifetime_points, 'me', x.user_id = uid) order by x.rk)
                     from (select user_id, coalesce(nullif(display_name, ''), username) as nm, lifetime_points,
                                  rank() over (order by lifetime_points desc) as rk
                             from public.fq_profiles where show_on_leaderboard) x where x.rk <= 10), '[]'::jsonb),
    'me', (select jsonb_build_object('rank', x.rk, 'points', x.lifetime_points) from
            (select user_id, lifetime_points, rank() over (order by lifetime_points desc) as rk
               from public.fq_profiles where show_on_leaderboard) x where x.user_id = uid),
    'opted_in', (select show_on_leaderboard from public.fq_profiles where user_id = uid));
end $$;

-- ---------------------------------------------------------------------
-- Function privileges: only the public RPCs above, only for signed-in users.
-- ---------------------------------------------------------------------
do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig, n.nspname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
            where n.nspname in ('public', 'fq_private') and (p.proname like 'fq\_%' or n.nspname = 'fq_private') loop
    execute format('revoke all on function %s from public', f.sig);
    if exists (select 1 from pg_roles where rolname = 'anon') then execute format('revoke all on function %s from anon', f.sig); end if;
    if exists (select 1 from pg_roles where rolname = 'authenticated') then execute format('revoke all on function %s from authenticated', f.sig); end if;
    if f.nspname = 'public' and exists (select 1 from pg_roles where rolname = 'authenticated') then
      execute format('grant execute on function %s to authenticated', f.sig);
    end if;
  end loop;
end $$;

-- Profiles for auth users created before this migration ran.
insert into public.fq_profiles (user_id, username, display_name, avatar, settings)
select u.id, left(coalesce(nullif(lower(regexp_replace(split_part(coalesce(u.email,''),'@',1), '[^a-zA-Z0-9_]', '', 'g')), ''), 'fan') , 15) || '_' || substr(md5(u.id::text), 1, 4),
       '', fq_private.default_avatar(), fq_private.default_settings()
  from auth.users u
 where not exists (select 1 from public.fq_profiles p where p.user_id = u.id)
on conflict do nothing;
update public.fq_profiles set display_name = username where display_name = '';

-- Carry over v1 prototype balances, if any.
do $$ begin
  if to_regclass('public.fq_v1_profiles') is not null then
    update public.fq_profiles p set points = p.points + greatest(0, v.points), lifetime_points = p.lifetime_points + greatest(0, v.points)
      from public.fq_v1_profiles v
     where v.user_id = p.user_id and v.points > 0
       and not exists (select 1 from public.fq_transactions t where t.user_id = p.user_id and t.kind = 'migration');
    insert into public.fq_transactions (user_id, amount, balance_after, kind, description)
    select p.user_id, v.points, p.points, 'migration', 'Balance carried over from Fan Quest v1'
      from public.fq_v1_profiles v join public.fq_profiles p on p.user_id = v.user_id
     where v.points > 0 and not exists (select 1 from public.fq_transactions t where t.user_id = p.user_id and t.kind = 'migration');
  end if;
end $$;
