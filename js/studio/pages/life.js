// Life trackers: Finance, Calories and Milk tea.
import { life, saveLife, newId, todayStr, addDays, monthOf, addMonths, money, financeMonth, caloriesDay, milkteaStats } from '../life-store.js';
import { t } from '../i18n.js';
import { esc, toast, sound, confirmDialog, fmtDate } from '../ui.js';
import { icon } from '../icons.js';
import { bar, ring, empty } from '../components.js';

const TABS = [['finance', 'wallet', 'life.finance', 'Finance'], ['calories', 'apple', 'life.calories', 'Calories'], ['milktea', 'cup', 'life.milktea', 'Milk tea']];
const EXP = [['food', '🍜', 'Food'], ['drinks', '🧋', 'Drinks & milk tea'], ['transport', '🚇', 'Transport'], ['shopping', '🛍️', 'Shopping'], ['fandom', '💜', 'Fandom'], ['bills', '🧾', 'Bills'], ['study', '📚', 'Study'], ['fun', '🎮', 'Fun'], ['other', '✨', 'Other']];
const INC = [['allowance', '💰', 'Allowance'], ['salary', '💼', 'Salary / part-time'], ['gift', '🎁', 'Gift / red packet'], ['other_in', '✨', 'Other income']];
const CAT = Object.fromEntries([...EXP, ...INC].map(([k, e, n]) => [k, { e, n }]));
const catName = k => t('life.cat.' + k, CAT[k]?.n || k);
const MEALS = [['breakfast', 'Breakfast'], ['lunch', 'Lunch'], ['dinner', 'Dinner'], ['snack', 'Snacks & drinks']];
const SHOPS = ['KOI Thé', 'LiHO', 'Chicha San Chen', 'Playmade', 'Gong Cha', 'Mixue', 'HEYTEA', 'ChaPanda', 'Each A Cup', 'Tiger Sugar', 'R&B Tea', 'Chagee'];
const SUGAR = [0, 25, 50, 75, 100];
const ICE = [['none', 'No ice'], ['less', 'Less ice'], ['normal', 'Normal ice'], ['hot', 'Hot']];

let tab = 'finance', fMonth = monthOf(todayStr()), fType = 'expense', cDay = todayStr(), view = null;
const num = v => Math.round((parseFloat(v) || 0) * 100) / 100;
const save = fn => { try { saveLife(fn); return true; } catch { toast(t('err.storage_full', "This browser's storage is full or blocked, so the change was not saved."), 'err'); return false; } };
const monthLabel = m => new Date(m + '-01T00:00:00').toLocaleDateString(document.documentElement.lang || 'en', { month: 'long', year: 'numeric' });
const dayLabel = d => d === todayStr() ? t('common.today', 'Today') : d === addDays(todayStr(), -1) ? t('life.yesterday', 'Yesterday') : fmtDate(d + 'T00:00:00', { weekday: 'short', day: 'numeric', month: 'short' });
const stat = (v, l) => `<div class="fq-stat"><b>${v}</b><span>${esc(l)}</span></div>`;
const navRow = (label, prev, next, canNext = true) => `<div class="fq-row" style="flex-wrap:nowrap;gap:6px"><button class="fq-iconbtn" ${prev} aria-label="${esc(t('life.prev', 'Previous'))}">${icon('chevL')}</button><b class="fq-h3" style="min-width:150px;text-align:center">${esc(label)}</b><button class="fq-iconbtn" ${next} aria-label="${esc(t('life.next', 'Next'))}" ${canNext ? '' : 'disabled'}>${icon('chevR')}</button></div>`;

