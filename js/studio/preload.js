// Runs before first paint: apply the last-used theme so the page doesn't flash.
(function () {
  var r = document.documentElement, s = null;
  try { s = JSON.parse(localStorage.getItem('fq:settings') || 'null'); } catch (e) { s = null; }
  s = s || {};
  var dark = s.theme === 'dark' || (s.theme === 'system' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  r.setAttribute('data-fq-mode', dark ? 'dark' : 'light');
  r.setAttribute('data-fq-accent', s.accent || 'pastel');
  r.setAttribute('data-fq-pattern', s.background || 'hearts');
  r.setAttribute('data-fq-density', s.density || 'comfortable');
  r.setAttribute('data-fq-sidebar', s.sidebar || 'expanded');
  r.setAttribute('data-fq-motion', s.motion === false ? 'off' : 'on');
  if (s.font_scale) r.style.setProperty('--fq-scale', String(s.font_scale));
  if (s.language === 'zh') r.lang = 'zh-CN';
})();
