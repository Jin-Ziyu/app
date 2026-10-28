// Timeline: everything with a date, in one feed — fandom, life, studio rewards and your own milestones.
import { store } from '../store.js';
import { life, saveLife, newId, todayStr, money } from '../life-store.js';
import { loadLegacy } from '../legacy-loader.js';
import { t, L as loc } from '../i18n.js';
import { esc, fmtDate, toast, sound, confirmDialog } from '../ui.js';
import { icon } from '../icons.js';
import { empty } from '../components.js';

const KIND = {
  spend: ['💎', 'fandom'], merch: ['🛍️', 'fandom'], ship: ['📦', 'fandom'], concert: ['🎤', 'fandom'], album: ['💿', 'fandom'], kmerch: ['🛍️', 'fandom'],
  bubble: ['💬', 'fandom'], bias: ['💖', 'fandom'], card: ['🃏', 'fandom'], collect: ['📸', 'fandom'],
  milktea: ['🧋', 'life'], income: ['💰', 'life'], expense: ['💸', 'life'], item: ['🎁', 'studio'], milestone: ['⭐', 'milestone'],
};
const EMOJI = ['⭐', '💖', '🎤', '🎂', '✈️', '🎓', '🏆', '📸', '💌', '🌸', '🎁', '🧋'];
const PAGE = 120;
let filter = 'all', query = '', shown = PAGE, view = null;

function collect() {
  const ev = [];
  const Lg = window.FQLegacy;
  if (Lg) for (const e of Lg.timelineEvents()) ev.push({ ...e, group: 'fandom', fname: e.fandom ? (Lg.FNAME[e.fandom] || e.fandom) : '' });
  const d = life();
  for (const c of d.milktea.entries) ev.push({ date: c.date, kind: 'milktea', group: 'life', title: c.drink, sub: [c.shop, `${c.sugar}%`, c.toppings, '★'.repeat(c.rating || 0)].filter(Boolean).join(' · '), amount: c.price ? money(c.price) : null, href: '#/life/milktea' });
  for (const f of d.finance.entries) if (!f.link) ev.push({ date: f.date, kind: f.type, group: 'life', title: f.note || t('life.cat.' + f.cat, f.cat), sub: t('life.cat.' + f.cat, f.cat), amount: (f.type === 'income' ? '+' : '−') + money(f.amount), href: '#/life/finance' });
  for (const m of d.timeline.milestones) ev.push({ ...m, kind: 'milestone', group: 'milestone', fname: m.fandom && Lg ? Lg.FNAME[m.fandom] : '' });
  return ev;
}

