// Home dashboard: greeting + user-arranged widgets.
import { store, profile } from '../store.js';
import { rpc } from '../api.js';
import { t, L } from '../i18n.js';
import { esc, fmt, fmtDate } from '../ui.js';
import { icon } from '../icons.js';
import { bar, ring, txList, missionRow, pointsPill } from '../components.js';
import { claimDaily, claimMission } from '../actions.js';
import { currentSettings } from '../theme.js';
import { loadLegacy } from '../legacy-loader.js';
import { financeMonth, caloriesDay, milkteaStats, money, life } from '../life-store.js';

// Widgets that read the original Fan tracker's data (fandoms, timetable, to-dos).
export const TRACKER_WIDGETS = ['fandom', 'schedule', 'todo', 'life'];
const lg = () => window.FQLegacy;
const loadingCard = (ic, title) => `<section class="fq-card"><div class="fq-card-h"><h2 class="fq-h2">${icon(ic)}${esc(title)}</h2></div><div class="fq-skel" style="height:120px"></div></section>`;
const daysBox = (n, hot) => `<span class="fq-days${hot ? ' hot' : ''}">${n < 0 ? '!' : n}<small>${esc(n < 0 ? t('dash.late', 'late') : n === 1 ? t('dash.day', 'day') : t('dash.days', 'days'))}</small></span>`;

const GAME_ICONS = { quick_tap: ['bolt', '#ffd76a'], trivia: ['bulb', '#a3e3bd'], memory_match: ['cards', '#9fd6ff'] };
export const gameName = g => ({ quick_tap: t('games.tap.name', 'Quick Tap'), trivia: t('games.trivia.name', 'Fan Trivia'), memory_match: t('games.memory.name', 'Memory Match') }[g] || g);

function weekDots(p, claimedToday) {
  // last 7 days ending today; streak counts back from last_login_day
  const days = [];
  const today = new Date(store.state.today + 'T00:00:00');
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const last = p.last_login_day ? new Date(p.last_login_day + 'T00:00:00') : null;
    const diff = last ? Math.round((last - d) / 864e5) : -1;
    const on = last && diff >= 0 && diff < p.streak;
    days.push(`<span class="${on ? 'on' : ''} ${i === 0 ? 'today' : ''}" title="${d.toDateString()}">${on ? icon('flame') : ''}${d.toLocaleDateString(document.documentElement.lang, { weekday: 'narrow' })}</span>`);
  }
  return `<div class="fq-week" aria-label="${esc(t('dash.streak', '{n}-day streak', { n: p.streak }))}">${days.join('')}</div>`;
}

// "Loving EXO since 3 Mar 2014 · 4,623 days" — one line per fandom with something logged.
function loveLines() {
  const L = lg(); if (!L) return '';
  const lines = L.FANDOMS.map(f => ({ f, d: L.firstLove(f.id) })).filter(x => x.d).sort((a, b) => a.d.localeCompare(b.d));
  if (!lines.length) return '';
  return `<div class="fq-love">${lines.map(({ f, d }) => { const n = -L.daysTo(d.slice(0, 10));
    return `<a href="#/tracker/${f.id}">${icon('heart')}<span>${esc(t('dash.loving', 'Loving {name} since {date}', { name: f.id === 'lads' ? f.sub || f.name : f.name, date: fmtDate(d.slice(0, 10) + 'T00:00:00') }))}</span><b class="fq-num">D+${n.toLocaleString()}</b></a>`; }).join('')}</div>`;
}

