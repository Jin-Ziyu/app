// Login / registration / password recovery screens.
import { renderAvatar } from './avatar.js';
import { t } from './i18n.js';
import { esc, $, busy } from './ui.js';
import { icon } from './icons.js';
import * as api from './api.js';

// Art for the login mascot (a copy of the default starter look, so it renders before sign-in).
const MASCOT_ITEMS = new Map(Object.entries({
  sp_bunny: { slot: 'species', art: { shape: 'bunny', fur: '#fff3f7' } }, hair_bob: { slot: 'hair', art: { shape: 'bob' } },
  top_tee_pink: { slot: 'top', art: { shape: 'tee', color: '#ffb8cf', accent: '#ff8fb1' } }, bot_skirt_pink: { slot: 'bottom', art: { shape: 'skirt', color: '#ff9fc0' } },
  sh_sneakers: { slot: 'shoes', art: { shape: 'sneakers', color: '#ffffff', accent: '#ff9fc0' } }, hat_bow: { slot: 'hat', art: { shape: 'bow', color: '#ff8fb1' } },
  hd_lightstick: { slot: 'held', art: { shape: 'lightstick', color: '#b9a5ee' } }, bg_sky: { slot: 'background', art: { c1: '#ffe3ef', c2: '#e3dcff', deco: 'clouds' } },
  fr_round: { slot: 'frame', art: { shape: 'round', color: '#ffffff' } }, ps_cheer: { slot: 'pose', art: { shape: 'cheer' } }, fx_hearts: { slot: 'effect', art: { shape: 'hearts', color: '#ff7fa8' } },
}).map(([id, v]) => [id, { id, ...v }]));
const MASCOT = { species: 'sp_bunny', hair: 'hair_bob', top: 'top_tee_pink', bottom: 'bot_skirt_pink', shoes: 'sh_sneakers', hat: 'hat_bow', held: 'hd_lightstick',
  background: 'bg_sky', frame: 'fr_round', pose: 'ps_cheer', effect: 'fx_hearts', skin: '#fff3f7', eyes: '#4a3b6b', hair_color: '#8a5a44' };

const pwField = (id, label, auto, ph = '') => `<label class="fq-field" for="${id}">${esc(label)}
  <span class="fq-pw"><input class="fq-input" id="${id}" type="password" autocomplete="${auto}" required minlength="${auto === 'current-password' ? 1 : 8}" placeholder="${esc(ph)}">
  <button type="button" data-toggle-pw="${id}" aria-label="${esc(t('auth.show', 'Show password'))}" aria-pressed="false">${icon('eye')}</button></span></label>`;

function shell(inner, { dev, local } = {}) {
  return `<div class="fq-auth"><div class="fq-auth-card">
    <div class="fq-auth-art"><div class="fq-stage">${renderAvatar(MASCOT, MASCOT_ITEMS, { title: 'Fan Quest mascot' })}</div>
      <h1>Fan Quest</h1><p>${esc(t('app.tagline', 'Your little corner of fandom magic'))}</p>
      ${dev ? `<span class="fq-badge">${esc(t('auth.devHint', 'Local dev backend'))}</span>` : ''}
      ${local ? `<span class="fq-badge">${esc(t('auth.localBadge', 'Offline mode · saved in this browser'))}</span>` : ''}</div>
    <div class="fq-auth-form">${inner}</div></div></div>`;
}

