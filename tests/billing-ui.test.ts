import { setLanguage } from '../src/ui/localization';
import { expect, it } from 'vitest';
import { shopPanel } from '../src/ui/shop';
import { unavailableBilling } from '../src/platform/billing';
import { unavailableAccount } from '../src/ui/account';
import { privacyContent } from '../src/ui/privacy';
it('shows localized Play price and enables purchase only when ready', () => {
  const panel = shopPanel(unavailableAccount, { ...unavailableBilling, status: 'ready', ready: true, price: '<$2>' });
  expect(panel).toContain('&lt;$2&gt;');
  expect(panel).not.toContain('data-action="shop-purchase" disabled');
  expect(panel).toContain('Buy with Google Play');
  expect(panel).toContain('device restart');
});
it('discloses optional identity purchase verification without claiming no purchases', () => {
  expect(privacyContent('en')).toContain('App Check');
  expect(privacyContent('en')).not.toContain('No in-app purchases are included');
  expect(privacyContent('es')).toContain('App Check');
});

it('localizes pending payment and offline restrictions in Spanish', () => {
  setLanguage('es');
  try {
    const panel = shopPanel(unavailableAccount, { ...unavailableBilling, status: 'pending' });
    expect(panel).toContain('Pago pendiente');
    expect(panel).toContain('reiniciar el dispositivo');
    expect(panel).not.toContain('Payment pending');
  } finally { setLanguage('en'); }
});