// Cute greeting bits for the Home hero
const hr = () => new Date().getHours();
const greetKey = () => hr() < 12 ? 'dash.morning' : hr() < 18 ? 'dash.afternoon' : 'dash.evening';
const greetEn = () => hr() < 12 ? 'Good morning, {name}!' : hr() < 18 ? 'Good afternoon, {name}!' : 'Good evening, {name}!';
const stamp = () => { const d = new Date(), pad = n => String(n).padStart(2, '0'); return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} · ${d.toLocaleDateString('en', { weekday: 'short' }).toUpperCase()}`; };
const greetEmoji = () => hr() < 6 ? '🌙' : hr() < 12 ? '☀️' : hr() < 18 ? '🌷' : '🌙';
const CUTE = [['dash.cute1', 'Drink some water today, okay? 💧'], ['dash.cute2', "You're doing amazing, sweetie ✨"], ['dash.cute3', 'Small steps still count 🐾'],
  ['dash.cute4', 'Your biases believe in you 💖'], ['dash.cute5', 'Take a little break with a milk tea 🧋'], ['dash.cute6', 'Today is a good day to be soft 🌸'], ['dash.cute7', 'One task at a time, you got this 🍀']];
function cuteLine() { const d = new Date(); const i = (d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate()) % CUTE.length; return t(CUTE[i][0], CUTE[i][1]); }

const W_LABEL = { fandom: 'fandom', schedule: 'today', todo: 'to-do', life: 'life', collection: 'spent', tracker: 'tracker' };
const W_EMOJI = { fandom: '💖', schedule: '📚', todo: '📝', life: '🌷', points: '⭐', daily: '🔥', collection: '🛍️', transactions: '🪙', tracker: '🐾' };

const W = {
  life: () => { const f = financeMonth(), c = caloriesDay(), m = milkteaStats(), budget = life().finance.budget, lim = life().milktea.weeklyLimit;
    const tile = (href, ic, label, value, sub, pct) => `<a class="fq-fandom" href="${href}"><b>${icon(ic)} ${esc(label)}</b><span>${value}</span><small>${esc(sub)}</small>${pct != null ? bar(Math.min(pct, 100), 100, 'sm') : ''}</a>`;
    return `<section class="fq-card"><div class="fq-card-h"><h2 class="fq-h2">${icon('sparkle')}${esc(t('w.life', 'Life'))}</h2><a class="fq-btn sm ghost" href="#/life/finance">${esc(t('common.viewAll', 'View all'))}${icon('chevR')}</a></div>
      <div class="fq-fandoms">
        ${tile('#/life/finance', 'wallet', t('life.finance', 'Finance'), money(f.expense), budget ? t('life.ofBudget', 'spent of {b} this month', { b: money(budget) }) : t('life.spentThisMonth', 'spent this month'), budget ? f.expense / budget * 100 : null)}
        ${tile('#/life/calories', 'apple', t('life.calories', 'Calories'), `${c.total.toLocaleString()} kcal`, t('life.ofGoal', 'of {g} today', { g: c.goal.toLocaleString() }), c.total / c.goal * 100)}
        ${tile('#/life/milktea', 'cup', t('life.milktea', 'Milk tea'), t('life.cupsN', '{n} cups', { n: m.week }), lim ? t('life.ofLimit', 'this week · limit {l}', { l: lim }) : t('life.thisWeek', 'this week'), lim ? m.week / lim * 100 : null)}
      </div></section>`; },
  fandom: () => { const L = lg(); if (!L) return loadingCard('heart', t('w.fandom', 'My fandoms'));
    const S = L.S, td = L.today();
    const total = L.FANDOMS.reduce((a, f) => a + L.totalOf(f.id), 0);
    const ship = L.shipWaiting();
    const next = S.concerts.filter(r => r.status !== 'missed' && r.date >= td).sort((a, b) => a.date.localeCompare(b.date))[0];
    return `<section class="fq-card"><div class="fq-card-h"><h2 class="fq-h2">${icon('heart')}${esc(t('w.fandom', 'My fandoms'))}</h2><a class="fq-btn sm ghost" href="#/tracker/home">${esc(t('common.viewAll', 'View all'))}${icon('chevR')}</a></div>
      <p class="fq-small fq-muted" style="font-weight:800">${esc(t('dash.totalSpent', 'Total spent'))}: <span class="fq-num" style="color:var(--ink)">${L.fmt(total)}</span></p>
      <div class="fq-fandoms" style="margin-top:8px">${L.FANDOMS.map(f => `<a class="fq-fandom" href="#/tracker/${f.id}"><b>${esc(f.name)}</b><span>${L.fmt(L.totalOf(f.id))}</span>${f.short && f.short !== f.name ? `<small>${esc(f.short)}</small>` : ''}</a>`).join('')}</div>
      ${ship.length ? `<p class="fq-small" style="font-weight:800;margin:14px 0 4px">📦 ${esc(t('dash.waitShip', 'Waiting to ship'))} · ${ship.length}</p><div class="fq-list">${ship.slice(0, 3).map(r => { const n = L.daysTo(r.shipBy);
        return `<a class="fq-li" href="#/tracker/lads" style="text-decoration:none">${daysBox(n, n <= 3)}<div class="grow"><b>${esc(r.name)}</b><small>${esc(L.shipLabel(r))} · ${esc(L.prettyDate(r.shipBy))}</small></div></a>`; }).join('')}</div>` : ''}
      ${next ? `<p class="fq-small" style="font-weight:800;margin:14px 0 4px">🎤 ${esc(t('dash.nextConcert', 'Next concert'))}</p><a class="fq-li" href="#/tracker/${next.group}" style="text-decoration:none">${daysBox(L.daysTo(next.date), L.daysTo(next.date) <= 7)}<div class="grow"><b>${esc(next.tour)}</b><small>${esc(L.FNAME[next.group] || '')} · ${esc(L.prettyDate(next.date))}</small></div></a>` : ''}
    </section>`; },
  schedule: () => { const L = lg(); if (!L) return loadingCard('calendar', t('w.schedule', 'Schedule'));
    const td = L.today(), now = new Date(), pad = n => String(n).padStart(2, '0');
    const nowS = `${td}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const todays = L.schedule().filter(e => e.s.startsWith(td));
    const next = L.nextClass();
    const dls = L.allDeadlines().slice(0, 3);
    const cls = e => `<div class="fq-class${e.e < nowS ? ' past' : ''}${e.s <= nowS && e.e > nowS ? ' live' : ''}" style="--mc:${L.MOD_COL[e.m] || 'var(--acc)'}"><span class="tm">${L.hm(e.s)}<br><small class="fq-muted">${L.hm(e.e)}</small></span><div style="min-width:0"><b>${esc(L.MOD_NAMES[e.m] || e.m)}</b><br><small class="fq-muted" style="font-weight:700">${esc(e.m)} · ${esc(e.k)} · ${esc(e.l)}</small></div></div>`;
    return `<section class="fq-card"><div class="fq-card-h"><h2 class="fq-h2">${icon('calendar')}${esc(t('w.schedule', 'Schedule'))}</h2><a class="fq-btn sm ghost" href="#/tracker/school">${esc(t('common.viewAll', 'View all'))}${icon('chevR')}</a></div>
      <div class="fq-stack" style="gap:8px">${todays.length ? todays.map(cls).join('') : `<p class="fq-muted" style="font-weight:700">${esc(t('dash.noClassesToday', 'No classes today.'))}</p>${next ? `<p class="fq-small" style="font-weight:800">${esc(t('dash.nextClass', 'Next class'))}: ${esc(L.MOD_NAMES[next.m] || next.m)} · ${esc(L.classWhen(next))}</p>` : ''}`}</div>
      ${dls.length ? `<p class="fq-small" style="font-weight:800;margin:14px 0 4px">⏰ ${esc(t('dash.deadlines', 'Quizzes & deadlines'))}</p><div class="fq-list">${dls.map(d => { const n = L.daysTo(d.date);
        return `<div class="fq-li">${daysBox(n, n <= 3)}<div class="grow"><b>${esc(d.label)}</b><small>${esc(L.prettyDate(d.date))}</small></div></div>`; }).join('')}</div>` : ''}
    </section>`; },
  todo: () => { const L = lg(); if (!L) return loadingCard('check', t('w.todo', 'To-do'));
    const td = L.S.school.todos || [];
    const open = td.filter(x => !x.done), done = td.filter(x => x.done);
    const row = x => `<div class="fq-todo${x.done ? ' done' : ''}"><button class="fq-check" data-fq-todo="${esc(x.id)}" aria-pressed="${!!x.done}" aria-label="${esc(x.done ? 'Mark not done' : 'Mark done')}">${x.done ? icon('check') : ''}</button><span class="txt">${esc(x.text)}</span><button class="fq-iconbtn" style="width:32px;height:32px;box-shadow:none" data-fq-tododel="${esc(x.id)}" aria-label="${esc(t('common.delete', 'Delete'))}">${icon('trash')}</button></div>`;
    return `<section class="fq-card"><div class="fq-card-h"><h2 class="fq-h2">${icon('check')}${esc(t('w.todo', 'To-do'))}</h2><span class="fq-pill">${open.length}</span></div>
      <form class="fq-row" data-fq-todo-form style="flex-wrap:nowrap;margin-bottom:8px"><input class="fq-input" name="todo" maxlength="120" placeholder="${esc(t('dash.todoPh', 'Add a task…'))}" aria-label="${esc(t('dash.todoPh', 'Add a task…'))}"><button class="fq-btn primary" type="submit" aria-label="${esc(t('dash.addTodo', 'Add'))}">${icon('plus')}</button></form>
      ${td.length ? `<div>${open.map(row).join('')}${done.slice(0, 3).map(row).join('')}</div>` : `<p class="fq-muted" style="font-weight:700">${esc(t('dash.todoEmpty', 'Nothing to do. Enjoy your day!'))}</p>`}
    </section>`; },
  collection: () => { const L = lg(); if (!L) return loadingCard('coin', t('w.collection', 'Fandom spending'));
    const month = L.today().slice(0, 7);
    const rows = L.FANDOMS.map(f => ({ f, all: L.totalOf(f.id), mon: L.totalOf(f.id, r => (r.date || '').startsWith(month)) }));
    const total = rows.reduce((a, r) => a + r.all, 0), mon = rows.reduce((a, r) => a + r.mon, 0);
    const COL = { lads: '#9fc0f5', exo: '#b9bccb', svt: '#f5aabb', and2ble: '#9df2a8' };
    return `<section class="fq-card"><div class="fq-card-h"><h2 class="fq-h2">${icon('coin')}${esc(t('w.collection', 'Fandom spending'))}</h2><a class="fq-btn sm ghost" href="#/tracker/home">${esc(t('common.viewAll', 'View all'))}${icon('chevR')}</a></div>
      <div class="fq-row" style="gap:10px;margin-bottom:12px"><div class="fq-stat" style="flex:1"><b>${L.fmt(total)}</b><span>${esc(t('dash.totalSpent', 'Total spent'))}</span></div>
        <div class="fq-stat" style="flex:1"><b>${L.fmt(mon)}</b><span>${esc(t('dash.thisMonth', 'This month'))}</span></div></div>
      <div class="fq-stack" style="gap:8px">${rows.map(r => `<a href="#/tracker/${r.f.id}" style="text-decoration:none;color:inherit"><div class="fq-row between fq-small" style="font-weight:800"><span>${esc(r.f.name)}</span><span class="fq-num">${L.fmt(r.all)}</span></div>
        <div class="fq-bar sm"><span style="width:${total ? Math.max(r.all ? 3 : 0, r.all / total * 100) : 0}%;background:${COL[r.f.id] || 'var(--acc)'}"></span></div></a>`).join('')}</div></section>`; },
  tracker: () => `<section class="fq-card tint"><div class="fq-card-h"><h2 class="fq-h2">${icon('heart')}${esc(t('dash.tracker', 'Fan tracker'))}</h2></div>
    <p class="fq-muted" style="font-weight:700;margin-bottom:10px">${esc(t('dash.trackerSub', 'Your fandom spending, collections, school planner and Mochi live here.'))}</p>
    <div class="fq-row">${[['home', 'bag', 'nav.collect', 'Collect'], ['school', 'cap', 'nav.school', 'School'], ['me', 'paw', 'nav.mochi', 'Mochi']].map(([v, ic, k, en]) => `<a class="fq-btn sm" href="#/tracker/${v}">${icon(ic)}${esc(t(k, en))}</a>`).join('')}</div></section>`,
};

