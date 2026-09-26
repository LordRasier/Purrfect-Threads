import { unavailableBilling, type BillingState } from '../platform/billing';
import { accountCard, unavailableAccount } from './account';
import type { AccountState } from '../platform/account';
import { translate as tr } from './localization';
import { icon } from './icons';
import './shop.css';

export const shopUnavailable = () => tr('Purchases and restore are not available in this build. No charge has been made.');

export function shopPanel(account: AccountState = unavailableAccount, billing: BillingState = unavailableBilling): string {
  return `<section class="shop-panel" aria-labelledby="shop-title">
    <header class="shop-header"><span class="eyebrow">${tr('A LITTLE EXTRA HELP')}</span><h1 id="shop-title">${tr('Shop')}</h1><p>${tr('An optional helping paw. Your workshop is always free to play.')}</p></header>
    ${accountCard(account)}
    <article class="shop-product" aria-labelledby="crew-title">
      <div class="shop-illustration"><span class="shop-tag">${tr('12 REAL HOURS')}</span><img src="${import.meta.env.BASE_URL}art/meowtastic-contractors.png" alt="${tr('Three cat contractors with sunglasses, blueprints and tools')}" width="1536" height="1024" /></div>
      <div class="shop-details"><span class="eyebrow">${tr('MEET YOUR CONTRACTORS')}</span><h2 id="crew-title">${tr('Meowtastic Crew')}</h2>
        <p class="shop-intro">${tr('Big plans. Tiny paws. Double the teamwork.')}</p>
        <p>${tr('When efficiency calls, these three answer. They bring tools, blueprints and enough confidence to supervise the supervisor. Hard hats on; nap breaks negotiable.')}</p>
        <div class="shop-perk">${icon('yarn')}<strong>×2</strong><span>${tr('automatic production')}</span></div>
        <p>${tr('For 12 real hours from confirmed purchase, including time away. The timer keeps running while the game is closed.')}</p>
        <ul><li>${tr('Survives chapter restarts.')}</li><li>${tr('No stacking. Buy again only after the boost expires.')}</li><li>${tr('Does not multiply taps or the +5 yarn cat reward.')}</li><li>${tr('Offline earnings keep their usual 8-hour cap and 50% rate (65% with Roman).')}</li></ul>
        <div class="shop-price"><strong id="crew-price">${escapePrice(billing.price || 'USD 2.00')}</strong><span>${tr('Base reference price')}</span></div>
        <p>${tr('Offline boosts require a previously verified purchase on this device. After a device restart or clock change, reconnect to verify. Refund updates may take up to 12 hours while offline.')}</p>
        <p>${tr('Unverified or interrupted bonus earnings may be lost. Reconnect after 12 hours without verification.')}</p>
        <p class="shop-price-note">${tr('The final local price will be shown by Google Play before payment.')}</p>
        <button class="primary-button" data-action="shop-purchase" ${billing.ready && !billing.pending ? '' : 'disabled'} aria-describedby="shop-status">${billing.ready ? tr('Buy with Google Play') : tr('Unavailable')}</button>
        <p id="shop-status" class="shop-status">${billingMessage(billing)}</p>
        <button class="soft-button shop-restore" data-action="shop-restore">${tr('Restore purchases')}</button>
      </div>
    </article>
  </section>`;
}

const escapePrice = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
export function billingMessage(state: BillingState): string {
  if (state.pending || state.status === 'busy') return tr('Checking Google Play and purchase verification…');
  if (state.status === 'pending') return tr('Payment pending. No boost is granted until Google Play confirms payment.');
  if (state.status === 'cancelled') return tr('Purchase cancelled.');
  if (state.status === 'account-mismatch') return tr('Reconnect the Google account used for this purchase, then restore.');
  if (state.status === 'restore-required') return tr('Restore purchases before trying again.');
  if (state.active) return tr('Meowtastic Crew is active. The original 12-hour timer continues offline.');
  if (state.ready) return tr('Ready. Google Play will show the final price before payment.');
  if (state.status === 'signed-out') return tr('Connect with Google to check purchases.');
  return tr('Purchases are unavailable. The verification service or Google Play is not ready. Restore later if a payment was already made.');
}
export function updateShop(root: HTMLElement, state: BillingState): void {
  const button = root.querySelector<HTMLButtonElement>('[data-action="shop-purchase"]');
  if (!button) return;
  button.disabled = !state.ready || state.pending;
  button.textContent = tr(state.ready ? 'Buy with Google Play' : 'Unavailable');
  const status = root.querySelector('#shop-status'); if (status) status.textContent = billingMessage(state);
  const price = root.querySelector('#crew-price'); if (price) price.textContent = state.price || 'USD 2.00';
  const restore = root.querySelector<HTMLButtonElement>('[data-action="shop-restore"]'); if (restore) restore.disabled = state.pending;
}
