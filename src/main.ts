import "./style.css";
import {
  getUser,
  login,
  logout,
  signup,
  requestPasswordRecovery,
  updateUser,
  handleAuthCallback,
  hydrateSession,
  getSettings,
  acceptInvite,
  onAuthChange,
} from "@netlify/identity";
import {
  catalog,
  categories,
  boxes,
  defaultAvatar,
  dailyGame,
  achievementList,
} from "../shared/catalog";
import { avatar, gift } from "./avatar";
const app = document.querySelector<HTMLDivElement>("#app")!,
  modal = document.querySelector<HTMLDialogElement>("#modal")!;
let user: any = null,
  data: any = null,
  page = "home",
  category = "All",
  gameKind = "",
  busy = false,
  authMode = "login",
  authSettings: any = null,
  draft: any = null,
  gameBusy = false,
  timer: any,
  toastTimer: any,
  lastResult: any = null,
  inviteToken = "";
const paths: Record<string, string> = {
  home: "M3 10l9-7 9 7v11h-6v-7H9v7H3z",
  avatar:
    "M7 9V5a2 2 0 014 0v3m2 0V5a2 2 0 014 0v4M5 14a7 7 0 1014 0 7 7 0 00-14 0M9 14h.1M15 14h.1M10 18h4",
  wardrobe: "M8 3l4 3 4-3 6 5-4 4v9H6v-9L2 8z",
  games:
    "M7 7h10a4 4 0 014 3l1 7a3 3 0 01-5 2l-3-3h-4l-3 3a3 3 0 01-5-2l1-7a4 4 0 014-3zM7 10v5m-2-2h4m7-2h.1m2 3h.1",
  missions: "M8 4H5v17h14V4h-3M8 2h8v5H8zM8 12l2 2 5-4M8 18h7",
  shop: "M3 8h18v5H3zM5 13v8h14v-8M12 8v13M12 8C3 7 5-3 12 8c7-11 9-1 0 0",
  collection: "M4 4h7v7H4zM14 4h7v7h-7zM4 14h7v7H4zM14 14h7v7h-7z",
  achievements:
    "M7 3h10v7a5 5 0 01-10 0zM7 5H3v3a4 4 0 004 4M17 5h4v3a4 4 0 01-4 4M12 15v6m-4 0h8",
  settings: "M12 3a9 9 0 100 18 9 9 0 000-18M12 8a4 4 0 100 8 4 4 0 000-8",
  profile: "M12 3a4 4 0 100 8 4 4 0 000-8M4 21a8 8 0 0116 0",
  star: "M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z",
  heart: "M12 21S2 15 2 8a5 5 0 0110-2A5 5 0 0122 8c0 7-10 13-10 13z",
  logout: "M9 3H3v18h6m6-15 6 6-6 6m-8-6h14",
  book: "M3 3h8v18H3zM13 3h8v18h-8z",
  tap: "M9 14V5a2 2 0 014 0v8m0-4 6 3v6l-3 4h-6l-6-7a2 2 0 013-2l2 1",
  trivia: "M8 8a4 4 0 118 0c0 3-4 3-4 6m0 4h.1M3 3h18v18H3z",
  memory: "M3 4h8v14H3zM14 7h7v14h-7zM6 9h2m-2 4h2m9 0h1m-1 4h1",
  calendar: "M3 5h18v16H3zM7 2v6m10-6v6M3 11h18",
  menu: "M3 6h18M3 12h18M3 18h18",
  moon: "M20 16A9 9 0 018 4a9 9 0 1012 12",
  check: "M4 12l5 5L20 6",
  lock: "M6 10h12v11H6zM8 10V6a4 4 0 018 0v4",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  spark: "M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z",
};
function icon(name: string, cls = "") {
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.star}"/></svg>`;
}
function esc(s: any) {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
function toast(message: string) {
  const el = document.querySelector("#toast")!;
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 4500);
}
function btn(label: string, action: string, secondary = false, extra = "") {
  return `<button class="button ${secondary ? "secondary" : ""}" data-action="${action}" ${extra}>${label}</button>`;
}
function nav(label: string, id: string, ico = id) {
  return `<button class="nav-item ${page === id ? "active" : ""}" data-page="${id}">${icon(ico)}<span>${label}</span></button>`;
}
function header(
  title: string,
  description: string,
  eyebrow = "YOUR LITTLE WORLD",
) {
  return `<div class="page-head"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${description}</p></div><div class="date-pill">${new Date().toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}</div></div>`;
}
function preview(a = data.state.avatar) {
  return avatar(a, data.state.customImage, data.state.imageVersion);
}
function applyTheme() {
  if (!data) return;
  const s = data.state.settings;
  document.documentElement.dataset.theme = s.theme;
  document.documentElement.style.setProperty("--accent", s.accent);
  document.documentElement.style.fontSize = s.font + "px";
  document.body.className = `${s.background} ${s.density === "compact" ? "compact" : ""} ${!s.motion ? "no-motion" : ""} ${!s.sidebar ? "hidden-nav" : ""}`;
}
async function api(body?: any) {
  await getUser();
  const response = await fetch(
    "/api/quest",
    body
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestId: crypto.randomUUID(), ...body }),
        }
      : { cache: "no-store" },
  );
  const json = await response.json();
  if (!response.ok) {
    if (response.status === 401) {
      user = null;
      data = null;
      renderAuth();
    }
    throw new Error(json.error || "Unable to connect.");
  }
  data = json;
  applyTheme();
  return json;
}
async function perform(body: any, success = "", redraw = true) {
  if (busy) return;
  busy = true;
  try {
    const result = await api(body);
    if (redraw) render();
    if (success) toast(success);
    return result;
  } catch (e) {
    toast((e as Error).message);
  } finally {
    busy = false;
  }
}
function shell(content: string) {
  const name = esc(data.name);
  return `<div class="shell"><aside class="sidebar"><div class="brand"><span class="brand-mark">${icon("spark")}</span><div><strong>fan quest</strong><small>your happy place</small></div></div><div class="nav-label">YOUR WORLD</div>${nav("Home Dashboard", "home")}${nav("My Avatar", "avatar")}${nav("Wardrobe", "wardrobe")}${nav("Games", "games")}${nav("Daily Missions", "missions")}${nav("Blind Box Shop", "shop")}${nav("My Collection", "collection")}${nav("Achievements", "achievements")}<div class="nav-sep"></div>${nav("Fandom & School", "legacy", "book")}${nav("Profile & Settings", "settings")}<div class="sidebar-bottom"><div class="sidebar-note"><b>A little progress is still progress.</b>Your next favourite thing is one small quest away.</div><div class="side-profile"><div class="mini">${avatar(data.state.avatar)}</div><div><b>${name}</b><br><small>Daydream explorer</small></div><button data-action="logout" aria-label="Log out">${icon("logout")}</button></div></div></aside><div class="main"><header class="topbar"><button class="mobile-menu" data-action="menu" aria-label="Toggle navigation">${icon("menu")}</button><span class="crumb">My little world <span style="margin:0 12px">/</span> ${esc(({ home: "Home Dashboard", avatar: "My Avatar", wardrobe: "Wardrobe", games: "Games", missions: "Daily Missions", shop: "Blind Box Shop", collection: "My Collection", achievements: "Achievements", settings: "Profile & Settings", legacy: "Fandom & School" } as any)[page])}</span><div class="topbar-right"><span class="wallet"><span class="coin">✦</span><span>${data.balance.toLocaleString()} Fan Points</span></span><button class="button ghost" data-action="theme" aria-label="Toggle dark mode">${icon("moon")}</button><button class="button ghost" data-page="settings" aria-label="My profile">${icon("profile")}</button></div></header><main class="content">${content}<div class="footer-note">MADE FOR THE THINGS YOU LOVE · FAN QUEST</div></main></div></div>`;
}
const gameInfo: any = {
  tap: {
    name: "Quick Tap",
    full: "Quick Tap Challenge",
    desc: "Catch a little joy. Tap the stars before time runs out.",
    reward: "Up to 40 points per game",
    icon: "tap",
  },
  trivia: {
    name: "Fan Trivia",
    full: "Fan Trivia",
    desc: "A little fan knowledge goes a long way.",
    reward: "10 points per correct answer",
    icon: "trivia",
  },
  memory: {
    name: "Memory Match",
    full: "Memory Match",
    desc: "Find the pairs. Make a little magic.",
    reward: "25–40 points for a complete board",
    icon: "memory",
  },
};
function gameCards() {
  return `<div class="game-grid">${Object.entries(gameInfo)
    .map(
      ([id, g]: any) =>
        `<article class="card game-card"><div class="game-illustration">${icon(g.icon)}</div><h3>${g.name}</h3><p>${g.desc}</p><span class="reward-note">${g.reward}</span>${btn("Let’s play " + icon("arrow"), "selectGame", true, `data-kind="${id}"`)}</article>`,
    )
    .join("")}</div>`;
}
function dailyCard() {
  const claimed = data.state.daily === data.day;
  return `<div class="card daily-card"><div class="stamp">${icon("calendar")}</div><div><h3>A little gift for showing up</h3><p>Day ${data.state.streak || 1} of your adventure<br>Come back every day to grow your streak.</p></div>${btn(claimed ? "Claimed ✓" : "+5 · Claim gift", "daily", false, claimed ? "disabled" : "")}</div>`;
}
function home() {
  const s = data.state;
  const percent = Math.round((s.inventory.length / catalog.length) * 100);
  const widgets: any = {
    daily: `<div class="section-top row"><h2>Your daily little boost</h2><small style="font-size:9px">RESETS AT 00:00 UTC</small></div>${dailyCard()}`,
    games: `<div class="section-top row"><h2>A moment to play</h2><button class="button ghost" data-page="games">All games ${icon("arrow")}</button></div>${gameCards()}`,
    collection: `<div class="section-top row"><h2>Today’s quests</h2><button class="button ghost" data-page="missions">View missions ${icon("arrow")}</button></div><div class="card row"><div><h3 style="margin-bottom:5px">One little adventure</h3><p class="muted" style="font-size:11px;margin:0">Play ${gameInfo[dailyGame(data.day)].full} for today’s challenge.</p></div>${btn("Explore", "dailyGame", true)}</div>`,
  };
  return `${header(`Hello, ${esc(data.name.split(" ")[0])} <span style="color:#c79d70;font-size:24px">✦</span>`, "A new day, a little adventure. Make it your own.")}<div class="home-grid"><div><section class="card hero"><div><span class="pill">YOUR ADVENTURE STARTS HERE</span><h2>A little world.<br>A lot of you.</h2><p>Dress up your daydreams, collect little treasures, and find joy in every quest.</p><button class="button" data-page="avatar">Make it yours ${icon("arrow")}</button></div>${avatar(s.avatar)}</section><div class="stats-strip"><div class="stat">${icon("star")}<div><b>${data.balance}</b><small>FAN POINTS</small></div></div><div class="stat">${icon("heart")}<div><b>${s.streak} <span style="font:10px 'DM Sans'">days</span></b><small>LOGIN STREAK</small></div></div><div class="stat">${icon("collection")}<div><b>${s.inventory.length}<span style="font:10px 'DM Sans';color:var(--muted)"> / ${catalog.length}</span></b><small>ITEMS COLLECTED</small></div></div></div>${s.settings.widgets.map((w: string) => widgets[w]).join("")}</div><aside><section class="card avatar-card"><div class="eyebrow" style="margin-bottom:8px">YOUR LITTLE COMPANION</div><h3>${catalog.find((i) => i.id === s.avatar.Character)?.name || "Mochi bunny"}</h3><span class="tag">ONE OF A KIND</span>${preview()}<div class="sub">A little reflection of you.</div><button class="button secondary" data-page="avatar">${icon("wardrobe")} Edit my avatar</button></section><div class="home-right" style="margin-top:20px"><section class="card box-feature"><div class="eyebrow">A LITTLE SURPRISE</div><h2>Good things come<br>in little boxes.</h2><p>Your next favourite find is waiting.<br>Open a box. Meet a new possibility.</p>${gift()}<button class="button" data-page="shop">Explore blind boxes ${icon("arrow")}</button></section><section class="card collection-preview"><div class="row"><h3>Little treasures</h3>${icon("collection")}</div><div class="tiny-items">${["wardrobe", "star", "heart", "spark"].map((i) => `<span class="tiny-item">${icon(i)}</span>`).join("")}</div><div class="row"><small style="font-size:9px">Your collection</small><small style="font-size:9px">${percent}%</small></div><div class="progress"><span style="width:${percent}%"></span></div><p>${s.inventory.length} of ${catalog.length} little joys found.</p><button class="button ghost" style="font-size:10px;margin-top:15px" data-page="collection">See my collection ${icon("arrow")}</button></section></div></aside></div>`;
}
function categoryIcon(c: string) {
  return (
    {
      Character: "avatar",
      Hair: "spark",
      Top: "wardrobe",
      Bottom: "wardrobe",
      Dress: "wardrobe",
      Shoes: "wardrobe",
      Hat: "star",
      Glasses: "settings",
      Jewellery: "heart",
      Wings: "spark",
      Bag: "shop",
      Background: "home",
      Frame: "collection",
      Pose: "avatar",
      Effect: "spark",
    } as any
  )[c];
}
function itemCard(i: any, editor = false, ownedOnly = false) {
  const s = data.state,
    owned = s.inventory.includes(i.id),
    equipped = (draft || s.avatar)[i.category] === i.id;
  return `<article class="card item-card ${owned ? "owned" : ""} ${equipped ? "equipped" : ""}"><div class="item-art" style="color:${i.color};background:color-mix(in srgb,${i.color} 13%,var(--surface))">${icon(categoryIcon(i.category))}</div><span class="badge ${i.rarity}">${i.rarity}</span><h3>${i.name}</h3><p>${i.category} · ${owned ? "Owned" : i.cost + " points"}</p>${owned ? btn(equipped ? "Unequip" : "Equip", editor ? "equipDraft" : "equip", !equipped, `data-id="${i.id}" ${equipped && i.category === "Character" ? "disabled" : ""}`) : btn(`${icon("lock")} ${i.cost} points`, "buy", true, `data-id="${i.id}"`)}</article>`;
}
function categoryTabs() {
  return `<div class="tabs">${["All", ...categories].map((c) => `<button class="${category === c ? "active" : ""}" data-category="${c}">${c}</button>`).join("")}</div>`;
}
function wardrobe(collection = false) {
  const items = catalog.filter(
    (i) =>
      (category === "All" || i.category === category) &&
      (!collection || data.state.inventory.includes(i.id)),
  );
  return `${header(collection ? "My little treasures" : "The wardrobe", collection ? "Every little find has a place here." : "Find something that feels like you. Every item shows its price.")}<div class="card row" style="margin-bottom:25px"><div><h3 style="margin-bottom:5px">${data.state.inventory.length} of ${catalog.length} collected</h3><small style="font-size:11px">${Math.round((data.state.inventory.length / catalog.length) * 100)}% of your collection complete</small></div><button class="button secondary" data-page="avatar">Dress up ${icon("arrow")}</button></div>${categoryTabs()}<div class="cards-grid">${items.map((i) => itemCard(i)).join("") || '<div class="empty">No treasures in this category yet. Earn points and visit the wardrobe or blind box shop.</div>'}</div>${collection ? boxHistory() : ""}`;
}
function avatarPage() {
  draft ??= structuredClone(data.state.avatar);
  return `${header("A little more you", "Mix, match, and make a companion that’s entirely yours.")}<div class="editor-grid"><section class="card editor-preview"><div id="live-preview">${avatar(draft, data.state.customImage, data.state.imageVersion)}</div><div class="color-row">${[
    ["fur", "Skin / fur"],
    ["eye", "Eyes"],
    ["hairColor", "Hair"],
  ]
    .map(
      ([k, l]) =>
        `<label>${l}<input type="color" data-color="${k}" value="${draft[k] || "#a27869"}"></label>`,
    )
    .join(
      "",
    )}</div><div style="margin-top:18px">${btn("Save appearance", "saveAvatar")}${btn("Reset", "resetAvatar", true)}</div><p class="note">Try owned items in the live preview, then save your look. A dress replaces your top and bottom visually.</p><label class="field">Upload a custom avatar<input type="file" id="avatar-file" accept="image/png,image/jpeg,image/webp"></label><p class="note">PNG, JPEG or WebP · up to 1 MB.<br>Uploaded images replace the dress-up preview.</p>${data.state.customImage ? btn("Use dress-up avatar", "removeImage", true) : ""}<hr style="border:0;border-top:1px solid var(--line);margin:20px 0"><h3>Saved looks</h3>${btn("Save this look", "savePreset", true)}<div style="margin-top:15px">${data.state.presets.map((p: any) => `<div class="look-row"><span>${esc(p.name)}</span>${btn("Wear", "wearPreset", true, `data-id="${p.id}"`)}${btn("×", "deletePreset", true, `data-id="${p.id}" aria-label="Delete saved look"`)}</div>`).join("") || '<p class="note">Save your appearance first, then keep up to 8 favourite looks.</p>'}</div></section><section>${categoryTabs()}<div class="cards-grid">${catalog
    .filter((i) => category === "All" || i.category === category)
    .map((i) => itemCard(i, true))
    .join("")}</div></section></div>`;
}
function missions() {
  const s = data.state;
  return `${header("Small quests, lovely rewards", "A fresh set of little adventures, every day. Resets at midnight UTC.")} ${dailyCard()}<div style="margin-top:24px">${[
    {
      id: "play",
      name: "A moment to play",
      desc: "Finish any mini-game today.",
      done: s.playDay === data.day,
      reward: 10,
    },
    {
      id: "style",
      name: "Wear your imagination",
      desc: "Save an avatar appearance today.",
      done: s.styleDay === data.day,
      reward: 10,
    },
    {
      id: "daily",
      name: "The daily challenge",
      desc: `Earn a positive score in ${gameInfo[dailyGame(data.day)].full} today.`,
      done: s.challengeDay === data.day,
      reward: 20,
    },
  ]
    .map(
      (m) =>
        `<section class="card mission"><div class="stamp">${icon(m.done ? "check" : "missions")}</div><div><h3>${m.name} <span class="badge">+${m.reward} points</span></h3><p>${m.desc}</p></div>${s.missions[data.day + ":" + m.id] ? btn("Claimed ✓", "", true, "disabled") : m.done ? btn("Claim reward", "claimMission", false, `data-id="${m.id}"`) : btn("Begin quest", "missionGo", true, `data-id="${m.id}"`)}</section>`,
    )
    .join(
      "",
    )}</div><div class="card"><h2>Make a little habit</h2><p class="note">Your login streak is ${s.streak} ${s.streak === 1 ? "day" : "days"}. Claim your daily gift on consecutive UTC days to keep it growing. Daily gifts and mission rewards can only be claimed once.</p></div>`;
}
function shop() {
  return `${header("A lovely little surprise", "Spend earned Fan Points on a mystery collectible. See every possibility before you open.")}<div class="box-grid">${boxes
    .map(
      (b) =>
        `<article class="card shop-box" style="border-top:4px solid ${b.color}">${gift(b.color)}<div class="eyebrow">${b.label}</div><h2>${b.name}</h2><p>One random collectible.<br>Duplicates stay in your box history.</p><div class="odds">${Object.entries(
          b.odds,
        )
          .map(([r, o]) => `<span>${r}<br><b>${o}%</b></span>`)
          .join(
            "",
          )}</div>${btn(`${b.cost} points · Open box`, "boxConfirm", false, `data-id="${b.id}"`)}<button class="button ghost" style="margin:15px auto 0;font-size:10px" data-action="boxOdds" data-id="${b.id}">See possible rewards</button></article>`,
    )
    .join(
      "",
    )}</div><p class="note">Fan Points are earned in the app and cannot be purchased, transferred, or redeemed for money. Each opening awards one item. Rarity is selected using the odds above, then each item in that rarity has an equal chance. Duplicates do not increase your owned item count and are not refunded. No rare item is guaranteed. This is a recreational collection feature; availability may depend on your local rules.</p>${boxHistory()}`;
}
function boxHistory() {
  return `<div class="section-top row"><h2>Your unboxed treasures</h2><small style="font-size:10px">${data.state.stats.boxes} boxes opened</small></div><div class="card">${
    data.state.boxHistory.length
      ? `<table class="history"><thead><tr><th>Found</th><th>Box</th><th>Date</th></tr></thead><tbody>${data.state.boxHistory
          .slice(0, 20)
          .map(
            (h: any) =>
              `<tr><td>${esc(catalog.find((i) => i.id === h.item)?.name)}${h.duplicate ? " · duplicate" : ""}</td><td>${esc(boxes.find((b) => b.id === h.box)?.label)}</td><td>${h.date}</td></tr>`,
          )
          .join("")}</tbody></table>`
      : '<div class="empty">Your first surprise is still waiting. Play games to earn points for a box.</div>'
  }</div>`;
}
function achievements() {
  return `${header("Little things, big feelings", "Milestones from your own adventure. Badges unlock as you play and collect.")}<div class="settings-grid">${achievementList(
    data.state,
  )
    .map(
      (a, index) =>
        `<div class="card achievement ${a.earned ? "" : "locked"}">${icon(a.earned ? "achievements" : "lock")}<div><h3>${a.name}</h3><p>${a.detail}</p><span class="badge" style="margin:10px 0 0">${a.earned ? "Unlocked" : "Keep exploring"}</span>${a.earned ? (data.state.achievementClaims?.[index] ? '<p class="note">Bonus claimed ✓</p>' : btn("Claim +20 points", "claimAchievement", true, `data-id="${index}"`)) : ""}</div></div>`,
    )
    .join("")}</div>`;
}
function games() {
  const r = data.state.run;
  if (!gameKind)
    return `${header("A moment to play", "A little challenge. A little joy. Points for your next favourite find.")}<div class="card daily-card" style="margin-bottom:25px"><div class="stamp">${icon("star")}</div><div><h3>Today’s challenge: ${gameInfo[dailyGame(data.day)].full}</h3><p>Earn a positive score, then claim your 20-point bonus in Daily Missions.</p></div>${btn("Play", "dailyGame")}</div>${gameCards()}<p class="note">The first 3 completed runs per game each UTC day earn Fan Points. Further runs are practice. Scores, timers, card matches and point awards are checked on the server.</p>${r && !r.done ? btn("Resume active " + gameInfo[r.kind].name, "resumeActive", true) : ""}`;
  const g = gameInfo[gameKind];
  const active = r && r.kind === gameKind;
  return `${header(g.full, g.desc)}${btn("← All games", "allGames", true)}<section class="card" style="margin-top:20px"><div class="game-controls"><label class="field inline" style="margin:0">Difficulty <select id="difficulty"><option value="easy" ${r?.difficulty === "easy" ? "selected" : ""}>Easy</option><option value="hard" ${r?.difficulty === "hard" ? "selected" : ""}>Hard</option></select></label>${btn(active ? "Restart" : "Start game", "startGame")}${active && !r.done && r.kind !== "trivia" ? btn(r.pauseAt ? "Resume" : "Pause", r.pauseAt ? "resume" : "pause", true) : ""}${active && !r.done ? btn("Finish", "finishGame", true) : ""}</div><p class="note">${gameKind === "tap" ? "Tap each star target once during the 25-second round. Hard mode uses smaller targets. Pause is available for up to 2 minutes total." : gameKind === "trivia" ? "Answer 5 questions within 90 seconds. Each correct answer earns 10 points. Trivia cannot be paused." : `Flip cards two at a time and find all matching symbols within 3 minutes. Easy has 6 pairs; hard has 8. Pause is available for up to 2 minutes total.`}</p>${!active ? '<div class="empty">Ready for a little adventure? Press Start game.</div>' : r.done ? `<div class="result"><span class="eyebrow">ADVENTURE COMPLETE</span><h2>${r.kind === "memory" && r.score === 0 ? "Every try is a little progress." : "You made a little magic."}</h2><div class="big-number">+${r.reward || 0}</div><p>Fan Points earned · Score: ${r.score}</p><p class="note">${r.reward ? "Your reward is saved to your wallet." : "Zero points can mean an unfinished board, no correct answers, or the daily reward limit. Play again for practice."}</p>${btn("Play again", "startGame")}${btn("Daily missions", "toMissions", true)}</div>` : `<div class="game-hud"><span><b id="game-time">${timeRemaining(r)}</b> seconds</span><span><b>${r.score}</b> ${r.kind === "memory" ? "pairs" : "score"}</span><span>${r.kind === "trivia" ? `${r.index + 1}/5 questions` : r.pauseAt ? "Paused" : ""}</span></div>${r.pauseAt ? '<div class="empty">A little breather. Resume when you’re ready.</div>' : r.kind === "tap" ? `<div class="game-stage"><button class="target" data-action="hit" aria-label="Tap the star" style="left:${r.target.x}%;top:${r.target.y}%;${r.difficulty === "hard" ? "width:42px;height:42px" : ""}">${icon("star")}</button></div>` : r.kind === "trivia" ? `<div class="question"><div class="eyebrow">QUESTION ${r.index + 1} OF 5</div><h2>${esc(r.question.q)}</h2><div class="answers">${r.question.options.map((v: string, i: number) => `<button data-action="answer" data-answer="${i}">${esc(v)}</button>`).join("")}</div></div>` : `<div class="memory-grid">${r.cards.map((v: number | null, i: number) => `<button class="memory-card ${r.matched.includes(i) ? "matched" : ""}" data-action="flip" data-card="${i}" aria-label="${v === null ? "Face-down card " + (i + 1) : "Symbol " + (v + 1)}" ${r.matched.includes(i) ? "disabled" : ""}>${v === null ? icon("spark") : icon(["heart", "star", "avatar", "shop", "wardrobe", "moon", "spark", "book"][v])}</button>`).join("")}</div>`}`}</section>`;
}
function timeRemaining(r: any) {
  return Math.max(
    0,
    Math.ceil((r.deadline - (r.pauseAt || Date.now())) / 1000),
  );
}
function history() {
  return `<table class="history"><thead><tr><th>Adventure</th><th>Date</th><th>Points</th></tr></thead><tbody>${data.history.map((t: any) => `<tr><td>${esc(t.description)}</td><td>${new Date(t.created_at).toLocaleDateString()}</td><td class="${t.amount > 0 ? "positive" : "negative"}">${t.amount > 0 ? "+" : ""}${t.amount}</td></tr>`).join("")}</tbody></table>`;
}
function settings() {
  const s = data.state.settings;
  return `${header("Your own kind of lovely", "Your profile, preferences, and little details. Saved to your account.")}<div class="settings-grid"><div><section class="card"><div class="row"><div><span class="eyebrow">DAYDREAM EXPLORER</span><h2 style="margin:12px 0">${esc(data.name)}</h2><p class="muted" style="font-size:11px">${esc(user.email)}</p></div><div style="width:110px">${preview()}</div></div><div class="stats-strip"><div><b>${data.balance}</b><br><small>Fan Points</small></div><div><b>${data.state.stats.games}</b><br><small>Games played</small></div><div><b>${data.state.stats.correct}</b><br><small>Trivia correct</small></div></div><p class="note">Equipped: ${Object.entries(
    data.state.avatar,
  )
    .filter(([k]) => categories.includes(k))
    .map(([, v]) => catalog.find((i) => i.id === v)?.name)
    .filter(Boolean)
    .join(
      ", ",
    )}.</p>${btn("Edit avatar", "toAvatar", true)} ${btn("Log out", "logout", true)}</section><section class="card" style="margin-top:22px"><h2>Account details</h2><form id="profile-form"><label class="field">Display name<input name="name" maxlength="40" value="${esc(data.name)}" required></label><button class="button" type="submit">Save name</button></form><form id="password-form" style="margin-top:25px"><label class="field">New password<input name="password" type="password" autocomplete="new-password" minlength="10" maxlength="200" placeholder="At least 10 characters" required></label><label class="field">Confirm new password<input name="confirm" type="password" autocomplete="new-password" minlength="10" maxlength="200" required></label><button class="button secondary" type="submit">Change password</button></form></section><section class="card" style="margin-top:22px"><h2>Recent point transactions</h2>${data.history.length ? history() : '<div class="empty">Your story starts here. Claim your daily gift to earn your first points.</div>'}</section></div><section class="card"><h2>Make yourself at home</h2><form id="settings-form"><label class="field">Appearance<select name="theme" aria-label="Appearance"><option value="light" ${s.theme === "light" ? "selected" : ""}>Light · morning milk</option><option value="dark" ${s.theme === "dark" ? "selected" : ""}>Dark · midnight tea</option></select></label><label class="field">Accent colour<div class="row"><input type="color" aria-label="Accent colour" name="accent" value="${s.accent}"><div class="tabs" style="margin:0">${["#a45d78", "#b57b99", "#9682b1", "#7599b4", "#8a9d78"].map((c) => `<button type="button" data-action="accent" data-value="${c}" style="background:${c};width:28px;height:28px;padding:0" aria-label="Accent ${c}"></button>`).join("")}</div></div></label><label class="field">Background<select name="background">${["petals", "dots", "plain"].map((v) => `<option ${v === s.background ? "selected" : ""}>${v}</option>`).join("")}</select></label><label class="field">Interface density<select name="density">${["comfortable", "compact"].map((v) => `<option ${v === s.density ? "selected" : ""}>${v}</option>`).join("")}</select></label><label class="field">Font size<select name="font">${[14, 16, 18, 20].map((v) => `<option value="${v}" ${v === s.font ? "selected" : ""}>${v}px</option>`).join("")}</select></label><label class="field">First dashboard widget<select name="firstWidget">${s.widgets.map((w: string) => `<option value="${w}">${({ daily: "Daily gift", games: "Games", collection: "Today’s quests" } as any)[w]}</option>`).join("")}</select></label><label class="field">Second dashboard widget<select name="secondWidget">${s.widgets.map((w: string, i: number) => `<option value="${w}" ${i === 1 ? "selected" : ""}>${({ daily: "Daily gift", games: "Games", collection: "Today’s quests" } as any)[w]}</option>`).join("")}</select></label>${[
    ["sidebar", "Show sidebar"],
    ["sound", "Sound effects"],
    ["motion", "Animations"],
  ]
    .map(
      ([k, l]) =>
        `<label class="field inline">${l}<input type="checkbox" name="${k}" ${s[k] ? "checked" : ""}></label>`,
    )
    .join(
      "",
    )}<label class="field">Language<select disabled><option>English</option></select><small>More translations are not available yet.</small></label><button class="button" type="submit">Save my preferences</button></form><p class="note">Preferences follow your account across devices. Reduced-motion preferences from your device are also respected.</p></section></div>`;
}
function legacy() {
  return `${header("The things you love", "Your original fandom tracker, school planner, focus garden, and backups.")}<p class="note">The original workspace stays intact. Its tracking rewards are separate from the server-validated Fan Points wallet. Use Settings → Backup inside the workspace to import an existing backup.</p>${btn("Import this device’s original data", "importLegacy", true)}<div id="legacy-sync" class="note" role="status">Account workspace · loading…</div><iframe title="Original Fan Quest workspace" src="/api/workspace" class="legacy-frame"></iframe>`;
}
function render() {
  clearInterval(timer);
  if (!user || !data) return;
  const content = (
    {
      home,
      avatar: avatarPage,
      wardrobe: () => wardrobe(),
      collection: () => wardrobe(true),
      games,
      missions,
      shop,
      achievements,
      settings,
      legacy,
    } as any
  )[page]();
  app.innerHTML = shell(content);
  if (page === "games" && gameKind && data.state.run && !data.state.run.done) {
    timer = setInterval(() => {
      const r = data.state.run;
      const t = document.querySelector("#game-time");
      if (t) t.textContent = String(timeRemaining(r));
      if (!r.pauseAt && timeRemaining(r) === 0 && !gameBusy) move("finish");
    }, 500);
  }
}
function navigate(id: string) {
  page = id;
  category = "All";
  draft = null;
  if (id !== "games") gameKind = "";
  render();
  window.scrollTo({ top: 0, behavior: "instant" });
}
function authBrand() {
  return `<div class="brand"><span class="brand-mark">${icon("spark")}</span><div><strong>fan quest</strong><small>your happy place</small></div></div>`;
}
function renderAuth(message = "") {
  clearInterval(timer);
  document.body.className = "";
  app.innerHTML = `<main class="auth"><section class="auth-art">${avatar({ ...defaultAvatar(), Hat: "beret" })}<span class="pill">A WORLD MADE FOR YOU</span><h1>Your happy<br>little place.</h1><p>Dress up your daydreams. Collect little treasures.<br>Make room for the things you love.</p></section><section class="auth-form"><div class="auth-inner">${authBrand()}<div class="eyebrow">${authMode === "login" ? "YOUR NEXT ADVENTURE AWAITS" : "A NEW LITTLE BEGINNING"}</div><h2>${authMode === "login" ? "Welcome home." : authMode === "signup" ? "Find your little world." : authMode === "reset" ? "A fresh start." : "Let’s get you home."}</h2><p>${authMode === "login" ? "Sign in to your own corner of Fan Quest." : authMode === "signup" ? "Create your account and start collecting little joys." : authMode === "reset" ? "Choose a new password for your account." : "We’ll send a password reset link to your email."}</p><form id="auth-form">${authMode === "signup" ? '<label class="field">Your name<input name="name" autocomplete="nickname" maxlength="40" required placeholder="What should we call you?"></label>' : ""}${authMode !== "reset" ? `<label class="field">${authMode === "login" ? "Email or user ID" : "Email"}<input name="email" type="${authMode === "login" ? "text" : "email"}" autocomplete="username" required placeholder="${authMode === "login" ? "Your email or jujiang" : "you@example.com"}"></label>` : ""}${authMode !== "recover" ? `<label class="field">Password<div class="password-field"><input name="password" id="auth-password" aria-label="Password" type="password" autocomplete="${authMode === "login" ? "current-password" : "new-password"}" minlength="${authMode === "login" ? 1 : 10}" maxlength="200" placeholder="${authMode === "login" ? "Your password" : "At least 10 characters"}" required><button type="button" data-action="showPassword">Show</button></div></label>` : ""}<p class="error" id="auth-error" role="alert">${esc(message)}</p><button class="button" type="submit">${authMode === "login" ? "Step inside" : authMode === "signup" ? "Create my account" : authMode === "reset" ? "Save new password" : "Send recovery email"} ${icon("arrow")}</button></form><div class="auth-links">${authMode === "login" ? `<button data-auth="recover">Forgot password?</button>${authSettings && !authSettings.disableSignup ? '<button data-auth="signup">Create an account</button>' : ""}` : '<button data-auth="login">Back to sign in</button>'}</div><p class="note" style="text-align:center;margin-top:45px">A little progress. A little joy. Every day.</p></div></section></main>`;
}
async function enter() {
  user = await getUser();
  if (!user) {
    renderAuth();
    return;
  }
  app.innerHTML = '<div class="boot">Gathering your little treasures…</div>';
  try {
    await api();
    authMode = "login";
    render();
  } catch (e) {
    app.innerHTML = `<div class="auth-form" style="min-height:100vh"><div class="auth-inner">${authBrand()}<h2>Your world needs a moment.</h2><p class="error">${esc((e as Error).message)}</p><p class="note">The database is created during deployment. If this is a new setup, let the first deploy finish and try again.</p>${btn("Try again", "retry")} ${btn("Log out", "logout", true)}</div></div>`;
  }
}
async function handleAuth(form: HTMLFormElement) {
  const f = new FormData(form);
  const email = String(f.get("email") || "").trim(),
    password = String(f.get("password") || "");
  const submit = form.querySelector<HTMLButtonElement>("[type=submit]")!;
  submit.disabled = true;
  try {
    if (authMode === "recover") {
      await requestPasswordRecovery(email);
      document.querySelector("#auth-error")!.textContent =
        "If the address is registered, a recovery email is on its way.";
      return;
    }
    if (authMode === "reset") {
      if (inviteToken) {
        await acceptInvite(inviteToken, password);
        inviteToken = "";
      } else await updateUser({ password });
      toast("Password updated. Welcome home.");
      await enter();
      return;
    }
    if (authMode === "signup") {
      await signup(email, password, { full_name: String(f.get("name")) });
      if (await getUser()) {
        await enter();
        return;
      }
      authMode = "login";
      renderAuth("Check your email to confirm your account, then sign in.");
      return;
    }
    if (email === "jujiang") {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error);
      await hydrateSession();
    } else await login(email, password);
    await enter();
  } catch (e) {
    document.querySelector("#auth-error")!.textContent =
      (e as Error).message || "Unable to sign in.";
  } finally {
    submit.disabled = false;
  }
}
function confirmDialog(
  title: string,
  message: string,
  onConfirm: () => Promise<void>,
  label = "Confirm",
) {
  modal.innerHTML = `<h2>${title}</h2><p>${message}</p><p class="error" id="dialog-error"></p><div class="actions"><button class="button secondary" id="cancel-dialog">Cancel</button><button class="button" id="confirm-dialog">${label}</button></div>`;
  modal.showModal();
  modal
    .querySelector("#cancel-dialog")!
    .addEventListener("click", () => modal.close());
  modal
    .querySelector("#confirm-dialog")!
    .addEventListener("click", async () => {
      const b = modal.querySelector<HTMLButtonElement>("#confirm-dialog")!;
      b.disabled = true;
      try {
        await onConfirm();
      } catch (e) {
        const err = modal.querySelector("#dialog-error");
        if (err) err.textContent = (e as Error).message;
      } finally {
        if (b.isConnected) b.disabled = false;
      }
    });
}
async function purchase(id: string, box = false) {
  const item = box
    ? boxes.find((b) => b.id === id)
    : catalog.find((i) => i.id === id);
  if (!item) return;
  confirmDialog(
    box ? "A little surprise?" : "A new little favourite?",
    `Spend <b>${item.cost} Fan Points</b> on ${esc(item.name)}? Your balance is ${data.balance} points.${box ? " One random item is awarded. Duplicates are possible and are not refunded." : ""}`,
    async () => {
      const r = await api({ action: box ? "box" : "buy", id });
      render();
      if (!box) {
        modal.close();
        toast("Added to your wardrobe.");
        return;
      }
      const found = r.result;
      modal.innerHTML = `<div class="opening">${gift((item as any).color)}<div class="eyebrow">UNWRAPPING A LITTLE JOY…</div></div>`;
      setTimeout(
        () => {
          modal.innerHTML = `<div style="text-align:center"><div class="item-art" style="color:${found.item.color}">${icon(categoryIcon(found.item.category))}</div><span class="badge ${found.item.rarity}">${found.item.rarity}</span><h2>${found.item.name}</h2><p>${found.duplicate ? "You found a duplicate! It has been recorded in your box history." : "A new little treasure, now in your wardrobe."}</p><div class="actions"><button class="button secondary" id="close-result">Lovely!</button><button class="button" id="wear-result">Visit wardrobe</button></div></div>`;
          modal
            .querySelector("#close-result")!
            .addEventListener("click", () => modal.close());
          modal.querySelector("#wear-result")!.addEventListener("click", () => {
            modal.close();
            navigate("wardrobe");
          });
          sound();
        },
        data.state.settings.motion ? 1500 : 0,
      );
    },
    box
      ? "Open for " + item.cost + " points"
      : "Redeem for " + item.cost + " points",
  );
}
function sound() {
  if (!data?.state.settings.sound) return;
  try {
    const c = new AudioContext(),
      o = c.createOscillator(),
      g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.frequency.setValueAtTime(660, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(990, c.currentTime + 0.15);
    g.gain.setValueAtTime(0.04, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3);
    o.start();
    o.stop(c.currentTime + 0.3);
    o.onended = () => c.close();
  } catch {}
}
async function move(moveName: string, extra: any = {}) {
  const r = data?.state.run;
  if (gameBusy || !r || r.done) return;
  gameBusy = true;
  try {
    await api({
      action: "move",
      move: moveName,
      runId: r.id,
      seq: r.seq,
      ...extra,
    });
    if (moveName === "hit" || data.state.run?.feedback === true) sound();
    render();
  } catch (e) {
    toast((e as Error).message);
    if (!String((e as Error).message).startsWith("Slow")) {
      try {
        await api();
        render();
      } catch {}
    }
  } finally {
    gameBusy = false;
  }
}
app.addEventListener("click", async (event) => {
  const t = (event.target as HTMLElement).closest<HTMLElement>("button");
  if (!t) return;
  if (t.dataset.page) {
    navigate(t.dataset.page);
    return;
  }
  if (t.dataset.auth) {
    authMode = t.dataset.auth;
    renderAuth();
    return;
  }
  if (t.dataset.category) {
    category = t.dataset.category;
    render();
    return;
  }
  const a = t.dataset.action,
    id = t.dataset.id || "";
  if (a === "showPassword") {
    const input = document.querySelector<HTMLInputElement>("#auth-password")!;
    input.type = input.type === "password" ? "text" : "password";
    t.textContent = input.type === "password" ? "Show" : "Hide";
  }
  if (a === "logout") {
    await logout();
    user = null;
    data = null;
    draft = null;
    gameKind = "";
    modal.close();
    renderAuth();
  }
  if (a === "menu") {
    document.querySelector(".sidebar")?.classList.toggle("open");
    if (document.body.classList.contains("hidden-nav")) {
      document.body.classList.remove("hidden-nav");
      document.querySelector(".sidebar")?.classList.add("open");
    }
  }
  if (a === "retry") await enter();
  if (a === "theme")
    await perform({
      action: "settings",
      settings: {
        ...data.state.settings,
        theme: data.state.settings.theme === "light" ? "dark" : "light",
      },
    });
  if (a === "daily")
    await perform({ action: "daily" }, "A little gift: +5 Fan Points.");
  if (a === "buy") await purchase(id);
  if (a === "boxConfirm") await purchase(id, true);
  if (a === "boxOdds") {
    const b = boxes.find((b) => b.id === id)!;
    modal.innerHTML = `<h2>${b.name} · odds</h2><p>Rarity chances: ${Object.entries(
      b.odds,
    )
      .map(([r, o]) => `${r}: ${o}%`)
      .join(
        ", ",
      )}. Within each rarity, every listed item has an equal chance.</p><div style="max-height:50vh;overflow:auto">${[
      "Common",
      "Rare",
      "Legendary",
    ]
      .map(
        (r) =>
          `<h3>${r} · ${b.odds[r]}%</h3><p>${catalog
            .filter((i) => i.rarity === r)
            .map(
              (i) =>
                `${i.name} (${(b.odds[r] / catalog.filter((v) => v.rarity === r).length).toFixed(2)}%)`,
            )
            .join("<br>")}</p>`,
      )
      .join("")}</div><button class="button" id="close-odds">Got it</button>`;
    modal.showModal();
    modal
      .querySelector("#close-odds")!
      .addEventListener("click", () => modal.close());
  }
  if (a === "equipDraft" || a === "equip") {
    const i = catalog.find((v) => v.id === id)!;
    if (a === "equipDraft") {
      if (draft[i.category] === id && i.category !== "Character")
        delete draft[i.category];
      else draft[i.category] = id;
      render();
    } else {
      const av = structuredClone(data.state.avatar);
      if (av[i.category] === id && i.category !== "Character")
        delete av[i.category];
      else av[i.category] = id;
      await perform({ action: "avatar", avatar: av }, "Appearance saved.");
    }
  }
  if (a === "saveAvatar") {
    const r = await perform(
      { action: "avatar", avatar: draft },
      "Your look is saved.",
    );
    if (r) draft = null;
  }
  if (a === "resetAvatar")
    confirmDialog(
      "A fresh little start?",
      "Reset your appearance to the starter Mochi bunny? Your owned items and saved looks stay in your wardrobe.",
      async () => {
        draft = null;
        await api({ action: "reset" });
        render();
        modal.close();
      },
      "Reset appearance",
    );
  if (a === "removeImage")
    await perform({ action: "removeImage" }, "Dress-up avatar restored.");
  if (a === "savePreset") {
    if (data.state.presets.length >= 8) {
      toast("You can save up to 8 looks.");
      return;
    }
    modal.innerHTML = `<h2>Keep this little look</h2><form id="preset-form"><label class="field">Look name<input name="name" maxlength="40" required placeholder="A Sunday daydream"></label><p class="note">This saves your current account appearance. Save your editor changes first.</p><button class="button" type="submit">Save look</button><button class="button secondary" type="button" id="cancel-preset">Cancel</button></form>`;
    modal.showModal();
    modal
      .querySelector("#cancel-preset")!
      .addEventListener("click", () => modal.close());
  }
  if (a === "wearPreset") {
    const p = data.state.presets.find((p: any) => p.id === id);
    draft = structuredClone(p.avatar);
    await perform({ action: "avatar", avatar: draft }, "Saved look equipped.");
  }
  if (a === "deletePreset")
    await perform({ action: "deletePreset", id }, "Saved look removed.");
  if (a === "claimAchievement")
    await perform(
      { action: "achievement", id },
      "Achievement bonus: +20 Fan Points.",
    );
  if (a === "claimMission")
    await perform(
      { action: "mission", id },
      "Mission reward added to your wallet.",
    );
  if (a === "missionGo") {
    if (id === "style") navigate("avatar");
    else {
      page = "games";
      gameKind = id === "daily" ? dailyGame(data.day) : "";
      render();
    }
  }
  if (a === "selectGame") {
    gameKind = t.dataset.kind!;
    page = "games";
    render();
  }
  if (a === "dailyGame") {
    page = "games";
    gameKind = dailyGame(data.day);
    render();
  }
  if (a === "resumeActive") {
    gameKind = data.state.run.kind;
    render();
  }
  if (a === "allGames") {
    gameKind = "";
    render();
  }
  if (a === "toMissions") navigate("missions");
  if (a === "toAvatar") navigate("avatar");
  if (a === "startGame") {
    const difficulty =
      document.querySelector<HTMLSelectElement>("#difficulty")?.value || "easy";
    if (data.state.run && !data.state.run.done)
      confirmDialog(
        "Start a fresh round?",
        "Your current unfinished round is replaced without earning points.",
        async () => {
          await api({ action: "start", kind: gameKind, difficulty });
          modal.close();
          render();
        },
        "Restart",
      );
    else await perform({ action: "start", kind: gameKind, difficulty });
  }
  if (a === "pause" || a === "resume") await move(a);
  if (a === "finishGame") await move("finish");
  if (a === "hit") await move("hit", { token: data.state.run.target.token });
  if (a === "answer")
    await move("answer", { answer: Number(t.dataset.answer) });
  if (a === "flip") await move("flip", { card: Number(t.dataset.card) });
  if (a === "accent") {
    const f = document.querySelector<HTMLFormElement>("#settings-form")!;
    (f.elements.namedItem("accent") as HTMLInputElement).value =
      t.dataset.value!;
  }
  if (a === "importLegacy") {
    const stored = localStorage.getItem("fandom-wallet-v1");
    if (!stored) {
      toast(
        "No original data found on this device. Use a text backup inside the workspace.",
      );
      return;
    }
    confirmDialog(
      "Import your original workspace?",
      "Copy the original tracker data from this browser into this account? This replaces the account’s current fandom and school workspace. Your Fan Points and wardrobe are separate.",
      async () => {
        const legacy = JSON.parse(stored);
        await api({ action: "legacy", legacy });
        modal.close();
        render();
        toast("Original data imported to your account.");
      },
      "Import data",
    );
  }
});
app.addEventListener("input", (e) => {
  const t = e.target as HTMLInputElement;
  if (t.dataset.color && draft) {
    draft[t.dataset.color] = t.value;
    document.querySelector("#live-preview")!.innerHTML = avatar(
      draft,
      data.state.customImage,
      data.state.imageVersion,
    );
  }
});
app.addEventListener("change", async (e) => {
  const input = e.target as HTMLInputElement;
  if (input.id !== "avatar-file" || !input.files?.[0]) return;
  const f = input.files[0];
  if (
    f.size > 1048576 ||
    !["image/png", "image/jpeg", "image/webp"].includes(f.type)
  ) {
    toast("Choose a PNG, JPEG or WebP image under 1 MB.");
    input.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      if (image.width > 4096 || image.height > 4096) {
        toast("Please use an image no larger than 4096 × 4096.");
        return;
      }
      modal.innerHTML = `<h2>Your new little portrait</h2><img src="${reader.result}" alt="Upload preview" style="width:100%;max-height:300px;object-fit:contain;border-radius:12px"><div class="actions"><button class="button secondary" id="cancel-upload">Cancel</button><button class="button" id="confirm-upload">Use this image</button></div>`;
      modal.showModal();
      modal
        .querySelector("#cancel-upload")!
        .addEventListener("click", () => modal.close());
      modal
        .querySelector("#confirm-upload")!
        .addEventListener("click", async () => {
          const b = modal.querySelector<HTMLButtonElement>("#confirm-upload")!;
          b.disabled = true;
          try {
            await api({ action: "upload", image: reader.result });
            modal.close();
            render();
            toast("Portrait saved.");
          } catch (e) {
            toast((e as Error).message);
            b.disabled = false;
          }
        });
    };
    image.onerror = () => toast("This image could not be read.");
    image.src = String(reader.result);
  };
  reader.readAsDataURL(f);
});
app.addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target as HTMLFormElement;
  if (f.id === "auth-form") {
    await handleAuth(f);
    return;
  }
  const b = f.querySelector<HTMLButtonElement>("[type=submit]");
  if (b) b.disabled = true;
  try {
    const v = new FormData(f);
    if (f.id === "settings-form") {
      const first = String(v.get("firstWidget")),
        second = String(v.get("secondWidget"));
      if (first === second)
        throw new Error("Choose different first and second widgets.");
      await api({
        action: "settings",
        settings: {
          theme: v.get("theme"),
          accent: v.get("accent"),
          background: v.get("background"),
          density: v.get("density"),
          font: Number(v.get("font")),
          sidebar: v.has("sidebar"),
          motion: v.has("motion"),
          sound: v.has("sound"),
          widgets: [
            first,
            second,
            ...["daily", "games", "collection"].filter(
              (w) => w !== first && w !== second,
            ),
          ],
        },
      });
      render();
      toast("Your preferences are saved.");
    }
    if (f.id === "password-form") {
      if (v.get("password") !== v.get("confirm"))
        throw new Error("The passwords do not match.");
      await updateUser({ password: String(v.get("password")) });
      f.reset();
      toast("Password updated securely.");
    }
    if (f.id === "profile-form") {
      const name = String(v.get("name") || "").trim();
      if (!name) throw new Error("Choose a display name.");
      await updateUser({ data: { full_name: name } });
      await api({ action: "name", name });
      render();
      toast("Your name is saved.");
    }
  } catch (e) {
    toast((e as Error).message);
  } finally {
    if (b) b.disabled = false;
  }
});
modal.addEventListener("submit", async (e) => {
  const f = e.target as HTMLFormElement;
  if (f.id !== "preset-form") return;
  e.preventDefault();
  const b = f.querySelector<HTMLButtonElement>("[type=submit]")!;
  b.disabled = true;
  try {
    await api({ action: "preset", name: new FormData(f).get("name") });
    modal.close();
    render();
    toast("Look saved.");
  } catch (e) {
    toast((e as Error).message);
    b.disabled = false;
  }
});
window.addEventListener("message", async (e) => {
  const frame = document.querySelector<HTMLIFrameElement>(".legacy-frame");
  if (e.origin !== location.origin || e.source !== frame?.contentWindow) return;
  if (e.data?.type === "legacy-status") {
    const el = document.querySelector("#legacy-sync");
    if (el)
      el.textContent = e.data.ok
        ? "Workspace saved to your account."
        : "Workspace sync failed. Your browser copy is preserved; retry or export a backup.";
  }
});
async function init() {
  try {
    authSettings = await getSettings();
  } catch {}
  try {
    const cb = await handleAuthCallback();
    if (cb?.type === "recovery") {
      user = cb.user;
      authMode = "reset";
      renderAuth();
      return;
    }
    if (cb?.type === "invite") {
      inviteToken = cb.token;
      authMode = "reset";
      renderAuth();
      return;
    }
  } catch (e) {
    renderAuth((e as Error).message);
    return;
  }
  await enter();
}
onAuthChange((event) => {
  if (event === "logout") {
    authMode = "login";
    user = null;
    data = null;
    draft = null;
    modal.close();
    renderAuth();
  }
});
init();
