// Applies settings instantly and syncs them to the account (debounced).
import { rpc, errText } from './api.js';
import { store } from './store.js';
import { applySettings, currentSettings } from './theme.js';
import { toast } from './ui.js';

let pending = {}, timer = null, inflight = Promise.resolve();
const listeners = new Set();
export const onSaveStatus = fn => (listeners.add(fn), () => listeners.delete(fn));
const status = s => listeners.forEach(f => f(s));

export function saveSettings(partial) {
  const next = applySettings({ ...currentSettings(), ...partial });
  if (store.state) store.state.profile.settings = next;
  Object.assign(pending, partial);
  status('saving');
  clearTimeout(timer);
  return new Promise(resolve => {
    timer = setTimeout(() => {
      const body = pending; pending = {};
      inflight = inflight.then(() => rpc('fq_save_settings', { p_settings: body }))
        .then(clean => { if (store.state) store.state.profile.settings = clean; status('saved'); resolve(true); })
        .catch(e => { status('error'); toast(errText(e), 'err'); resolve(false); });
    }, 500);
  });
}
