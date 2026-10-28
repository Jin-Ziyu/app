// Life trackers (finance, calories, milk tea): saved per account in this browser's localStorage.
// Changes fire a 'fq-life-change' event so open pages and the Home card refresh.
const blank = () => ({
  finance: { entries: [], budget: 0 },
  calories: { entries: [], goal: 2000 },
  milktea: { entries: [], weeklyLimit: 0 },
  timeline: { milestones: [] },
});
let uid = null, data = blank();

const key = () => 'fq:life:' + (uid || 'anon');
export function openLife(userId) {
  uid = userId; data = blank();
  try {
    const d = JSON.parse(localStorage.getItem(key()) || 'null');
    if (d) for (const k of Object.keys(data)) data[k] = { ...data[k], ...(d[k] || {}) };
  } catch { /* unreadable: start fresh */ }
  return data;
}
export const life = () => data;
export function saveLife(mutator) {
  mutator?.(data);
  try { localStorage.setItem(key(), JSON.stringify(data)); }
  catch { throw new Error('storage_full'); }
  window.dispatchEvent(new Event('fq-life-change'));
}
export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// ---------- dates (local calendar days) ----------
const pad = n => String(n).padStart(2, '0');
export const dayStr = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayStr = () => dayStr(new Date());
export const addDays = (s, n) => { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return dayStr(d); };
export const monthOf = s => s.slice(0, 7);
export const addMonths = (m, n) => { const d = new Date(m + '-01T00:00:00'); d.setMonth(d.getMonth() + n); return dayStr(d).slice(0, 7); };
export function weekStart(s = todayStr()) { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return dayStr(d); }
export const money = n => 'S$' + (Math.round((+n || 0) * 100) / 100).toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ---------- summaries used by the pages and the Home card ----------
export function financeMonth(m = monthOf(todayStr())) {
  const xs = data.finance.entries.filter(e => monthOf(e.date) === m);
  const income = xs.filter(e => e.type === 'income').reduce((a, e) => a + e.amount, 0);
  const expense = xs.filter(e => e.type === 'expense').reduce((a, e) => a + e.amount, 0);
  const byCat = {};
  for (const e of xs) if (e.type === 'expense') byCat[e.cat] = (byCat[e.cat] || 0) + e.amount;
  return { xs, income, expense, net: income - expense, byCat };
}
export function caloriesDay(d = todayStr()) {
  const xs = data.calories.entries.filter(e => e.date === d);
  return { xs, total: xs.reduce((a, e) => a + e.kcal, 0), goal: data.calories.goal };
}
export function milkteaStats(d = todayStr()) {
  const xs = data.milktea.entries;
  const wk = weekStart(d), m = monthOf(d);
  const week = xs.filter(e => e.date >= wk && e.date <= addDays(wk, 6));
  const month = xs.filter(e => monthOf(e.date) === m);
  const shops = {};
  for (const e of xs) if (e.shop) shops[e.shop] = (shops[e.shop] || 0) + 1;
  const fav = Object.entries(shops).sort((a, b) => b[1] - a[1])[0];
  const sugar = month.length ? Math.round(month.reduce((a, e) => a + (+e.sugar || 0), 0) / month.length) : null;
  return { week: week.length, month: month.length, spentMonth: month.reduce((a, e) => a + (+e.price || 0), 0), fav: fav ? fav[0] : null, sugar, total: xs.length };
}