// ---------------- Finance ----------------
function finance() {
  const F = life().finance, s = financeMonth(fMonth), budget = F.budget || 0;
  const L = window.FQLegacy;
  const fandomMonth = L ? L.FANDOMS.reduce((a, f) => a + L.totalOf(f.id, r => (r.date || '').startsWith(fMonth)), 0) : 0;
  const cats = Object.entries(s.byCat).sort((a, b) => b[1] - a[1]);
  const days = [...new Set(s.xs.map(e => e.date))].sort().reverse();
  const opts = (fType === 'expense' ? EXP : INC).map(([k, e]) => `<option value="${k}">${e} ${esc(catName(k))}</option>`).join('');
  return `<div class="fq-row between">${navRow(monthLabel(fMonth), 'data-fm="-1"', 'data-fm="1"', fMonth < monthOf(todayStr()))}
      <label class="fq-row fq-small" style="gap:6px;font-weight:800">${esc(t('life.budget', 'Monthly budget'))} <input class="fq-input" style="width:110px;min-height:38px" type="number" min="0" step="1" inputmode="decimal" value="${budget || ''}" placeholder="S$" data-budget></label></div>
    <div class="fq-grid" style="--min:150px">${stat(money(s.expense), t('life.spent', 'Spent'))}${stat(money(s.income), t('life.income', 'Income'))}${`<div class="fq-stat"><b style="color:${s.net >= 0 ? 'var(--ok)' : 'var(--bad)'}">${s.net < 0 ? '−' : ''}${money(Math.abs(s.net))}</b><span>${esc(t('life.net', 'Left over'))}</span></div>`}
      ${budget ? stat(money(Math.max(0, budget - s.expense)), t('life.budgetLeft', 'Budget left')) : ''}</div>
    ${budget ? `<div>${bar(Math.min(s.expense, budget), budget)}<p class="fq-small fq-muted" style="font-weight:800;margin-top:4px">${esc(t('life.budgetUsed', '{p}% of your {b} budget used', { p: Math.round(s.expense / budget * 100), b: money(budget) }))}</p></div>` : ''}
    <div class="fq-cols wide-l">
      <section class="fq-card fq-stack"><h2 class="fq-h2">${icon('plus')}${esc(t('life.addEntry', 'Add an entry'))}</h2>
        <div class="fq-seg" role="radiogroup"><button role="radio" aria-selected="${fType === 'expense'}" aria-checked="${fType === 'expense'}" data-ftype="expense">${esc(t('life.expense', 'Expense'))}</button><button role="radio" aria-selected="${fType === 'income'}" aria-checked="${fType === 'income'}" data-ftype="income">${esc(t('life.incomeOne', 'Income'))}</button></div>
        <form class="fq-stack" data-fin-form style="gap:10px">
          <div class="fq-row" style="flex-wrap:nowrap"><label class="fq-field" style="flex:1">${esc(t('life.amount', 'Amount (S$)'))}<input class="fq-input" name="amount" type="number" min="0.01" step="0.01" inputmode="decimal" required></label>
            <label class="fq-field" style="flex:1">${esc(t('life.date', 'Date'))}<input class="fq-input" name="date" type="date" value="${todayStr()}" max="${todayStr()}" required></label></div>
          <label class="fq-field">${esc(t('life.category', 'Category'))}<select class="fq-input" name="cat">${opts}</select></label>
          <label class="fq-field">${esc(t('life.note', 'Note'))}<input class="fq-input" name="note" maxlength="80" placeholder="${esc(t('life.notePh', 'e.g. lunch with friends'))}"></label>
          <button class="fq-btn primary" type="submit">${icon('plus')}${esc(t('life.add', 'Add'))}</button></form></section>
      <section class="fq-card fq-stack"><h2 class="fq-h2">${icon('layout')}${esc(t('life.whereWent', 'Where it went'))}</h2>
        ${cats.length ? cats.map(([k, v]) => `<div><div class="fq-row between fq-small" style="font-weight:800"><span>${CAT[k]?.e || ''} ${esc(catName(k))}</span><span class="fq-num">${money(v)}</span></div>${bar(v, s.expense, 'sm')}</div>`).join('') : `<p class="fq-muted" style="font-weight:700">${esc(t('life.noSpend', 'No spending logged this month.'))}</p>`}
        ${fandomMonth ? `<p class="fq-note">${icon('heart')}<span>${esc(t('life.fandomNote', 'Your fan tracker also has {v} of fandom spending this month (kept separately).', { v: money(fandomMonth) }))}</span></p>` : ''}</section>
    </div>
    <section class="fq-card"><h2 class="fq-h2" style="margin-bottom:8px">${icon('scroll')}${esc(t('life.entries', 'Entries'))}</h2>
      ${days.length ? days.map(d => `<p class="fq-small fq-muted" style="font-weight:800;margin-top:8px">${esc(dayLabel(d))}</p><div class="fq-list">${s.xs.filter(e => e.date === d).map(e => `<div class="fq-li"><span style="font-size:20px">${CAT[e.cat]?.e || '•'}</span><div class="grow"><b>${esc(e.note || catName(e.cat))}</b><small>${esc(catName(e.cat))}${e.link ? ' · ' + esc(t('life.fromMilktea', 'from milk tea log')) : ''}</small></div><span class="fq-amt ${e.type === 'income' ? 'pos' : 'neg'}">${e.type === 'income' ? '+' : '−'}${money(e.amount)}</span><button class="fq-iconbtn" style="width:32px;height:32px;box-shadow:none" data-fin-del="${e.id}" aria-label="${esc(t('common.delete', 'Delete'))}">${icon('trash')}</button></div>`).join('')}</div>`).join('')
        : empty(t('life.noEntries', 'No entries this month yet.'), 'wallet')}</section>`;
}