export default {
  live: true,
  render(view, ctx, reason) {
    const s = store.state, p = s.profile;
    const saved = currentSettings().widgets || [];
    const ws = [...TRACKER_WIDGETS.filter(id => !saved.some(w => w.id === id)).map(id => ({ id, on: true })), ...saved];
    const order = ws.filter(w => w.on && W[w.id] && w.id !== 'avatar').map(w => w.id);
    if (order.some(id => TRACKER_WIDGETS.includes(id)) && !lg()) loadLegacy().catch(() => {});
    const showAvatar = (currentSettings().widgets || []).find(w => w.id === 'avatar')?.on !== false;
    view.innerHTML = `<div class="fq-page">
      ${showAvatar ? `<section class="fq-card fq-hero">
        <div class="fq-stack fq-hero-txt"><span class="fq-mono">${esc((p.display_name || p.username).toUpperCase())} · ${stamp()}</span>
          <h1>${esc(t(greetKey(), greetEn(), { name: p.display_name || p.username }))}</h1>
          <p class="fq-msg"><b>${esc(t('dash.todayMsg', "Today's note"))}</b><span>${esc(cuteLine())}</span></p>
          ${loveLines()}
        </div><div class="fq-hero-pic" aria-hidden="true"><img src="assets/avatar.png" alt=""></div></section>` : ''}
      <div class="fq-grid" style="--min:300px">${order.map((id, k) => W[id](s).replace('<section class="fq-card', `<section data-w="${id}" data-no="${String(k + 1).padStart(2, '0')}" class="fq-card`).replace('<h2 class="fq-h2">', `<h2 class="fq-h2"><i class="fq-tno" aria-hidden="true">${W_LABEL[id] || 'FAN'}</i>`)).join('')}</div>
      <p class="fq-small fq-muted" style="text-align:center;font-weight:700"><a href="#/profile/dashboard">${icon('layout')} ${esc(t('dash.arrange', 'Arrange dashboard'))}</a></p>
    </div>`;
    view.querySelectorAll('[data-claim-mission]').forEach(b => b.onclick = () => claimMission(b.dataset.claimMission, b));
    const L = lg();
    if (L) {
      const saveTodos = list => { L.S.school.todos = list; L.saveSchool(); L.render(); };
      view.querySelector('[data-fq-todo-form]')?.addEventListener('submit', e => { e.preventDefault(); const v = e.target.todo.value.trim(); if (!v) return;
        saveTodos([{ id: L.uid(), text: v, done: false }, ...(L.S.school.todos || [])]); setTimeout(() => view.querySelector('[data-fq-todo-form] input')?.focus(), 0); });
      view.querySelectorAll('[data-fq-todo]').forEach(b => b.onclick = () => saveTodos((L.S.school.todos || []).map(x => x.id === b.dataset.fqTodo ? { ...x, done: !x.done } : x)));
      view.querySelectorAll('[data-fq-tododel]').forEach(b => b.onclick = () => saveTodos((L.S.school.todos || []).filter(x => x.id !== b.dataset.fqTododel)));
    }
    if (order.includes('leaderboard') && !store.leaderboard && reason !== 'store') {
      rpc('fq_leaderboard').then(lb => { store.leaderboard = lb; if (view.isConnected && location.hash.match(/^#\/(dashboard)?$|^$/)) this.render(view, ctx, 'lb'); }).catch(() => { store.leaderboard = { top: [], opted_in: false }; });
    }
  },
};
