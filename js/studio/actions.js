// Shared server actions with consistent feedback.
import { rpc, errText } from './api.js';
import { store, applyBalance, refresh, profile, REQUIRED, itemName } from './store.js';
import { t, L } from './i18n.js';
import { toast, busy, sound, confetti } from './ui.js';
import { tryOn } from './avatar.js';

export async function claimDaily(btn) {
  return busy(btn, async () => {
    try {
      const r = await rpc('fq_claim_daily');
      if (r.already) { toast(t('toast.dailyAlready', 'Already claimed today.')); await refresh({ silent: true }); return; }
      sound('coin'); confetti(40);
      toast(t('toast.daily', 'Daily login +5 Fan Points! {n}-day streak', { n: r.streak }), 'coin');
      applyBalance(r.balance);
    } catch (e) { sound('bad'); toast(errText(e), 'err'); }
  });
}
export async function claimMission(id, btn) {
  return busy(btn, async () => {
    try { const r = await rpc('fq_claim_mission', { p_mission_id: id }); sound('coin'); toast(t('missions.claimedToast', 'Mission complete! +{n} Fan Points', { n: r.awarded }), 'coin'); applyBalance(r.balance); }
    catch (e) { sound('bad'); toast(errText(e), 'err'); refresh({ silent: true }); }
  });
}
export async function claimAchievement(id, btn) {
  return busy(btn, async () => {
    try { const r = await rpc('fq_claim_achievement', { p_achievement_id: id }); sound('ok'); confetti(70); toast(t('ach.claimedToast', 'Achievement unlocked! +{n} Fan Points', { n: r.awarded }), 'coin'); applyBalance(r.balance); }
    catch (e) { sound('bad'); toast(errText(e), 'err'); refresh({ silent: true }); }
  });
}
export async function saveAvatar(av) {
  const clean = await rpc('fq_save_avatar', { p_avatar: av });
  store.state.profile.avatar = clean;
  await refresh({ silent: true });
  return clean;
}
// Equip (or unequip with itemId=null) a single slot and save immediately.
export async function equip(slot, itemId, btn) {
  return busy(btn, async () => {
    const base = { ...profile().avatar, mode: 'built' };
    let next;
    if (itemId) next = tryOn(base, store.items.get(itemId));
    else { if (REQUIRED.includes(slot)) return; next = { ...base, [slot]: null }; }
    try {
      await saveAvatar(next); sound('ok');
      toast(itemId ? t('ward.equippedToast', 'Equipped {name}', { name: itemName(store.items.get(itemId)) }) : t('common.saved', 'Saved'), 'ok');
    } catch (e) { sound('bad'); toast(errText(e), 'err'); }
  });
}
export const boxName = b => L(b);