// ---------------- Calories ----------------
function calories() {
  const C = life().calories, d = caloriesDay(cDay), goal = C.goal || 2000;
  const left = goal - d.total, pct = Math.min(100, Math.round(d.total / goal * 100));
  const recent = [...new Map(C.entries.slice().reverse().map(e => [e.name.toLowerCase(), e])).values()].slice(0, 8);
  const week = Array.from({ length: 7 }, (_, i) => addDays(cDay, i - 6)).map(x => ({ d: x, v: caloriesDay(x).total }));
  const maxV = Math.max(goal, ...week.map(w => w.v)) || 1;
  return `<div class="fq-row between">${navRow(dayLabel(cDay), 'data-cd="-1"', 'data-cd="1"', cDay < todayStr())}
      <label class="fq-row fq-small" style="gap:6px;font-weight:800">${esc(t('life.goal', 'Daily goal'))} <input class="fq-input" style="width:100px;min-height:38px" type="number" min="500" max="6000" step="50" value="${goal}" data-goal> kcal</label></div>
    <div class="fq-cols">
      <section class="fq-card"><div class="fq-row" style="gap:18px;flex-wrap:nowrap">${ring(pct, d.total.toLocaleString())}
        <div class="fq-stack" style="gap:4px"><b class="fq-h3">${d.total.toLocaleString()} / ${goal.toLocaleString()} kcal</b>
          <span class="fq-muted" style="font-weight:800">${esc(left >= 0 ? t('life.kcalLeft', '{n} kcal left today', { n: left.toLocaleString() }) : t('life.kcalOver', '{n} kcal above your goal', { n: (-left).toLocaleString() }))}</span></div></div>
        <div class="fq-week-bars" aria-label="${esc(t('life.last7', 'Last 7 days'))}">${week.map(w => `<div title="${w.d}: ${w.v} kcal"><span style="height:${Math.round(w.v / maxV * 100)}%" class="${w.d === cDay ? 'on' : ''}"></span><small>${new Date(w.d + 'T00:00:00').toLocaleDateString(document.documentElement.lang || 'en', { weekday: 'narrow' })}</small></div>`).join('')}<i style="bottom:${Math.round(goal / maxV * 100)}%"></i></div></section>
      <section class="fq-card fq-stack"><h2 class="fq-h2">${icon('plus')}${esc(t('life.addFood', 'Add food'))}</h2>
        <form class="fq-stack" data-cal-form style="gap:10px">
          <div class="fq-row" style="flex-wrap:nowrap"><label class="fq-field" style="flex:2">${esc(t('life.food', 'Food'))}<input class="fq-input" name="name" maxlength="60" required placeholder="${esc(t('life.foodPh', 'e.g. chicken rice'))}"></label>
            <label class="fq-field" style="flex:1">kcal<input class="fq-input" name="kcal" type="number" min="1" max="5000" step="1" inputmode="numeric" required></label></div>
          <label class="fq-field">${esc(t('life.meal', 'Meal'))}<select class="fq-input" name="meal">${MEALS.map(([k, n]) => `<option value="${k}" ${k === defaultMeal() ? 'selected' : ''}>${esc(t('life.meal.' + k, n))}</option>`).join('')}</select></label>
          <button class="fq-btn primary" type="submit">${icon('plus')}${esc(t('life.add', 'Add'))}</button></form>
        ${recent.length ? `<div><p class="fq-small fq-muted" style="font-weight:800;margin-bottom:6px">${esc(t('life.quickAdd', 'Quick add'))}</p><div class="fq-chips">${recent.map(e => `<button class="fq-chip" data-quick="${e.id}">${esc(e.name)} <span class="n">${e.kcal}</span></button>`).join('')}</div></div>` : ''}</section>
    </div>
    <section class="fq-card"><h2 class="fq-h2" style="margin-bottom:8px">${icon('apple')}${esc(dayLabel(cDay))}</h2>
      ${d.xs.length ? MEALS.map(([k, n]) => { const xs = d.xs.filter(e => e.meal === k); if (!xs.length) return '';
        return `<p class="fq-small fq-muted" style="font-weight:800;margin-top:8px">${esc(t('life.meal.' + k, n))} · ${xs.reduce((a, e) => a + e.kcal, 0)} kcal</p><div class="fq-list">${xs.map(e => `<div class="fq-li"><div class="grow"><b>${esc(e.name)}</b>${e.link ? `<small>${esc(t('life.fromMilktea', 'from milk tea log'))}</small>` : ''}</div><span class="fq-num" style="font-weight:800">${e.kcal} kcal</span><button class="fq-iconbtn" style="width:32px;height:32px;box-shadow:none" data-cal-del="${e.id}" aria-label="${esc(t('common.delete', 'Delete'))}">${icon('trash')}</button></div>`).join('')}</div>`; }).join('')
        : empty(t('life.noFood', 'Nothing logged for this day.'), 'apple')}</section>`;
}
function defaultMeal() { const h = new Date().getHours(); return h < 10 ? 'breakfast' : h < 15 ? 'lunch' : h < 21 ? 'dinner' : 'snack'; }

