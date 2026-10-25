import { randomInt, randomUUID } from "node:crypto";
import {
  catalog,
  boxes,
  trivia,
  dailyGame,
  defaultAvatar,
  achievementList,
} from "./catalog";
export function requireThat(ok: any, message: string) {
  if (!ok) throw new Error(message);
}
export function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function selectReward(boxId: string, roll = randomInt(100)) {
  const b = boxes.find((b) => b.id === boxId);
  requireThat(b, "Unknown box");
  let threshold = 0;
  let rarity = "Common";
  for (const [r, odds] of Object.entries(b!.odds)) {
    threshold += odds;
    if (roll < threshold) {
      rarity = r;
      break;
    }
  }
  const pool = catalog.filter((i) => i.rarity === rarity);
  return pool[randomInt(pool.length)];
}
export function startGame(kind: string, difficulty: string, now = Date.now()) {
  requireThat(["tap", "trivia", "memory"].includes(kind), "Unknown game");
  requireThat(["easy", "hard"].includes(difficulty), "Invalid difficulty");
  const pairs = difficulty === "hard" ? 8 : 6;
  return {
    id: randomUUID(),
    kind,
    difficulty,
    start: now,
    deadline:
      now + (kind === "tap" ? 25000 : kind === "trivia" ? 90000 : 180000),
    seq: 0,
    score: 0,
    paused: 0,
    pauseAt: 0,
    last: now,
    done: false,
    matched: [],
    revealed: [],
    deck: shuffled(Array.from({ length: pairs }, (_, i) => [i, i]).flat()),
    questions: shuffled(trivia.map((_, i) => i)).slice(0, 5),
    index: 0,
    target: { token: randomUUID(), x: randomInt(12, 83), y: randomInt(12, 78) },
  } as any;
}
export function publicRun(r: any) {
  if (!r) return null;
  const { deck, questions, ...rest } = r;
  return {
    ...rest,
    cardCount: deck.length,
    cards: deck.map((v: number, i: number) =>
      r.done || r.matched.includes(i) || r.revealed.includes(i) ? v : null,
    ),
    question:
      r.kind === "trivia" && !r.done
        ? {
            q: trivia[questions[r.index]].q,
            options: trivia[questions[r.index]].options,
          }
        : null,
  };
}
export function gameAction(r: any, input: any, now = Date.now()) {
  requireThat(r && !r.done, "Start a new game");
  requireThat(input.runId === r.id, "This game has been replaced");
  requireThat(input.seq === r.seq, "Move already processed. Refresh the game.");
  if (input.move === "pause") {
    requireThat(
      r.kind !== "trivia" &&
        !r.pauseAt &&
        r.paused < 120000 &&
        now < r.deadline,
      "Cannot pause",
    );
    r.pauseAt = now;
    r.seq++;
    return;
  }
  if (input.move === "resume") {
    requireThat(r.pauseAt, "Game is not paused");
    const duration = now - r.pauseAt;
    requireThat(
      r.paused + duration <= 120000,
      "Pause limit reached. Restart the game.",
    );
    r.deadline += duration;
    r.paused += duration;
    r.pauseAt = 0;
    r.seq++;
    return;
  }
  requireThat(!r.pauseAt, "Resume the game first");
  if (input.move === "finish") {
    requireThat(
      r.kind !== "tap" || now >= r.deadline,
      "The timer is still running",
    );
    r.done = true;
    if (r.kind === "memory" && r.matched.length !== r.deck.length) r.score = 0;
    r.seq++;
    return;
  }
  requireThat(now < r.deadline, "Time is up. Finish to see your result.");
  requireThat(now - r.last >= 180, "Slow down a little");
  if (r.kind === "tap") {
    requireThat(
      input.move === "hit" && input.token === r.target.token,
      "Target already tapped",
    );
    r.score++;
    r.target = {
      token: randomUUID(),
      x: randomInt(12, 83),
      y: randomInt(12, 78),
    };
  }
  if (r.kind === "trivia") {
    requireThat(
      input.move === "answer" &&
        Number.isInteger(input.answer) &&
        input.answer >= 0 &&
        input.answer < 4,
      "Choose an answer",
    );
    r.feedback = input.answer === trivia[r.questions[r.index]].answer;
    r.score += r.feedback ? 1 : 0;
    r.index++;
    if (r.index === r.questions.length) r.done = true;
  }
  if (r.kind === "memory") {
    const i = input.card;
    requireThat(
      input.move === "flip" &&
        Number.isInteger(i) &&
        i >= 0 &&
        i < r.deck.length &&
        !r.matched.includes(i),
      "Invalid card",
    );
    if (r.revealed.length === 2) r.revealed = [];
    requireThat(!r.revealed.includes(i), "Choose another card");
    r.revealed.push(i);
    if (r.revealed.length === 2 && r.deck[r.revealed[0]] === r.deck[i]) {
      r.matched.push(...r.revealed);
      r.revealed = [];
      r.score++;
    }
    if (r.matched.length === r.deck.length) r.done = true;
  }
  r.last = now;
  r.seq++;
}
export function gameReward(r: any) {
  return r.kind === "trivia"
    ? r.score * 10
    : r.kind === "tap"
      ? Math.min(40, r.score)
      : r.matched.length === r.deck.length
        ? r.difficulty === "hard"
          ? 40
          : 25
        : 0;
}
export function validateAvatar(avatar: any, inventory: string[]) {
  requireThat(avatar && typeof avatar === "object", "Invalid appearance");
  const result: any = {};
  for (const [key, value] of Object.entries(avatar)) {
    if (["fur", "eye", "hairColor"].includes(key)) {
      requireThat(
        typeof value === "string" && /^#[\da-f]{6}$/i.test(value),
        "Invalid colour",
      );
      result[key] = value;
      continue;
    }
    const item = catalog.find((i) => i.id === value && i.category === key);
    requireThat(item && inventory.includes(item.id), "Equip owned items only");
    result[key] = value;
  }
  requireThat(result.Character, "Choose a character");
  return result;
}
export function validateSettings(s: any) {
  requireThat(
    s && ["light", "dark"].includes(s.theme) && /^#[\da-f]{6}$/i.test(s.accent),
    "Invalid theme",
  );
  requireThat(
    ["petals", "dots", "plain"].includes(s.background) &&
      ["comfortable", "compact"].includes(s.density),
    "Invalid layout",
  );
  requireThat([14, 16, 18, 20].includes(Number(s.font)), "Invalid font size");
  requireThat(
    Array.isArray(s.widgets) &&
      s.widgets.length === 3 &&
      new Set(s.widgets).size === 3 &&
      s.widgets.every((w: string) =>
        ["daily", "games", "collection"].includes(w),
      ),
    "Invalid widgets",
  );
  return {
    theme: s.theme,
    accent: s.accent,
    background: s.background,
    density: s.density,
    font: Number(s.font),
    sidebar: !!s.sidebar,
    sound: !!s.sound,
    motion: !!s.motion,
    widgets: s.widgets,
  };
}
export function dailyClaim(state: any, day: string) {
  requireThat(state.daily !== day, "Already claimed today");
  state.streak =
    state.daily ===
    new Date(Date.parse(day) - 86400000).toISOString().slice(0, 10)
      ? state.streak + 1
      : 1;
  state.daily = day;
  return 5;
}
export function missionClaim(state: any, day: string, id: string) {
  requireThat(["play", "daily", "style"].includes(id), "Unknown mission");
  const key = day + ":" + id;
  requireThat(!state.missions[key], "Mission already claimed");
  requireThat(
    id === "play"
      ? state.playDay === day
      : id === "daily"
        ? state.challengeDay === day
        : state.styleDay === day,
    "Complete the objective first",
  );
  state.missions[key] = true;
  return id === "daily" ? 20 : 10;
}
export function redeem(
  state: any,
  balance: number,
  id: string,
  box = false,
  day = new Date().toISOString().slice(0, 10),
) {
  const item = box
    ? boxes.find((b) => b.id === id)
    : catalog.find((i) => i.id === id);
  requireThat(item && item.cost > 0, "Unknown item");
  requireThat(balance >= item!.cost, "Not enough Fan Points");
  requireThat(
    box || !state.inventory.includes(id),
    "You already own this item",
  );
  const reward = box ? selectReward(id) : item!;
  const duplicate = state.inventory.includes(reward.id);
  if (!duplicate) state.inventory.push(reward.id);
  if (box) {
    state.stats.boxes++;
    state.boxHistory.unshift({
      id: randomUUID(),
      box: id,
      item: reward.id,
      date: day,
      duplicate,
    });
    state.boxHistory = state.boxHistory.slice(0, 100);
  }
  return { amount: -item!.cost, item: reward, duplicate };
}

export function settleGame(state: any, day: string) {
  const r = state.run;
  requireThat(
    r?.done && !r.settled,
    "Game result already claimed or unfinished",
  );
  state.stats.games++;
  state.playDay = day;
  if (r.kind === "trivia") state.stats.correct += r.score;
  if (r.kind === "memory" && r.matched.length === r.deck.length)
    state.stats.wins++;
  const countKey = day + ":" + r.kind;
  state.rewardCounts ??= {};
  const count = state.rewardCounts[countKey] || 0;
  const reward = count < 3 ? gameReward(r) : 0;
  state.rewardCounts[countKey] = count + 1;
  r.reward = reward;
  r.settled = true;
  if (gameReward(r) > 0 && r.kind === dailyGame(day)) state.challengeDay = day;
  return reward;
}

export function achievementClaim(state: any, id: string) {
  requireThat(
    typeof id === "string" && /^[0-5]$/.test(id),
    "Unknown achievement",
  );
  const a = achievementList(state)[Number(id)];
  state.achievementClaims ??= {};
  requireThat(a.earned, "Complete the achievement first");
  requireThat(!state.achievementClaims[id], "Already claimed this achievement");
  state.achievementClaims[id] = true;
  return 20;
}
