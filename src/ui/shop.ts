import { accountCard, unavailableAccount } from './account';
import type { AccountState } from '../platform/account';
import { translate as tr } from './localization';
import { icon } from './icons';
import './shop.css';

export const shopUnavailable = () => tr('Purchases and restore are not available in this build. No charge has been made.');

export function shopPanel(account: AccountState = unavailableAccount): string {
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
        <div class="shop-price"><strong>USD 2.00</strong><span>${tr('Base reference price')}</span></div>
        <p class="shop-price-note">${tr('The final local price will be shown by Google Play before payment.')}</p>
        <button class="primary-button" data-action="shop-purchase" disabled aria-describedby="shop-status">${icon('lock')}${tr('Coming soon')}</button>
        <p id="shop-status" class="shop-status">${shopUnavailable()}</p>
        <button class="soft-button shop-restore" data-action="shop-restore">${tr('Restore purchases')}</button>
      </div>
    </article>
  </section>`;
}