// ---------------- Milk tea ----------------
function cupSvg(fill) {
  const h = Math.round(84 * Math.min(1, fill)), y = 104 - h;
  return `<svg viewBox="0 0 80 120" class="fq-cup" aria-hidden="true"><path d="M44 2 L52 24" stroke="#ff8fb1" stroke-width="6" stroke-linecap="round"/><path d="M10 22 h60 l-7 92 a6 6 0 0 1 -6 5 h-34 a6 6 0 0 1 -6 -5z" fill="#fff" stroke="#5a3a5c" stroke-width="3"/>
    <clipPath id="fq-cupclip"><path d="M10 22 h60 l-7 92 a6 6 0 0 1 -6 5 h-34 a6 6 0 0 1 -6 -5z"/></clipPath>
    <g clip-path="url(#fq-cupclip)"><rect x="0" y="${y + 16}" width="80" height="${h}" fill="#e8c9a8"/>${[18, 30, 42, 54, 26, 38, 50].map((x, i) => `<circle cx="${x + 4}" cy="${110 - (i % 3) * 7}" r="4.5" fill="#5a3a5c" opacity="${fill > 0 ? 1 : 0}"/>`).join('')}</g>
    <rect x="6" y="16" width="68" height="9" rx="4" fill="#ffb3cf" stroke="#5a3a5c" stroke-width="3"/></svg>`;
}
function milktea() {
  const M = life().milktea, st = milkteaStats(), limit = M.weeklyLimit || 0;
  const xs = M.entries.slice().sort((a, b) => (b.date + b.at).localeCompare(a.date + a.at));
  const last = xs[0];
  const shops = [...new Set([...M.entries.map(e => e.shop).filter(Boolean), ...SHOPS])];
  return `<div class="fq-cols">
      <section class="fq-card"><div class="fq-row" style="gap:16px;flex-wrap:nowrap;align-items:center">
        <div style="width:84px;flex:none">${cupSvg(limit ? st.week / limit : Math.min(1, st.week / 7))}</div>
        <div class="fq-stack" style="gap:6px;flex:1;min-width:0"><b class="fq-h3">${esc(t('life.cupsWeek', '{n} cups this week', { n: st.week }))}</b>
          ${limit ? `${bar(Math.min(st.week, limit), limit, 'sm')}<span class="fq-small fq-muted" style="font-weight:800">${esc(st.week <= limit ? t('life.limitLeft', '{n} left in your weekly limit of {l}', { n: limit - st.week, l: limit }) : t('life.limitOver', '{n} over your weekly limit of {l}', { n: st.week - limit, l: limit }))}</span>` : ''}
          <label class="fq-row fq-small" style="gap:6px;font-weight:800">${esc(t('life.weeklyLimit', 'Weekly limit'))} <input class="fq-input" style="width:80px;min-height:36px" type="number" min="0" max="50" step="1" value="${limit || ''}" placeholder="—" data-limit></label></div></div>
        <div class="fq-grid" style="--min:120px;margin-top:12px">${stat(st.month, t('life.cupsMonth', 'Cups this month'))}${stat(money(st.spentMonth), t('life.spentMonth', 'Spent this month'))}
          ${stat(esc(st.fav || '—'), t('life.favShop', 'Favourite shop'))}${stat(st.sugar == null ? '—' : st.sugar + '%', t('life.avgSugar', 'Average sugar'))}</div></section>
      <section class="fq-card fq-stack"><div class="fq-row between"><h2 class="fq-h2">${icon('plus')}${esc(t('life.logCup', 'Log a cup'))}</h2>
        ${last ? `<button class="fq-btn sm" data-again>${icon('restart')}${esc(t('life.sameAgain', 'Same again'))}</button>` : ''}</div>
        <form class="fq-stack" data-tea-form style="gap:10px">
          <div class="fq-row" style="flex-wrap:nowrap"><label class="fq-field" style="flex:1">${esc(t('life.shop', 'Shop'))}<input class="fq-input" name="shop" list="fq-shops" maxlength="40" required></label>
            <label class="fq-field" style="flex:1.3">${esc(t('life.drink', 'Drink'))}<input class="fq-input" name="drink" maxlength="60" required placeholder="${esc(t('life.drinkPh', 'e.g. brown sugar pearl milk'))}"></label></div>
          <datalist id="fq-shops">${shops.map(s => `<option value="${esc(s)}">`).join('')}</datalist>
          <div class="fq-row" style="flex-wrap:nowrap"><label class="fq-field" style="flex:1">${esc(t('life.sugar', 'Sugar'))}<select class="fq-input" name="sugar">${SUGAR.map(s => `<option value="${s}" ${s === 50 ? 'selected' : ''}>${s}%</option>`).join('')}</select></label>
            <label class="fq-field" style="flex:1">${esc(t('life.ice', 'Ice'))}<select class="fq-input" name="ice">${ICE.map(([k, n]) => `<option value="${k}" ${k === 'less' ? 'selected' : ''}>${esc(t('life.ice.' + k, n))}</option>`).join('')}</select></label></div>
          <label class="fq-field">${esc(t('life.toppings', 'Toppings'))}<input class="fq-input" name="toppings" maxlength="60" placeholder="${esc(t('life.toppingsPh', 'e.g. pearls, grass jelly'))}"></label>
          <div class="fq-row" style="flex-wrap:nowrap"><label class="fq-field" style="flex:1">${esc(t('life.price', 'Price (S$)'))}<input class="fq-input" name="price" type="number" min="0" step="0.01" inputmode="decimal"></label>
            <label class="fq-field" style="flex:1">kcal <small>(${esc(t('life.optional', 'optional'))})</small><input class="fq-input" name="kcal" type="number" min="0" max="2000" step="1" inputmode="numeric"></label>
            <label class="fq-field" style="flex:1">${esc(t('life.date', 'Date'))}<input class="fq-input" name="date" type="date" value="${todayStr()}" max="${todayStr()}"></label></div>
          <label class="fq-field">${esc(t('life.rating', 'Rating'))}<select class="fq-input" name="rating">${[5, 4, 3, 2, 1].map(r => `<option value="${r}">${'★'.repeat(r)}${'☆'.repeat(5 - r)}</option>`).join('')}</select></label>
          <label class="fq-switch" style="padding:2px 0"><span>${esc(t('life.toFinance', 'Also add the price to Finance'))}</span><input type="checkbox" name="toFin" checked></label>
          <label class="fq-switch" style="padding:2px 0"><span>${esc(t('life.toCalories', 'Also add kcal to Calories'))}</span><input type="checkbox" name="toCal" checked></label>
          <button class="fq-btn primary" type="submit">${icon('cup')}${esc(t('life.logIt', 'Log it'))}</button></form></section>
    </div>
    <section class="fq-card"><h2 class="fq-h2" style="margin-bottom:8px">${icon('cup')}${esc(t('life.history', 'History'))}</h2>
      ${xs.length ? `<div class="fq-list">${xs.slice(0, 60).map(e => `<div class="fq-li"><span style="font-size:22px">🧋</span><div class="grow"><b>${esc(e.drink)}</b><small>${esc(e.shop)} · ${e.sugar}% ${esc(t('life.sugarShort', 'sugar'))} · ${esc(t('life.ice.' + e.ice, (ICE.find(i => i[0] === e.ice) || [, ''])[1]))}${e.toppings ? ' · ' + esc(e.toppings) : ''} · ${esc(dayLabel(e.date))}</small><small style="color:#e2a400">${'★'.repeat(e.rating || 0)}</small></div>${e.price ? `<span class="fq-num" style="font-weight:800">${money(e.price)}</span>` : ''}<button class="fq-iconbtn" style="width:32px;height:32px;box-shadow:none" data-tea-del="${e.id}" aria-label="${esc(t('common.delete', 'Delete'))}">${icon('trash')}</button></div>`).join('')}</div>`
        : empty(t('life.noTea', 'No cups logged yet. Your first one is on its way!'), 'cup')}</section>`;
}

