// Database-level tests: run the real migrations on PGlite and exercise every RPC
// as a signed-in user, including the abuse cases. `npm test`
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { openDb, createUser, rpc, asUser } from '../dev/db.mjs';

let db, alice, bob;
const call = (u, n, a) => rpc(db, u.id, n, a);
const fails = async (p, code) => {
  await assert.rejects(p, e => { assert.match(e.message, new RegExp(code)); return true; });
};
const asAlice = sql => asUser(db, alice.id, () => db.query(sql));
const grant = (u, n) => db.query(`update public.fq_profiles set points = points + $2 where user_id = $1`, [u.id, n]);
const points = async u => (await db.query('select points from public.fq_profiles where user_id=$1', [u.id])).rows[0].points;
const age = (sid, secs) => db.query(`update public.fq_game_sessions set started_at = now() - make_interval(secs => $2) where id = $1`, [sid, secs]);

before(async () => {
  db = await openDb();
  alice = await createUser(db, { email: 'alice@example.com', password: 'secret-pass-1', username: 'Alice!!' });
  bob = await createUser(db, { email: 'bob@example.com', password: 'secret-pass-2' });
});

test('new users get a profile, a clean unique username and a welcome gift', async () => {
  const s = await call(alice, 'fq_get_state');
  assert.equal(s.profile.username, 'alice');
  assert.equal(s.profile.points, 100);
  assert.equal(s.transactions[0].kind, 'welcome');
  const dup = await createUser(db, { email: 'alice@other.com', password: 'x-pass-123', username: 'alice' });
  const s2 = await call(dup, 'fq_get_state');
  assert.notEqual(s2.profile.username, 'alice');
  assert.match(s2.profile.username, /^alice_[0-9a-f]{4}$/);
});

test('clients cannot write tables, read others, or call private helpers', async () => {
  await fails(asAlice(`update public.fq_profiles set points = 99999`), 'permission denied');
  await fails(asAlice(`insert into public.fq_inventory (user_id, item_id, source) values ('${alice.id}', 'sp_dragon', 'hack')`), 'permission denied');
  await fails(asAlice(`insert into public.fq_transactions (user_id, amount, balance_after, kind, description) values ('${alice.id}', 1000, 1000, 'x', 'x')`), 'permission denied');
  await fails(asAlice(`delete from public.fq_claims`), 'permission denied');
  await fails(asAlice(`select * from fq_private.trivia`), 'permission denied');
  await fails(asAlice(`select fq_private.add_points('${alice.id}', 1000, 'x', 'x')`), 'permission denied');
  await fails(asAlice(`select * from public.fq_events`), 'permission denied');
  const others = await asAlice(`select * from public.fq_profiles where user_id = '${bob.id}'`);
  assert.equal(others.rows.length, 0);
  const mine = await asAlice(`select points from public.fq_profiles`);
  assert.equal(mine.rows.length, 1);
  await fails(rpc(db, null, 'fq_get_state'), 'permission denied');
});

test('daily login pays once per day and starts a streak', async () => {
  const a = await call(alice, 'fq_claim_daily');
  assert.equal(a.awarded, 5); assert.equal(a.streak, 1);
  const b = await call(alice, 'fq_claim_daily');
  assert.equal(b.awarded, 0); assert.equal(b.already, true);
  assert.equal(await points(alice), 105);
  // yesterday's claim -> streak continues
  await db.query(`update public.fq_profiles set last_login_day = fq_private.today() - 1, streak = 4 where user_id = $1`, [bob.id]);
  const c = await call(bob, 'fq_claim_daily');
  assert.equal(c.streak, 5);
});

