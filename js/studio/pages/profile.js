// Profile & Settings: profile, appearance, dashboard layout, account security.
import { store, profile, refresh, SLOTS, itemName, collectionStats } from '../store.js';
import { rpc, errText, verifyPassword, updatePassword, USERNAME_DOMAIN } from '../api.js';
import { t, L, LANGS } from '../i18n.js';
import { esc, fmt, fmtDate, toast, busy, sound } from '../ui.js';
import { icon } from '../icons.js';
import { txList, slotLabel, itemThumb, ring } from '../components.js';
import { currentSettings, ACCENTS } from '../theme.js';
import { saveSettings, onSaveStatus } from '../settings-sync.js';
import { bindPasswordToggles } from '../auth.js';

let tab = 'profile', unsub = null;
const WIDGET_EN = { fandom: 'My fandoms', schedule: 'Schedule', todo: 'To-do', life: 'Life (finance, calories, milk tea)', avatar: 'Greeting banner', 
  collection: 'Fandom spending', tracker: 'Fan tracker' };

const seg = (name, val, opts) => `<div class="fq-seg" role="radiogroup" aria-label="${esc(name)}">${opts.map(([v, label]) => `<button role="radio" aria-selected="${val === v}" aria-checked="${val === v}" data-set="${name}" data-v="${v}">${esc(label)}</button>`).join('')}</div>`;
const sw = (key, on, label, sub = '') => `<label class="fq-switch"><span>${esc(label)}${sub ? `<small>${esc(sub)}</small>` : ''}</span><input type="checkbox" data-toggle="${key}" ${on ? 'checked' : ''}></label>`;

function profileTab() {
  const p = profile(), s = store.state;
  return `<div style="max-width:720px">
    <section class="fq-card fq-stack"><div class="fq-row" style="flex-wrap:nowrap;align-items:flex-start;gap:16px">
      <div class="fq-prof-initial fq-pic"><img src="assets/avatar.png" alt=""></div>
      <div class="fq-stack" style="flex:1;min-width:0;gap:10px"><div><h2 class="fq-h2">${esc(p.display_name || p.username)}</h2><p class="fq-muted fq-small" style="font-weight:800">@${esc(p.username)} · ${esc(t('prof.memberSince', 'Member since {d}', { d: fmtDate(p.created_at) }))}</p></div>
        <form class="fq-stack" id="fq-prof-form" style="gap:10px"><label class="fq-field">${esc(t('prof.displayName', 'Display name'))}<input class="fq-input" id="fq-dn" maxlength="24" required value="${esc(p.display_name || p.username)}"></label>
          <div class="fq-row"><button class="fq-btn primary" type="submit">${icon('check')}${esc(t('prof.saveProfile', 'Save profile'))}</button></div></form></div></div></section>
  </div>
`;
}