function render() {
  const Lg = window.FQLegacy;
  if (!Lg) loadLegacy().catch(() => {});
  const today = todayStr();
  const all = collect();
  const fandoms = Lg ? Lg.FANDOMS : [];
  const match = e => (filter === 'all' || e.group === filter || e.fandom === filter) &&
    (!query || `${e.title} ${e.sub} ${e.fname || ''}`.toLowerCase().includes(query));
  const list = all.filter(match);
  const upcoming = list.filter(e => e.date > today).sort((a, b) => a.date.localeCompare(b.date));
  const past = list.filter(e => e.date <= today).sort((a, b) => b.date.localeCompare(a.date) || (b.kind === 'milestone') - (a.kind === 'milestone'));
  const md = today.slice(5);
  const onThisDay = all.filter(e => e.date.slice(5) === md && e.date < today && (e.group === 'fandom' || e.group === 'milestone'));
  const counts = { all: all.length, milestone: all.filter(e => e.group === 'milestone').length, life: all.filter(e => e.group === 'life').length, studio: all.filter(e => e.group === 'studio').length };

  const row = e => { const [emo] = KIND[e.kind] || ['•']; const ms = e.kind === 'milestone';
    return `<li class="fq-tl-item${ms ? ' ms' : ''}${e.date > today ? ' future' : ''}"><span class="fq-tl-dot">${esc(ms ? e.emoji || '⭐' : emo)}</span>
      <a class="fq-tl-card" ${ms ? '' : `href="${esc(e.href || '#/timeline')}"`}><div class="fq-row between" style="gap:6px;flex-wrap:nowrap;align-items:flex-start"><div style="min-width:0"><small class="fq-muted" style="font-weight:800">${esc(fmtDate(e.date + 'T00:00:00', { day: 'numeric', month: 'short', year: 'numeric' }))}${e.fname ? ' · ' + esc(e.fname) : ''}</small>
        <b>${esc(e.title)}</b>${e.sub || e.note ? `<small>${esc(e.note || e.sub)}</small>` : ''}</div>
        ${e.amount ? `<span class="fq-num" style="font-weight:800;white-space:nowrap">${esc(e.amount)}</span>` : ''}${e.rarity ? `<span class="fq-badge r-${esc(e.rarity)}">${esc(t('rarity.' + e.rarity, e.rarity))}</span>` : ''}
        ${ms ? `<button class="fq-iconbtn" style="width:32px;height:32px;box-shadow:none" data-ms-del="${esc(e.id)}" aria-label="${esc(t('common.delete', 'Delete'))}">${icon('trash')}</button>` : ''}</div></a></li>`; };

  const months = [];
  for (const e of past.slice(0, shown)) { const m = e.date.slice(0, 7); if (!months.length || months[months.length - 1].m !== m) months.push({ m, xs: [] }); months[months.length - 1].xs.push(e); }
  const monthTitle = m => new Date(m + '-01T00:00:00').toLocaleDateString(document.documentElement.lang || 'en', { month: 'long', year: 'numeric' });

  view.innerHTML = `<div class="fq-page">
    <div class="fq-head"><div><h1>${esc(t('tl.title', 'Timeline'))}</h1><p>${esc(t('tl.sub', 'Your fandom moments, little treats and milestones, all in one story.'))}</p></div></div>
    ${onThisDay.length ? `<section class="fq-card gold"><h2 class="fq-h2" style="margin-bottom:8px">${icon('calendar')}${esc(t('tl.onThisDay', 'On this day'))}</h2>
      <div class="fq-list">${onThisDay.slice(0, 5).map(e => `<a class="fq-li" href="${esc(e.href || '#/timeline')}" style="text-decoration:none"><span style="font-size:22px">${esc(e.kind === 'milestone' ? e.emoji || '⭐' : (KIND[e.kind] || ['•'])[0])}</span><div class="grow"><b>${esc(e.title)}</b><small>${esc(t('tl.yearsAgo', '{n} year(s) ago', { n: +today.slice(0, 4) - +e.date.slice(0, 4) }))}${e.fname ? ' · ' + esc(e.fname) : ''}</small></div></a>`).join('')}</div></section>` : ''}
    <details class="fq-card fq-details" ${life().timeline.milestones.length ? '' : 'open'}><summary>${icon('plus')}${esc(t('tl.addMilestone', 'Add a milestone'))}</summary>
      <form class="fq-stack" data-ms-form style="gap:10px;margin-top:12px">
        <div class="fq-row" style="flex-wrap:nowrap"><label class="fq-field" style="flex:2">${esc(t('tl.what', 'What happened?'))}<input class="fq-input" name="title" maxlength="80" required placeholder="${esc(t('tl.whatPh', 'e.g. First time seeing EXO live'))}"></label>
          <label class="fq-field" style="flex:1">${esc(t('life.date', 'Date'))}<input class="fq-input" name="date" type="date" value="${today}" required></label></div>
        <div class="fq-row" style="flex-wrap:nowrap"><label class="fq-field" style="flex:1">${esc(t('tl.fandom', 'Fandom (optional)'))}<select class="fq-input" name="fandom"><option value="">—</option>${fandoms.map(f => `<option value="${esc(f.id)}">${esc(f.name)}</option>`).join('')}</select></label>
          <label class="fq-field" style="flex:1">${esc(t('tl.emoji', 'Sticker'))}<select class="fq-input" name="emoji">${EMOJI.map(e => `<option>${e}</option>`).join('')}</select></label></div>
        <label class="fq-field">${esc(t('life.note', 'Note'))}<input class="fq-input" name="note" maxlength="140" placeholder="${esc(t('tl.notePh', 'A little memory to keep'))}"></label>
        <button class="fq-btn primary" type="submit" style="align-self:flex-start">${icon('star')}${esc(t('tl.save', 'Save milestone'))}</button></form></details>
    <div class="fq-row between"><div class="fq-chips scroll">${[['all', t('common.all', 'All'), counts.all], ['milestone', t('tl.milestones', 'Milestones'), counts.milestone]].concat(fandoms.map(f => [f.id, f.name, null])).concat([['life', t('nav.life', 'Life'), counts.life]])
      .map(([k, n, c]) => `<button class="fq-chip" aria-pressed="${filter === k}" data-f="${esc(k)}">${esc(n)}${c != null ? ` <span class="n">${c}</span>` : ''}</button>`).join('')}</div>
      <input class="fq-input" style="max-width:240px" type="search" placeholder="${esc(t('tl.search', 'Search…'))}" value="${esc(query)}" data-q aria-label="${esc(t('tl.search', 'Search…'))}"></div>
    ${!Lg ? '<div class="fq-skel" style="height:60px"></div>' : ''}
    ${upcoming.length ? `<section><h2 class="fq-h2" style="margin-bottom:8px">${icon('bolt')}${esc(t('tl.upcoming', 'Coming up'))}</h2><ol class="fq-tl">${upcoming.map(row).join('')}</ol></section>` : ''}
    ${months.length ? months.map(g => `<section><h2 class="fq-h2" style="margin-bottom:8px">${esc(monthTitle(g.m))} <span class="fq-badge">${g.xs.length}</span></h2><ol class="fq-tl">${g.xs.map(row).join('')}</ol></section>`).join('')
      : (upcoming.length ? '' : empty(t('tl.empty', 'Nothing here yet. Log a purchase, a cup of milk tea or add a milestone to start your story.'), 'calendar'))}
    ${past.length > shown ? `<button class="fq-btn" data-more style="align-self:center">${esc(t('tl.more', 'Show older'))} (${past.length - shown})</button>` : ''}
  </div>`;
  bind();
}