test('shop purchase: price checked, idempotent, no double ownership, never negative', async () => {
  const before = await points(alice);
  await fails(call(alice, 'fq_buy_item', { p_item_id: 'sp_unicorn', p_request_id: randomUUID() }), 'insufficient_points');
  assert.equal(await points(alice), before, 'failed purchase must not charge');
  await fails(call(alice, 'fq_buy_item', { p_item_id: 'sp_dragon', p_request_id: randomUUID() }), 'not_for_sale');
  await fails(call(alice, 'fq_buy_item', { p_item_id: 'sp_bunny', p_request_id: randomUUID() }), 'not_for_sale');
  await fails(call(alice, 'fq_buy_item', { p_item_id: 'nope', p_request_id: randomUUID() }), 'unknown_item');
  const req = randomUUID();
  const r1 = await call(alice, 'fq_buy_item', { p_item_id: 'hair_bun', p_request_id: req });
  assert.equal(r1.balance, before - 40);
  const r2 = await call(alice, 'fq_buy_item', { p_item_id: 'hair_bun', p_request_id: req });
  assert.equal(r2.replayed, true); assert.equal(r2.balance, r1.balance);
  assert.equal(await points(alice), before - 40, 'replayed request must not charge twice');
  await fails(call(alice, 'fq_buy_item', { p_item_id: 'hair_bun', p_request_id: randomUUID() }), 'already_owned');
  await fails(call(alice, 'fq_open_box', { p_box_id: 'common', p_request_id: req }), 'invalid_request');
});

test('blind boxes: charge + reward atomically, replay safe, transparent odds, duplicate refunds', async () => {
  await grant(bob, 5000);
  const start = await points(bob);
  const req = randomUUID();
  const r = await call(bob, 'fq_open_box', { p_box_id: 'rare', p_request_id: req });
  assert.ok(r.item_id); assert.ok(['Common', 'Rare', 'Epic', 'Legendary'].includes(r.rarity));
  assert.equal(r.balance, start - 100 + r.refund);
  const again = await call(bob, 'fq_open_box', { p_box_id: 'rare', p_request_id: req });
  assert.equal(again.replayed, true); assert.equal(again.item_id, r.item_id);
  assert.equal(await points(bob), r.balance);
  const inv = await asUser(db, bob.id, () => db.query(`select item_id from public.fq_inventory where item_id = $1`, [r.item_id]));
  assert.equal(inv.rows.length, 1);
  await fails(call(bob, 'fq_open_box', { p_box_id: 'mystery', p_request_id: randomUUID() }), 'box_unavailable');

  // Premium never yields Common; rolled rarity always exists in the pool.
  const cat = await call(bob, 'fq_get_catalog');
  const prem = cat.boxes.find(b => b.id === 'premium');
  assert.equal(prem.pool.Common, undefined);
  for (let i = 0; i < 20; i++) {
    const x = await call(bob, 'fq_open_box', { p_box_id: 'premium', p_request_id: randomUUID() });
    assert.notEqual(x.rarity, 'Common');
    assert.ok(prem.pool[x.rarity].includes(x.item_id), 'reward must come from the advertised pool');
  }

  // Own every Common in the common box -> a Common roll must be a refunded duplicate.
  await db.query(`insert into public.fq_inventory (user_id, item_id, source)
                  select $1, id, 'test' from public.fq_items where 'common' = any(boxes) and rarity = 'Common' on conflict do nothing`, [bob.id]);
  let sawDup = false;
  for (let i = 0; i < 30 && !sawDup; i++) {
    const before = await points(bob);
    const x = await call(bob, 'fq_open_box', { p_box_id: 'common', p_request_id: randomUUID() });
    if (x.rarity === 'Common') {
      assert.equal(x.duplicate, true); assert.equal(x.refund, 10);
      assert.equal(await points(bob), before - 50 + 10);
      sawDup = true;
    }
  }
  assert.ok(sawDup, 'expected at least one Common roll in 30 opens (75% odds)');
});

test('blind box odds roughly match the advertised weights', async () => {
  const u = await createUser(db, { email: 'stats@example.com', password: 'stats-pass-1' });
  await grant(u, 200000);
  const counts = { Common: 0, Rare: 0, Epic: 0, Legendary: 0 };
  const N = 400;
  for (let i = 0; i < N; i++) counts[(await call(u, 'fq_open_box', { p_box_id: 'rare', p_request_id: randomUUID() })).rarity]++;
  // advertised: Common 40, Rare 45, Epic 12, Legendary 3
  assert.ok(Math.abs(counts.Common / N - 0.40) < 0.08, JSON.stringify(counts));
  assert.ok(Math.abs(counts.Rare / N - 0.45) < 0.08, JSON.stringify(counts));
  assert.ok(counts.Legendary / N < 0.08, JSON.stringify(counts));
});