function render() {
  view.innerHTML = `<div class="fq-page">
    <div class="fq-head"><div><h1>${esc(t('life.title', 'Life trackers'))}</h1><p>${esc(t('life.sub', 'Money, food and milk tea, all in one place. Saved in this browser.'))}</p></div></div>
    <div class="fq-seg" role="tablist">${TABS.map(([k, ic, key, en]) => `<button role="tab" aria-selected="${tab === k}" data-tab="${k}">${icon(ic)}${esc(t(key, en))}</button>`).join('')}</div>
    ${tab === 'finance' ? finance() : tab === 'calories' ? calories() : milktea()}</div>`;
  bind();
}

function bind() {
  view.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; location.hash = '#/life/' + tab; });
  // finance
  view.querySelectorAll('[data-fm]').forEach(b => b.onclick = () => { fMonth = addMonths(fMonth, +b.dataset.fm); render(); });
  view.querySelectorAll('[data-ftype]').forEach(b => b.onclick = () => { fType = b.dataset.ftype; render(); });
  view.querySelector('[data-budget]')?.addEventListener('change', e => save(d => { d.finance.budget = Math.max(0, num(e.target.value)); }));
  view.querySelector('[data-fin-form]')?.addEventListener('submit', e => { e.preventDefault(); const f = e.target;
    const amount = num(f.amount.value); if (!(amount > 0)) return;
    if (save(d => d.finance.entries.push({ id: newId(), type: fType, amount, cat: f.cat.value, date: f.date.value || todayStr(), note: f.note.value.trim(), at: new Date().toISOString() }))) { sound('coin'); fMonth = monthOf(f.date.value || todayStr()); } });
  view.querySelectorAll('[data-fin-del]').forEach(b => b.onclick = async () => {
    if (await confirmDialog({ title: t('common.delete', 'Delete'), body: esc(t('life.delConfirm', 'Delete this entry?')), kind: 'danger', confirm: t('common.delete', 'Delete') }))
      save(d => { d.finance.entries = d.finance.entries.filter(x => x.id !== b.dataset.finDel); }); });
  // calories
  view.querySelectorAll('[data-cd]').forEach(b => b.onclick = () => { cDay = addDays(cDay, +b.dataset.cd); render(); });
  view.querySelector('[data-goal]')?.addEventListener('change', e => { const g = Math.round(+e.target.value); if (g >= 500 && g <= 6000) save(d => { d.calories.goal = g; }); });
  view.querySelector('[data-cal-form]')?.addEventListener('submit', e => { e.preventDefault(); const f = e.target; const kcal = Math.round(+f.kcal.value);
    if (!f.name.value.trim() || !(kcal > 0)) return;
    if (save(d => d.calories.entries.push({ id: newId(), name: f.name.value.trim(), kcal, meal: f.meal.value, date: cDay, at: new Date().toISOString() }))) sound('click'); });
  view.querySelectorAll('[data-quick]').forEach(b => b.onclick = () => { const src = life().calories.entries.find(x => x.id === b.dataset.quick); if (!src) return;
    save(d => d.calories.entries.push({ id: newId(), name: src.name, kcal: src.kcal, meal: defaultMeal(), date: cDay, at: new Date().toISOString() })); sound('click'); });
  view.querySelectorAll('[data-cal-del]').forEach(b => b.onclick = () => save(d => { d.calories.entries = d.calories.entries.filter(x => x.id !== b.dataset.calDel); }));
  // milk tea
  view.querySelector('[data-limit]')?.addEventListener('change', e => save(d => { d.milktea.weeklyLimit = Math.max(0, Math.round(+e.target.value || 0)); }));
  const logCup = c => save(d => {
    const id = newId(), at = new Date().toISOString();
    const cup = { id, shop: c.shop, drink: c.drink, sugar: +c.sugar, ice: c.ice, toppings: c.toppings || '', price: num(c.price), kcal: Math.round(+c.kcal || 0), rating: +c.rating || 0, date: c.date || todayStr(), at };
    d.milktea.entries.push(cup);
    if (c.toFin && cup.price > 0) d.finance.entries.push({ id: newId(), type: 'expense', amount: cup.price, cat: 'drinks', date: cup.date, note: `${cup.drink} · ${cup.shop}`, link: id, at });
    if (c.toCal && cup.kcal > 0) d.calories.entries.push({ id: newId(), name: `🧋 ${cup.drink}`, kcal: cup.kcal, meal: 'snack', date: cup.date, link: id, at });
  });
  view.querySelector('[data-tea-form]')?.addEventListener('submit', e => { e.preventDefault(); const f = e.target;
    if (logCup({ shop: f.shop.value.trim(), drink: f.drink.value.trim(), sugar: f.sugar.value, ice: f.ice.value, toppings: f.toppings.value.trim(), price: f.price.value, kcal: f.kcal.value, date: f.date.value, rating: f.rating.value, toFin: f.toFin.checked, toCal: f.toCal.checked })) {
      sound('ok'); toast(t('life.cupLogged', 'Cup logged! 🧋'), 'ok'); } });
  view.querySelector('[data-again]')?.addEventListener('click', () => { const l = life().milktea.entries.slice().sort((a, b) => (b.date + b.at).localeCompare(a.date + a.at))[0]; if (!l) return;
    const linkedFin = life().finance.entries.some(x => x.link === l.id), linkedCal = life().calories.entries.some(x => x.link === l.id);
    if (logCup({ ...l, date: todayStr(), toFin: linkedFin, toCal: linkedCal })) { sound('ok'); toast(t('life.cupLogged', 'Cup logged! 🧋'), 'ok'); } });
  view.querySelectorAll('[data-tea-del]').forEach(b => b.onclick = async () => {
    if (!(await confirmDialog({ title: t('common.delete', 'Delete'), body: esc(t('life.delCup', 'Delete this cup? Linked Finance and Calories entries are removed too.')), kind: 'danger', confirm: t('common.delete', 'Delete') }))) return;
    const id = b.dataset.teaDel;
    save(d => { d.milktea.entries = d.milktea.entries.filter(x => x.id !== id); d.finance.entries = d.finance.entries.filter(x => x.link !== id); d.calories.entries = d.calories.entries.filter(x => x.link !== id); }); });
}

export default {
  live: false,
  render(v, ctx) {
    view = v;
    if (TABS.some(x => x[0] === ctx.params[0])) tab = ctx.params[0];
    render();
  },
  refresh() { if (view?.isConnected) render(); },
};
