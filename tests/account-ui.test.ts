import { afterEach, expect, it } from 'vitest';
import { accountCard, accountPresentation } from '../src/ui/account';
import { setLanguage } from '../src/ui/localization';
import { shopPanel } from '../src/ui/shop';
const signedOut = { status: 'signed-out' as const, pending: false, notice: null };
afterEach(() => setLanguage('en'));
it('shows disclosure before explicit Google action in both languages', () => {
  expect(accountCard(signedOut)).toContain('Google/Firebase processes account identifiers');
  expect(accountCard(signedOut)).toContain('Saved games are not synced');
  expect(accountCard(signedOut)).toContain('Purchases require an available verification service');
  expect(accountCard(signedOut)).toContain('Connect with Google');
  setLanguage('es');
  expect(accountCard(signedOut)).toContain('Google/Firebase procesa identificadores');
  expect(accountCard(signedOut)).toContain('Las partidas no se sincronizan');
  expect(accountCard(signedOut)).toContain('Conectar con Google');
});
it('keeps account and purchase status separate and default account disabled', () => {
  expect(shopPanel()).toContain('ACCOUNT');
  expect(shopPanel()).toContain('Account connection is unavailable in this build');
  expect(shopPanel()).toContain('data-action="shop-purchase" disabled');
});
it('presents busy, cancelled, failed and disconnected-clear-failed recovery', () => {
  expect(accountPresentation({ ...signedOut, pending: true }).disabled).toBe(true);
  expect(accountPresentation({ ...signedOut, status: 'busy' }).refresh).toBe(true);
  expect(accountPresentation({ ...signedOut, notice: 'cancelled' }).message).toContain('cancelled');
  expect(accountPresentation({ ...signedOut, notice: 'failed' }).message).toContain('try again');
  expect(accountPresentation({ ...signedOut, notice: 'clear-failed' }).message).toContain('Disconnected');
  expect(accountPresentation({ ...signedOut, status: 'signed-in' }).action).toBe('account-disconnect');
});
it('offers an explicit account deletion request in every state and both languages', () => {
  for (const language of ['en', 'es'] as const) {
    setLanguage(language);
    for (const status of ['signed-in', 'signed-out', 'unavailable', 'busy'] as const) {
      const html = accountCard({ status, pending: true, notice: null });
      expect(html).toContain('href="https://www.auraliax.com/privacy-purrfect-threads#delete-account"');
      expect(html).toContain(language === 'en' ? 'Request account deletion' : 'Solicitar eliminación de cuenta');
      expect(html).toContain('rel="noopener noreferrer"');
      expect(html).not.toContain('data-action="account-delete"');
    }
  }
});