test('box spend cannot exceed the balance', async () => {
  const u = await createUser(db, { email: 'poor@example.com', password: 'poor-pass-1' });
  await fails(call(u, 'fq_open_box', { p_box_id: 'premium', p_request_id: randomUUID() }), 'insufficient_points');
  assert.equal(await points(u), 100);
  await call(u, 'fq_open_box', { p_box_id: 'common', p_request_id: randomUUID() });
  await call(u, 'fq_open_box', { p_box_id: 'common', p_request_id: randomUUID() }).catch(() => {});
  assert.ok(await points(u) >= 0);
  const neg = await db.query(`select count(*)::int n from public.fq_transactions where balance_after < 0`);
  assert.equal(neg.rows[0].n, 0);
});

test('avatar saves only owned items in the right slot', async () => {
  const st = await call(alice, 'fq_get_state');
  const look = { ...st.profile.avatar, hair: 'hair_bun', hat: 'hat_bow', species: 'sp_cat', skin: '#ffe2c2' };
  const saved = await call(alice, 'fq_save_avatar', { p_avatar: look });
  assert.equal(saved.hair, 'hair_bun'); assert.equal(saved.species, 'sp_cat');
  await fails(call(alice, 'fq_save_avatar', { p_avatar: { ...look, wings: 'starlight_wings' } }), 'item_not_owned');
  await fails(call(alice, 'fq_save_avatar', { p_avatar: { ...look, hat: 'hair_bob' } }), 'invalid_avatar');
  await fails(call(alice, 'fq_save_avatar', { p_avatar: { ...look, skin: 'red;evil' } }), 'invalid_avatar');
  await fails(call(alice, 'fq_save_avatar', { p_avatar: { ...look, mode: 'custom', custom_path: `${bob.id}/x.png` } }), 'invalid_avatar');
  const clean = await call(alice, 'fq_save_avatar', { p_avatar: { species: null, junk: 'x' } });
  assert.equal(clean.species, 'sp_bunny'); assert.equal(clean.junk, undefined);
});

test('custom avatar uploads are confined to the owner folder', async () => {
  await asUser(db, alice.id, () => db.query(`insert into storage.objects (bucket_id, name, owner) values ('avatars', $1, $2)`, [`${alice.id}/me.png`, alice.id]));
  await fails(asUser(db, alice.id, () => db.query(`insert into storage.objects (bucket_id, name) values ('avatars', $1)`, [`${bob.id}/x.png`])), 'row-level security');
  const ok = await call(alice, 'fq_save_avatar', { p_avatar: { mode: 'custom', custom_path: `${alice.id}/me.png` } });
  assert.equal(ok.mode, 'custom');
  const seen = await asUser(db, bob.id, () => db.query(`select * from storage.objects`));
  assert.equal(seen.rows.length, 0, 'bob cannot list alice uploads');
});

test('settings are whitelisted and merged', async () => {
  const s = await call(alice, 'fq_save_settings', { p_settings: { theme: 'dark', font_scale: 9, accent: 'evil', evil: 1, language: 'zh',
    widgets: [{ id: 'games', on: false }, { id: 'hack', on: true }] } });
  assert.equal(s.theme, 'dark'); assert.equal(s.font_scale, 1); assert.equal(s.accent, 'pastel'); assert.equal(s.evil, undefined);
  assert.equal(s.language, 'zh');
  assert.deepEqual(s.widgets[0], { id: 'games', on: false });
  assert.equal(s.widgets.length, 15);
  const s2 = await call(alice, 'fq_save_settings', { p_settings: { density: 'compact' } });
  assert.equal(s2.theme, 'dark', 'partial save keeps previous values'); assert.equal(s2.density, 'compact');
});