function bind() {
  view.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { filter = b.dataset.f; shown = PAGE; render(); });
  const q = view.querySelector('[data-q]');
  q.oninput = () => { query = q.value.trim().toLowerCase(); shown = PAGE; const pos = q.selectionStart; render(); const n = view.querySelector('[data-q]'); n.focus(); n.setSelectionRange(pos, pos); };
  view.querySelector('[data-more]')?.addEventListener('click', () => { shown += PAGE; render(); });
  view.querySelector('[data-ms-form]').addEventListener('submit', e => { e.preventDefault(); const f = e.target;
    if (!f.title.value.trim() || !f.date.value) return;
    try { saveLife(d => d.timeline.milestones.push({ id: newId(), date: f.date.value, title: f.title.value.trim(), note: f.note.value.trim(), fandom: f.fandom.value || null, emoji: f.emoji.value })); sound('ok'); toast(t('tl.saved', 'Milestone saved ⭐'), 'ok'); }
    catch { toast(t('err.storage_full', "This browser's storage is full or blocked, so the change was not saved."), 'err'); } });
  view.querySelectorAll('[data-ms-del]').forEach(b => b.onclick = async e => { e.preventDefault();
    if (await confirmDialog({ title: t('common.delete', 'Delete'), body: esc(t('tl.delConfirm', 'Delete this milestone?')), kind: 'danger', confirm: t('common.delete', 'Delete') }))
      saveLife(d => { d.timeline.milestones = d.timeline.milestones.filter(x => x.id !== b.dataset.msDel); }); });
}

export default {
  live: true,
  render(v) { view = v; render(); },
  refresh() { if (view?.isConnected) render(); },
};
