// Loads the original Fan tracker (classic scripts) on demand. Shared by the router and the start page.
let loading = null;
export function legacyReady() { return !!window.FQLegacy; }
export function loadLegacy() {
  if (loading) return loading;
  const add = src => new Promise((ok, bad) => { const s = document.createElement('script'); s.src = src; s.async = false; s.onload = ok; s.onerror = bad; document.body.append(s); });
  loading = Promise.all([add('assets/legacy-data.js'), add('assets/dk-cards.js'), add('assets/svt-merch.js'), add('js/legacy/app.js')]).catch(e => { loading = null; throw e; });
  return loading;
}