test('quick tap: server enforces duration, plausibility, single use and daily cap', async () => {
  const u = await createUser(db, { email: 'tap@example.com', password: 'tap-pass-1' });
  const g = await call(u, 'fq_start_game', { p_game: 'quick_tap', p_difficulty: 'normal' });
  assert.equal(g.config.duration, 10);
  await fails(call(u, 'fq_finish_game', { p_session_id: g.session_id, p_score: 20, p_moves: null }), 'too_fast');
  await age(g.session_id, 11);
  await fails(call(u, 'fq_finish_game', { p_session_id: g.session_id, p_score: 500, p_moves: null }), 'score_rejected');
  const r = await call(u, 'fq_finish_game', { p_session_id: g.session_id, p_score: 25, p_moves: null });
  assert.equal(r.awarded, 20); // floor(25 * 0.8)
  await fails(call(u, 'fq_finish_game', { p_session_id: g.session_id, p_score: 25, p_moves: null }), 'session_invalid');
  await fails(call(bob, 'fq_finish_game', { p_session_id: g.session_id, p_score: 25, p_moves: null }), 'session_invalid');
  for (let i = 0; i < 4; i++) {
    const s = await call(u, 'fq_start_game', { p_game: 'quick_tap', p_difficulty: 'hard' });
    await age(s.session_id, 9);
    const x = await call(u, 'fq_finish_game', { p_session_id: s.session_id, p_score: 90, p_moves: null });
    assert.equal(x.awarded, 45, 'hard cap');
  }
  const s = await call(u, 'fq_start_game', { p_game: 'quick_tap', p_difficulty: 'easy' });
  await age(s.session_id, 16);
  const capped = await call(u, 'fq_finish_game', { p_session_id: s.session_id, p_score: 30, p_moves: null });
  assert.equal(capped.practice, true); assert.equal(capped.awarded, 0);
  await fails(call(u, 'fq_start_game', { p_game: 'chess', p_difficulty: 'easy' }), 'unknown_game');
});

test('memory match scoring and checks', async () => {
  const u = await createUser(db, { email: 'mem@example.com', password: 'mem-pass-1' });
  const g = await call(u, 'fq_start_game', { p_game: 'memory_match', p_difficulty: 'easy' });
  await age(g.session_id, 30);
  await fails(call(u, 'fq_finish_game', { p_session_id: g.session_id, p_score: 0, p_moves: 3 }), 'score_rejected');
  const r = await call(u, 'fq_finish_game', { p_session_id: g.session_id, p_score: 0, p_moves: 9 });
  assert.equal(r.awarded, 15);
  const h = await call(u, 'fq_start_game', { p_game: 'memory_match', p_difficulty: 'hard' });
  await age(h.session_id, 200);
  const late = await call(u, 'fq_finish_game', { p_session_id: h.session_id, p_score: 0, p_moves: 12 });
  assert.equal(late.awarded, 0); assert.equal(late.reason, 'time_up');
});

test('trivia answers are checked on the server and never sent in advance', async () => {
  const u = await createUser(db, { email: 'quiz@example.com', password: 'quiz-pass-1' });
  const g = await call(u, 'fq_start_game', { p_game: 'trivia', p_difficulty: 'easy' });
  assert.equal(g.questions.length, 5);
  assert.ok(g.questions.every(q => !('answer' in q)), 'answers must not be sent to the client');
  const key = Object.fromEntries((await db.query('select id, answer from fq_private.trivia')).rows.map(r => [r.id, r.answer]));
  const q = g.questions;
  const a1 = await call(u, 'fq_answer_trivia', { p_session_id: g.session_id, p_question_id: q[0].id, p_choice: key[q[0].id] });
  assert.equal(a1.correct, true); assert.equal(a1.awarded, 10);
  await fails(call(u, 'fq_answer_trivia', { p_session_id: g.session_id, p_question_id: q[0].id, p_choice: key[q[0].id] }), 'already_answered');
  const a2 = await call(u, 'fq_answer_trivia', { p_session_id: g.session_id, p_question_id: q[1].id, p_choice: (key[q[1].id] + 1) % 4 });
  assert.equal(a2.correct, false); assert.equal(a2.awarded, 0); assert.equal(a2.answer, key[q[1].id]);
  await fails(call(u, 'fq_answer_trivia', { p_session_id: g.session_id, p_question_id: 99999, p_choice: 0 }), 'session_invalid');
  for (const x of q.slice(2)) await call(u, 'fq_answer_trivia', { p_session_id: g.session_id, p_question_id: x.id, p_choice: key[x.id] });
  const fin = await call(u, 'fq_finish_game', { p_session_id: g.session_id, p_score: 999, p_moves: null });
  assert.equal(fin.score, 4, 'trivia score is counted server-side, client score ignored');
  // daily trivia cap (100)
  let total = 40;
  for (let round = 0; round < 3; round++) {
    const s = await call(u, 'fq_start_game', { p_game: 'trivia', p_difficulty: 'easy' });
    for (const x of s.questions) total += (await call(u, 'fq_answer_trivia', { p_session_id: s.session_id, p_question_id: x.id, p_choice: key[x.id] })).awarded;
    await call(u, 'fq_finish_game', { p_session_id: s.session_id, p_score: 0, p_moves: null });
  }
  assert.equal(total, 100);
});