function appearanceTab() {
  const s = currentSettings();
  return `<section class="fq-card fq-stack" style="max-width:760px">
    <div class="fq-row between"><p class="fq-note" style="flex:1">${icon('globe')}<span>${esc(t('set.synced', 'Settings sync to your account and follow you to every device.'))}</span></p><span class="fq-badge" id="fq-save-status" aria-live="polite"></span></div>
    <div class="fq-field">${esc(t('set.theme', 'Theme'))}${seg('theme', s.theme, [['light', t('set.light', 'Light')], ['dark', t('set.dark', 'Dark')], ['system', t('set.system', 'Match system')]])}</div>
    <div class="fq-field">${esc(t('set.accent', 'Accent colour'))}<div class="fq-swatches">${Object.entries(ACCENTS).map(([k, [a, b]]) =>
      `<button class="fq-swatch" style="background:linear-gradient(135deg,${a} 50%,${b} 50%);width:42px;height:42px" data-set="accent" data-v="${k}" aria-pressed="${s.accent === k}" aria-label="${esc(t('set.' + k, k))}" title="${esc(t('set.' + k, k))}"></button>`).join('')}
      <label class="fq-row" style="gap:6px"><input type="color" class="fq-color" data-accent-custom value="${esc(s.accent_custom)}" aria-label="${esc(t('set.custom', 'Custom'))}"><span class="fq-small" style="font-weight:800">${esc(t('set.custom', 'Custom'))}${s.accent === 'custom' ? ' ✓' : ''}</span></label></div></div>
    <div class="fq-field">${esc(t('set.background', 'Background pattern'))}<div class="fq-chips">${['plain', 'hearts', 'stars', 'clouds', 'dots'].map(b => `<button class="fq-chip" aria-pressed="${s.background === b}" data-set="background" data-v="${b}">${esc(t('set.bg.' + b, b[0].toUpperCase() + b.slice(1)))}</button>`).join('')}</div></div>
    ${sw('decor', s.decor, t('set.decor', 'Floating decorations'), t('set.decorSub', 'Little sparkles drifting in the background'))}
    <div class="fq-field">${esc(t('set.density', 'Interface density'))}${seg('density', s.density, [['compact', t('set.compact', 'Compact')], ['comfortable', t('set.comfortable', 'Comfortable')], ['spacious', t('set.spacious', 'Spacious')]])}</div>
    <label class="fq-field">${esc(t('set.fontSize', 'Text size'))} <span class="fq-num" id="fq-fs-v">${Math.round(s.font_scale * 100)}%</span><input type="range" class="fq-range" min="85" max="130" step="5" value="${Math.round(s.font_scale * 100)}" data-font></label>
    <div class="fq-field">${esc(t('set.sidebar', 'Sidebar'))}${seg('sidebar', s.sidebar, [['expanded', t('set.sb.expanded', 'Expanded')], ['collapsed', t('set.sb.collapsed', 'Icons only')], ['hidden', t('set.sb.hidden', 'Hidden')]])}</div>
    ${sw('sound', s.sound, t('set.sound', 'Sound effects'), t('set.soundSub', 'Little blips for taps, rewards and boxes'))}
    ${sw('motion', s.motion, t('set.motion', 'Animations'), t('set.motionSub', 'Turn off to reduce motion'))}
    <label class="fq-field">${esc(t('set.language', 'Language'))}<select class="fq-input" data-lang>${LANGS.map(([v, l]) => `<option value="${v}" ${s.language === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
  </section>`;
}

function dashboardTab() {
  const saved = currentSettings().widgets;
  const ws = [...['fandom', 'schedule', 'todo', 'life'].filter(id => !saved.some(w => w.id === id)).map(id => ({ id, on: true })), ...saved].filter(w => WIDGET_EN[w.id]);
  return `<section class="fq-card fq-stack fq-arrange" style="max-width:640px"><div><h2 class="fq-h2">${icon('layout')}${esc(t('set.widgets', 'Dashboard widgets'))}</h2><p class="fq-small fq-muted" style="font-weight:700">${esc(t('set.widgetsSub', 'Drag or use the arrows to reorder. Switch widgets on or off.'))}</p></div>
    <ul id="fq-widgets">${ws.map((w, i) => `<li data-w="${w.id}" draggable="true"><span class="handle" aria-hidden="true">${icon('drag')}</span><span class="grow">${esc(t('w.' + w.id, WIDGET_EN[w.id]))}</span>
      <button class="fq-iconbtn" style="width:34px;height:34px" data-move="-1" aria-label="${esc(t('set.moveUp', 'Move up'))}" ${i === 0 ? 'disabled' : ''}>${icon('chevU')}</button>
      <button class="fq-iconbtn" style="width:34px;height:34px" data-move="1" aria-label="${esc(t('set.moveDown', 'Move down'))}" ${i === ws.length - 1 ? 'disabled' : ''}>${icon('chevD')}</button>
      <label class="fq-switch" style="padding:0"><span class="fq-sr">${esc(t('w.' + w.id, WIDGET_EN[w.id]))}</span><input type="checkbox" data-widget-on ${w.on ? 'checked' : ''}></label></li>`).join('')}</ul>
    <a class="fq-btn" href="#/dashboard">${icon('home')}${esc(t('nav.dashboard', 'Home'))}</a></section>`;
}

function accountTab() {
  const email = store.user?.email || '';
  const synthetic = email.endsWith('@' + USERNAME_DOMAIN);
  return `<div class="fq-cols">
    <section class="fq-card fq-stack"><h2 class="fq-h2">${icon('lock')}${esc(t('acct.changePw', 'Change password'))}</h2>
      <p class="fq-small fq-muted" style="font-weight:800">${synthetic ? `${esc(t('auth.user', 'User ID'))}: ${esc(email.split('@')[0])}` : `${esc(t('acct.email', 'Sign-in email'))}: ${esc(email)}`}</p>
      <form class="fq-stack" id="fq-pw-form" novalidate>
        ${['fq-cur:acct.current:Current password:current-password', 'fq-new:auth.newPass:New password:new-password', 'fq-new2:auth.confirmPass:Confirm new password:new-password'].map(x => { const [id, k, en, ac] = x.split(':');
          return `<label class="fq-field" for="${id}">${esc(t(k, en))}<span class="fq-pw"><input class="fq-input" id="${id}" type="password" autocomplete="${ac}" required><button type="button" data-toggle-pw="${id}" aria-label="${esc(t('auth.show', 'Show password'))}">${icon('eye')}</button></span></label>`; }).join('')}
        <button class="fq-btn primary" type="submit">${icon('check')}${esc(t('acct.update', 'Update password'))}</button><div class="fq-msg" id="fq-pw-msg" role="status"></div></form></section>
    <section class="fq-card fq-stack"><h2 class="fq-h2">${icon('shield')}${esc(t('acct.session', 'Session'))}</h2><p class="fq-muted" style="font-weight:700">${esc(t('acct.sessionSub', 'You stay signed in after refreshing. Remember to log out on shared devices.'))}</p>
      <div class="fq-row"><button class="fq-btn" data-logout-local>${icon('logout')}${esc(t('acct.logout', 'Log out'))}</button><button class="fq-btn danger" data-logout-all>${icon('logout')}${esc(t('acct.logoutAll', 'Log out on all devices'))}</button></div></section>
  </div>`;
}

export default {
  live: true,
  render(view, ctx, reason) {
    const p0 = ctx.params[0];
    if (['profile', 'appearance', 'dashboard', 'account'].includes(p0)) tab = p0;
    if (p0 === 'history') tab = 'profile';
    // Don't wipe forms the user is typing in when background data refreshes.
    if (reason === 'store' && (tab === 'account' || (tab === 'profile' && view.querySelector('#fq-dn') === document.activeElement))) return;
    const tabs = [['profile', 'prof.tab.profile', 'Profile', 'heart'], ['appearance', 'prof.tab.appearance', 'Appearance', 'palette'], ['dashboard', 'prof.tab.dashboard', 'Dashboard', 'layout'], ['account', 'prof.tab.account', 'Account & security', 'shield']];
    view.innerHTML = `<div class="fq-page"><div class="fq-head"><div><h1>${esc(t('prof.title', 'Profile & Settings'))}</h1></div></div>
      <div class="fq-seg" role="tablist">${tabs.map(([k, key, en, ic]) => `<button role="tab" aria-selected="${tab === k}" data-tab="${k}">${icon(ic)}${esc(t(key, en))}</button>`).join('')}</div>
      ${tab === 'profile' ? profileTab() : tab === 'appearance' ? appearanceTab() : tab === 'dashboard' ? dashboardTab() : accountTab()}</div>`;
    const rer = () => this.render(view, { ...ctx, params: [tab] }, 'local');
    view.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; history.replaceState(null, '', '#/profile/' + tab); rer(); });
    if (p0 === 'history' && reason === 'route') setTimeout(() => view.querySelector('#history')?.scrollIntoView({ behavior: 'smooth' }), 50);

    // profile
    view.querySelector('#fq-prof-form')?.addEventListener('submit', e => { e.preventDefault(); busy(e.submitter || e.target.querySelector('[type=submit]'), async () => {
      try { const r = await rpc('fq_set_profile', { p_display_name: view.querySelector('#fq-dn').value, p_show_on_leaderboard: !!profile().show_on_leaderboard });
        Object.assign(store.state.profile, r); store.leaderboard = null; sound('ok'); toast(t('prof.profileSaved', 'Profile saved'), 'ok'); ctx.rerenderShell(); await refresh({ silent: true }); }
      catch (err) { toast(errText(err), 'err'); } }); });

    // appearance
    const status = view.querySelector('#fq-save-status');
    unsub?.(); unsub = onSaveStatus(s => { if (status?.isConnected) status.textContent = s === 'saving' ? t('common.saving', 'Saving…') : s === 'saved' ? '✓ ' + t('common.saved', 'Saved') : '!'; });
    const apply = async (patch, shell = false) => { saveSettings(patch); if (shell) ctx.rerenderShell(); rer(); };
    view.querySelectorAll('[data-set]').forEach(b => b.onclick = () => apply({ [b.dataset.set]: b.dataset.v }, ['sidebar', 'theme'].includes(b.dataset.set)));
    view.querySelector('[data-accent-custom]')?.addEventListener('input', e => saveSettings({ accent: 'custom', accent_custom: e.target.value }));
    view.querySelector('[data-accent-custom]')?.addEventListener('change', () => rer());
    view.querySelectorAll('[data-toggle]').forEach(i => { if (i.dataset.toggle !== 'leaderboard') i.onchange = () => apply({ [i.dataset.toggle]: i.checked }); });
    view.querySelector('[data-font]')?.addEventListener('input', e => { view.querySelector('#fq-fs-v').textContent = e.target.value + '%'; saveSettings({ font_scale: +e.target.value / 100 }); });
    view.querySelector('[data-lang]')?.addEventListener('change', e => apply({ language: e.target.value }, true));

    // dashboard widgets
    const ul = view.querySelector('#fq-widgets');
    if (ul) {
      const commit = () => saveSettings({ widgets: [...ul.children].map(li => ({ id: li.dataset.w, on: li.querySelector('[data-widget-on]').checked })) });
      ul.querySelectorAll('[data-move]').forEach(b => b.onclick = () => { const li = b.closest('li'); const d = +b.dataset.move;
        if (d < 0 && li.previousElementSibling) li.previousElementSibling.before(li); if (d > 0 && li.nextElementSibling) li.nextElementSibling.after(li); commit(); rer(); });
      ul.querySelectorAll('[data-widget-on]').forEach(i => i.onchange = commit);
      let dragging = null;
      ul.addEventListener('dragstart', e => { dragging = e.target.closest('li'); dragging?.classList.add('drag'); e.dataTransfer.effectAllowed = 'move'; });
      ul.addEventListener('dragover', e => { e.preventDefault(); const over = e.target.closest('li'); if (!dragging || !over || over === dragging) return;
        const r = over.getBoundingClientRect(); (e.clientY > r.top + r.height / 2) ? over.after(dragging) : over.before(dragging); });
      ul.addEventListener('dragend', () => { dragging?.classList.remove('drag'); dragging = null; commit(); rer(); });
    }

    // account
    bindPasswordToggles(view);
    view.querySelector('#fq-pw-form')?.addEventListener('submit', e => { e.preventDefault(); const msg = view.querySelector('#fq-pw-msg'); msg.className = 'fq-msg err';
      const cur = view.querySelector('#fq-cur').value, n1 = view.querySelector('#fq-new').value, n2 = view.querySelector('#fq-new2').value;
      if (n1.length < 8) { msg.textContent = t('auth.short', 'Passwords need at least 8 characters.'); return; }
      if (n1 !== n2) { msg.textContent = t('auth.mismatch', "Passwords don't match."); return; }
      busy(e.target.querySelector('[type=submit]'), async () => {
        if (!(await verifyPassword(store.user.email, cur))) { msg.textContent = t('acct.wrongCurrent', 'Your current password is incorrect.'); return; }
        try { await updatePassword(n1); msg.className = 'fq-msg ok'; msg.textContent = t('acct.pwUpdated', 'Password updated.'); e.target.reset(); sound('ok'); }
        catch (err) { msg.textContent = err.message || errText(err); }
      }); });
    view.querySelector('[data-logout-local]')?.addEventListener('click', () => ctx.logout('local'));
    view.querySelector('[data-logout-all]')?.addEventListener('click', () => ctx.logout('global'));
  },
  destroy() { unsub?.(); unsub = null; },
};