export function renderAuth(root, mode = 'login', { onRecovered, dev, local, message } = {}) {
  root.hidden = false;
  const msg = message ? `<div class="fq-msg ok" role="status">${esc(message)}</div>` : '<div class="fq-msg" role="status" aria-live="polite" id="fq-auth-msg"></div>';
  if (mode === 'setup') {
    root.innerHTML = shell(`<h2>${esc(t('auth.setupTitle', 'Setup required'))}</h2><p class="fq-muted" style="font-weight:700">${esc(t('auth.setupHelp', 'Add your Supabase project URL and anon/publishable key to config.js and run the SQL in supabase/migrations. See SETUP.md.'))}</p>`);
    return;
  }
  if (mode === 'login') {
    root.innerHTML = shell(`<form id="fq-login" novalidate>
      <div class="fq-stack"><h2>${esc(t('auth.welcome', 'Welcome back!'))}</h2>
      <label class="fq-field" for="fq-id">${esc(t('auth.user', 'User ID or email'))}<input class="fq-input" id="fq-id" autocomplete="username" required placeholder="${esc(t('auth.userPh', 'e.g. jujiang'))}" autocapitalize="none" spellcheck="false"></label>
      ${pwField('fq-pw', t('auth.pass', 'Password'), 'current-password', t('auth.passPh', 'Your password'))}
      <div class="fq-row between"><button type="button" class="fq-link" data-mode="reset">${esc(t('auth.forgot', 'Forgot password?'))}</button></div>
      <button class="fq-btn primary block" type="submit">${esc(t('auth.login', 'Log in'))}</button>
      ${msg}
      <p class="fq-small fq-muted" style="font-weight:700">${esc(t('auth.noAccount', "Don't have an account?"))} <button type="button" class="fq-link" data-mode="register">${esc(t('auth.register', 'Create account'))}</button></p>
      ${local ? `<p class="fq-note">${icon('info')}<span>${esc(t('auth.localHint', 'Offline mode: log in with user ID “jujiang”, or create another account. Progress is saved only in this browser.'))}</span></p>` : ''}
      <p class="fq-small fq-muted" style="font-weight:600">${icon('shield')} ${esc(t('auth.secure', 'Sign-in is handled securely by Supabase. Your password is never stored in this app’s code.'))}</p></div></form>`, { dev, local });
    const f = $('#fq-login', root);
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const id = $('#fq-id', root), pw = $('#fq-pw', root), out = $('#fq-auth-msg', root);
      out.className = 'fq-msg';
      if (!id.value.trim() || !pw.value) { out.className = 'fq-msg err'; out.textContent = t('auth.bad', 'Incorrect user ID or password.'); (id.value.trim() ? pw : id).focus(); return; }
      await busy(f.querySelector('[type=submit]'), async () => {
        try { await api.signIn(id.value, pw.value); }
        catch (err) {
          out.className = 'fq-msg err';
          out.textContent = /invalid login|credentials/i.test(err.message) ? t('auth.bad', 'Incorrect user ID or password.') : (api.errText(err) === t('err.generic', 'Something went wrong. Please try again.') ? err.message : api.errText(err));
          id.setAttribute('aria-invalid', 'true'); pw.setAttribute('aria-invalid', 'true'); pw.select();
        }
      });
    });
  }
  if (mode === 'register') {
    root.innerHTML = shell(`<form id="fq-reg" novalidate><div class="fq-stack"><h2>${esc(t('auth.register', 'Create account'))}</h2>
      <label class="fq-field" for="fq-un">${esc(t('auth.username', 'Username'))}<input class="fq-input" id="fq-un" autocomplete="nickname" required pattern="[A-Za-z0-9_]{3,20}" maxlength="20" autocapitalize="none" spellcheck="false"><small style="font-weight:600">${esc(t('auth.usernameHint', '3–20 letters, numbers or underscores'))}</small></label>
      <label class="fq-field" for="fq-em">${esc(local ? t('auth.emailOptional', 'Email (optional)') : t('auth.email', 'Email'))}<input class="fq-input" id="fq-em" type="email" autocomplete="email" ${local ? '' : 'required'}></label>
      ${pwField('fq-np', t('auth.pass', 'Password'), 'new-password')}
      ${pwField('fq-np2', t('auth.confirmPass', 'Confirm password'), 'new-password')}
      <button class="fq-btn primary block" type="submit">${esc(t('auth.create', 'Create account'))}</button>${msg}
      <p class="fq-small fq-muted" style="font-weight:700">${esc(t('auth.haveAccount', 'Already have an account?'))} <button type="button" class="fq-link" data-mode="login">${esc(t('auth.login', 'Log in'))}</button></p></div></form>`, { dev, local });
    const f = $('#fq-reg', root);
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const out = $('#fq-auth-msg', root); out.className = 'fq-msg err';
      const un = $('#fq-un', root).value.trim(), em = $('#fq-em', root).value.trim(), p1 = $('#fq-np', root).value, p2 = $('#fq-np2', root).value;
      if (!/^[A-Za-z0-9_]{3,20}$/.test(un)) { out.textContent = t('auth.badUsername', 'Usernames are 3–20 letters, numbers or underscores.'); return; }
      if ((em || !local) && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { out.textContent = t('auth.badEmail', 'Please enter a valid email address.'); return; }
      if (p1.length < 8) { out.textContent = t('auth.short', 'Passwords need at least 8 characters.'); return; }
      if (p1 !== p2) { out.textContent = t('auth.mismatch', "Passwords don't match."); return; }
      await busy(f.querySelector('[type=submit]'), async () => {
        try {
          const r = await api.signUp({ email: em, password: p1, username: un });
          if (!r.session) renderAuth(root, 'login', { dev, message: t('auth.checkEmail', 'Account created! Check your email to confirm it, then log in.') });
        } catch (err) { out.textContent = err.message || api.errText(err); }
      });
    });
  }
  if (mode === 'reset' && local) {
    root.innerHTML = shell(`<div class="fq-stack"><h2>${esc(t('auth.resetTitle', 'Reset password'))}</h2>
      <p class="fq-muted" style="font-weight:700">${esc(t('auth.localReset', 'In offline mode there is no email service, so passwords can’t be reset by email. If you’re still logged in somewhere, change it under Profile & Settings → Account & security. Otherwise create a new account on this browser.'))}</p>
      <button type="button" class="fq-btn primary" data-mode="login">${esc(t('auth.backToLogin', 'Back to log in'))}</button></div>`, { dev, local });
  } else if (mode === 'reset') {
    root.innerHTML = shell(`<form id="fq-reset" novalidate><div class="fq-stack"><h2>${esc(t('auth.resetTitle', 'Reset password'))}</h2>
      <p class="fq-muted" style="font-weight:700">${esc(t('auth.resetHelp', "Enter your account's email and we'll send you a reset link."))}</p>
      <label class="fq-field" for="fq-re">${esc(t('auth.email', 'Email'))}<input class="fq-input" id="fq-re" autocomplete="email" required></label>
      <button class="fq-btn primary block" type="submit">${esc(t('auth.sendReset', 'Send reset link'))}</button>${msg}
      <button type="button" class="fq-link" data-mode="login">${esc(t('auth.backToLogin', 'Back to log in'))}</button></div></form>`, { dev, local });
    const f = $('#fq-reset', root);
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const v = $('#fq-re', root).value.trim(), out = $('#fq-auth-msg', root);
      out.className = 'fq-msg err';
      if (!v.includes('@')) { out.textContent = t('auth.syntheticNoReset', 'Accounts that sign in with a user ID have no real email, so they cannot reset by email. Log in and change the password under Profile & Settings.'); return; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { out.textContent = t('auth.badEmail', 'Please enter a valid email address.'); return; }
      await busy(f.querySelector('[type=submit]'), async () => {
        try { await api.sendReset(v); out.className = 'fq-msg ok'; out.textContent = t('auth.resetSent', 'If that email has an account, a reset link is on its way.'); }
        catch (err) { out.textContent = err.message || api.errText(err); }
      });
    });
  }
  if (mode === 'recover') {
    root.innerHTML = shell(`<form id="fq-recover" novalidate><div class="fq-stack"><h2>${esc(t('auth.recoverTitle', 'Set a new password'))}</h2>
      <p class="fq-muted" style="font-weight:700">${esc(t('auth.recoverHelp', 'Choose a new password for your account.'))}</p>
      ${pwField('fq-rp', t('auth.newPass', 'New password'), 'new-password')}${pwField('fq-rp2', t('auth.confirmPass', 'Confirm password'), 'new-password')}
      <button class="fq-btn primary block" type="submit">${esc(t('acct.update', 'Update password'))}</button>${msg}</div></form>`, { dev, local });
    const f = $('#fq-recover', root);
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const p1 = $('#fq-rp', root).value, p2 = $('#fq-rp2', root).value, out = $('#fq-auth-msg', root);
      out.className = 'fq-msg err';
      if (p1.length < 8) { out.textContent = t('auth.short', 'Passwords need at least 8 characters.'); return; }
      if (p1 !== p2) { out.textContent = t('auth.mismatch', "Passwords don't match."); return; }
      await busy(f.querySelector('[type=submit]'), async () => {
        try { await api.updatePassword(p1); onRecovered?.(); } catch (err) { out.textContent = err.message || api.errText(err); }
      });
    });
  }
  root.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => renderAuth(root, b.dataset.mode, { onRecovered, dev, local })));
  bindPasswordToggles(root);
  root.querySelector('input')?.focus();
}

export function bindPasswordToggles(root) {
  root.querySelectorAll('[data-toggle-pw]').forEach(b => b.addEventListener('click', () => {
    const i = document.getElementById(b.dataset.togglePw); const show = i.type === 'password';
    i.type = show ? 'text' : 'password';
    b.innerHTML = icon(show ? 'eyeOff' : 'eye');
    b.setAttribute('aria-pressed', String(show));
    b.setAttribute('aria-label', show ? t('auth.hide', 'Hide password') : t('auth.show', 'Show password'));
  }));
}