test('missions and achievements are verified server-side', async () => {
  const u = await createUser(db, { email: 'miss@example.com', password: 'miss-pass-1' });
  let st = await call(u, 'fq_get_state');
  assert.equal(st.missions.length, 3);
  assert.equal(st.missions[0].id, 'm_login');
  await fails(call(u, 'fq_claim_mission', { p_mission_id: 'm_login' }), 'not_completed');
  await fails(call(u, 'fq_claim_achievement', { p_achievement_id: 'a_first_login' }), 'not_completed');
  await call(u, 'fq_claim_daily');
  const m = await call(u, 'fq_claim_mission', { p_mission_id: 'm_login' });
  assert.equal(m.awarded, 10);
  await fails(call(u, 'fq_claim_mission', { p_mission_id: 'm_login' }), 'already_claimed');
  const notToday = (await db.query(`select id from public.fq_missions where id not in (select id from fq_private.missions_for($1, fq_private.today()))`, [u.id])).rows[0].id;
  await fails(call(u, 'fq_claim_mission', { p_mission_id: notToday }), 'mission_unavailable');
  const a = await call(u, 'fq_claim_achievement', { p_achievement_id: 'a_first_login' });
  assert.equal(a.awarded, 10);
  await fails(call(u, 'fq_claim_achievement', { p_achievement_id: 'a_first_login' }), 'already_claimed');
  st = await call(u, 'fq_get_state');
  assert.equal(st.achievements.find(x => x.id === 'a_first_login').claimed, true);
});

test('daily challenge pays once when met', async () => {
  const u = await createUser(db, { email: 'chal@example.com', password: 'chal-pass-1' });
  const st = await call(u, 'fq_get_state');
  const ch = st.challenge;
  assert.ok(ch && ch.id);
  const diff = ch.difficulty === 'easy' ? 'normal' : ch.difficulty;  // harder still counts
  const play = async () => {
    const g = await call(u, 'fq_start_game', { p_game: ch.game, p_difficulty: diff });
    await age(g.session_id, 40);
    if (ch.game === 'trivia') {
      const key = Object.fromEntries((await db.query('select id, answer from fq_private.trivia')).rows.map(r => [r.id, r.answer]));
      for (const x of g.questions) await call(u, 'fq_answer_trivia', { p_session_id: g.session_id, p_question_id: x.id, p_choice: key[x.id] });
    }
    const pairs = g.config.pairs || 0;
    return call(u, 'fq_finish_game', { p_session_id: g.session_id, p_score: ch.game === 'quick_tap' ? 60 : 0, p_moves: ch.game === 'memory_match' ? pairs : null });
  };
  const r1 = await play();
  assert.equal(r1.challenge_completed, true); assert.equal(r1.challenge_awarded, ch.reward);
  const r2 = await play();
  assert.equal(r2.challenge_completed, false);
  assert.equal((await call(u, 'fq_get_state')).challenge.completed, true);
});

test('looks, profile and leaderboard', async () => {
  const st = await call(alice, 'fq_get_state');
  const l = await call(alice, 'fq_save_look', { p_name: 'Concert day', p_avatar: st.profile.avatar });
  assert.equal(l.name, 'Concert day');
  await fails(call(alice, 'fq_save_look', { p_name: '', p_avatar: st.profile.avatar }), 'invalid_name');
  await fails(call(bob, 'fq_delete_look', { p_look_id: l.id }), 'not_found');
  await call(alice, 'fq_delete_look', { p_look_id: l.id });
  const p = await call(alice, 'fq_set_profile', { p_display_name: '  Ali <b>ce</b> ', p_show_on_leaderboard: true });
  assert.equal(p.display_name, 'Ali bce/b');
  await call(bob, 'fq_set_profile', { p_display_name: 'Bob', p_show_on_leaderboard: false });
  const lb = await call(alice, 'fq_leaderboard');
  assert.ok(lb.top.some(x => x.me));
  assert.ok(!lb.top.some(x => x.name === 'Bob'), 'opted-out users are hidden');
  assert.ok(!JSON.stringify(lb).includes(bob.id), 'no user ids leak');
});
