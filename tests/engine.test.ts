import test from "node:test";
import assert from "node:assert/strict";
import {
  initialState,
  defaultAvatar,
  catalog,
  boxes,
  trivia,
} from "../shared/catalog";
import {
  dailyClaim,
  missionClaim,
  redeem,
  selectReward,
  startGame,
  publicRun,
  gameAction,
  gameReward,
  validateAvatar,
  validateSettings,
  settleGame,
  achievementClaim,
} from "../shared/engine";

test("daily gift is awarded once per UTC day and streaks reset after a missed day", () => {
  const s = initialState();
  assert.equal(dailyClaim(s, "2026-10-25"), 5);
  assert.equal(s.streak, 1);
  assert.throws(() => dailyClaim(s, "2026-10-25"));
  dailyClaim(s, "2026-10-26");
  assert.equal(s.streak, 2);
  dailyClaim(s, "2026-10-28");
  assert.equal(s.streak, 1);
});
test("missions cannot be claimed before completion or twice", () => {
  const s: any = initialState();
  assert.throws(() => missionClaim(s, "2026-10-25", "daily"));
  s.challengeDay = "2026-10-25";
  assert.equal(missionClaim(s, "2026-10-25", "daily"), 20);
  assert.throws(() => missionClaim(s, "2026-10-25", "daily"));
  assert.throws(() => missionClaim(s, "2026-10-25", "made-up"));
});
test("purchases reject insufficient balances and repeat ownership", () => {
  const s = initialState();
  assert.throws(() => redeem(s, 0, "cat"));
  const r = redeem(s, 150, "cat");
  assert.equal(r.amount, -120);
  assert.ok(s.inventory.includes("cat"));
  assert.throws(() => redeem(s, 999, "cat"));
  assert.throws(() => redeem(s, 999, "not-an-item"));
});
test("blind boxes charge the published cost and always grant a valid collectible", () => {
  for (const b of boxes) {
    const s = initialState();
    const r = redeem(s, b.cost, b.id, true);
    assert.equal(r.amount, -b.cost);
    assert.ok(catalog.some((i) => i.id === r.item.id));
    assert.ok(s.inventory.includes(r.item.id));
    assert.equal(s.stats.boxes, 1);
    assert.equal(s.boxHistory.length, 1);
  }
});
test("all 100 random slots reflect the published rarity odds for every box", () => {
  for (const b of boxes) {
    const counts: any = { Common: 0, Rare: 0, Legendary: 0 };
    for (let roll = 0; roll < 100; roll++)
      counts[selectReward(b.id, roll).rarity]++;
    assert.deepEqual(counts, b.odds);
  }
});
test("duplicate box finds keep inventory unique and are recorded", () => {
  const s = initialState();
  s.inventory = catalog.map((i) => i.id);
  const r = redeem(s, 200, "premium", true);
  assert.equal(r.duplicate, true);
  assert.equal(s.inventory.length, catalog.length);
  assert.equal(s.boxHistory[0].duplicate, true);
});
test("avatar cannot equip unowned items, fake categories or invalid colours", () => {
  const s = initialState();
  assert.deepEqual(
    validateAvatar(defaultAvatar(), s.inventory),
    defaultAvatar(),
  );
  assert.throws(() =>
    validateAvatar({ ...defaultAvatar(), Hat: "crown" }, s.inventory),
  );
  assert.throws(() =>
    validateAvatar({ ...defaultAvatar(), fur: "url(evil)" }, s.inventory),
  );
  assert.throws(() =>
    validateAvatar({ ...defaultAvatar(), Hat: "tee" }, s.inventory),
  );
  assert.throws(() => validateAvatar({}, s.inventory));
});
test("settings reject invalid colours, duplicate widgets and unsupported sizes", () => {
  const s = initialState().settings;
  assert.equal(validateSettings(s).theme, "light");
  assert.throws(() => validateSettings({ ...s, accent: "red;" }));
  assert.throws(() => validateSettings({ ...s, font: 99 }));
  assert.throws(() =>
    validateSettings({ ...s, widgets: ["daily", "daily", "games"] }),
  );
});
test("public game hides answers and face-down memory cards", () => {
  const r = startGame("trivia", "easy", 1000);
  const pub = publicRun(r);
  assert.equal(pub.deck, undefined);
  assert.equal(pub.questions, undefined);
  assert.equal(pub.question.answer, undefined);
  assert.ok(pub.cards.every((v: any) => v === null));
});
test("tap targets and sequence numbers cannot be replayed", () => {
  const r = startGame("tap", "easy", 1000),
    token = r.target.token;
  gameAction(r, { runId: r.id, seq: 0, move: "hit", token }, 1500);
  assert.equal(r.score, 1);
  assert.throws(() =>
    gameAction(r, { runId: r.id, seq: 0, move: "hit", token }, 2000),
  );
  assert.throws(() =>
    gameAction(r, { runId: r.id, seq: 1, move: "hit", token }, 2000),
  );
  assert.throws(() =>
    gameAction(
      r,
      { runId: "other", seq: 1, move: "hit", token: r.target.token },
      2000,
    ),
  );
});
test("server caps tap speed and final reward and enforces timer", () => {
  const r = startGame("tap", "easy", 1000);
  assert.throws(() =>
    gameAction(
      r,
      { runId: r.id, seq: 0, move: "hit", token: r.target.token },
      1050,
    ),
  );
  assert.throws(() =>
    gameAction(r, { runId: r.id, seq: 0, move: "finish" }, 2000),
  );
  r.score = 500;
  assert.equal(gameReward(r), 40);
  gameAction(r, { runId: r.id, seq: 0, move: "finish" }, 26000);
  assert.equal(r.done, true);
  assert.throws(() =>
    gameAction(r, { runId: r.id, seq: 1, move: "finish" }, 27000),
  );
});
test("pause freezes the timer, blocks moves and has a maximum duration", () => {
  const r = startGame("tap", "easy", 1000);
  gameAction(r, { runId: r.id, seq: 0, move: "pause" }, 2000);
  assert.throws(() =>
    gameAction(
      r,
      { runId: r.id, seq: 1, move: "hit", token: r.target.token },
      2500,
    ),
  );
  gameAction(r, { runId: r.id, seq: 1, move: "resume" }, 12000);
  assert.equal(r.deadline, 36000);
  assert.equal(r.paused, 10000);
  gameAction(r, { runId: r.id, seq: 2, move: "pause" }, 13000);
  assert.throws(() =>
    gameAction(r, { runId: r.id, seq: 3, move: "resume" }, 140000),
  );
});
test("trivia scores are computed from server answers and terminate after 5 questions", () => {
  const r = startGame("trivia", "hard", 1000);
  for (let i = 0; i < 5; i++)
    gameAction(
      r,
      {
        runId: r.id,
        seq: i,
        move: "answer",
        answer: trivia[r.questions[r.index]].answer,
      },
      2000 + i * 1000,
    );
  assert.equal(r.done, true);
  assert.equal(r.score, 5);
  assert.equal(gameReward(r), 50);
  assert.equal(publicRun(r).question, null);
});
test("expired trivia rejects answers and allows a single result", () => {
  const r = startGame("trivia", "easy", 1000);
  assert.throws(() =>
    gameAction(r, { runId: r.id, seq: 0, move: "answer", answer: 0 }, 92000),
  );
  gameAction(r, { runId: r.id, seq: 0, move: "finish" }, 92000);
  assert.equal(r.done, true);
  assert.equal(gameReward(r), 0);
});
test("memory rejects invalid and repeated cards and only awards complete matches", () => {
  const r = startGame("memory", "easy", 1000);
  assert.equal(gameReward(r), 0);
  assert.throws(() =>
    gameAction(r, { runId: r.id, seq: 0, move: "flip", card: 99 }, 2000),
  );
  gameAction(r, { runId: r.id, seq: 0, move: "flip", card: 0 }, 2000);
  assert.throws(() =>
    gameAction(r, { runId: r.id, seq: 1, move: "flip", card: 0 }, 2500),
  );
  const paired = r.deck.findIndex(
    (v: number, i: number) => i !== 0 && v === r.deck[0],
  );
  gameAction(r, { runId: r.id, seq: 1, move: "flip", card: paired }, 3000);
  assert.equal(r.score, 1);
  assert.equal(r.matched.length, 2);
  assert.throws(() =>
    gameAction(r, { runId: r.id, seq: 2, move: "flip", card: 0 }, 4000),
  );
});
test("a full memory board earns difficulty-based points and cannot claim twice", () => {
  for (const difficulty of ["easy", "hard"]) {
    const r = startGame("memory", difficulty, 1000);
    let seq = 0,
      now = 1500;
    for (let value = 0; value < (difficulty === "hard" ? 8 : 6); value++) {
      const indices = r.deck.flatMap((v: number, i: number) =>
        v === value ? [i] : [],
      );
      for (const card of indices) {
        gameAction(r, { runId: r.id, seq: seq++, move: "flip", card }, now);
        now += 500;
      }
    }
    assert.equal(r.done, true);
    assert.equal(gameReward(r), difficulty === "hard" ? 40 : 25);
    assert.throws(() =>
      gameAction(r, { runId: r.id, seq, move: "finish" }, now),
    );
  }
});
test("abandoned memory rounds earn no points", () => {
  const r = startGame("memory", "easy", 1000);
  r.score = 2;
  gameAction(r, { runId: r.id, seq: 0, move: "finish" }, 2000);
  assert.equal(gameReward(r), 0);
  assert.equal(r.score, 0);
});

test("only three runs per game/day earn rewards and settling cannot be repeated", () => {
  const s: any = initialState();
  const day = "2026-10-25";
  for (let i = 0; i < 5; i++) {
    s.run = startGame("tap", "easy", 1000);
    s.run.score = 10;
    s.run.done = true;
    assert.equal(settleGame(s, day), i < 3 ? 10 : 0);
    assert.throws(() => settleGame(s, day));
  }
  assert.equal(s.stats.games, 5);
  s.run = startGame("tap", "easy", 1000);
  s.run.score = 10;
  s.run.done = true;
  assert.equal(settleGame(s, "2026-10-26"), 10);
});

test("achievement bonuses require earned badges and pay only once", () => {
  const s = initialState();
  assert.throws(() => achievementClaim(s, "0"));
  s.stats.games = 1;
  assert.equal(achievementClaim(s, "0"), 20);
  assert.throws(() => achievementClaim(s, "0"));
  assert.throws(() => achievementClaim(s, "7"));
});
