import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
const base = 'android/app/src/';
const read = (file: string) => readFileSync(base + file, 'utf8');
it('restricts authenticated transport to the user-confirmed host and refuses redirects', () => {
  const source = read('billingFoundation/java/com/rasie/purrfectthreads/BillingBackend.java');
  expect(source).toContain('https://www.auraliax.com/v1/purrfect/billing/');
  expect(source).toContain('setInstanceFollowRedirects(false)');
  expect(source).toContain('X-Firebase-AppCheck');
  expect(source).not.toMatch(/Log\.|printStackTrace|System\.out/);
});
it('keeps authenticated cache outside backups and uses Keystore AES-GCM', () => {
  const source = read('billingFoundation/java/com/rasie/purrfectthreads/BillingCache.java');
  expect(source).toContain('getNoBackupFilesDir');
  expect(source).toContain('AndroidKeyStore');
  expect(source).toContain('AES/GCM/NoPadding');
  expect(source).toContain('finishWrite');
});
it('exports only fixed purchase actions without token, product, account or URL inputs', () => {
  const source = read('billingFoundation/java/com/rasie/purrfectthreads/CrewBillingPlugin.java');
  expect([...source.matchAll(/@PluginMethod\s+public void (\w+)/g)].map(m => m[1]))
    .toEqual(['status', 'refresh', 'purchase', 'restore']);
  expect(source).not.toMatch(/call\.get|purchaseToken|idToken|appCheckToken/);
  expect(read('accountUnavailable/java/com/rasie/purrfectthreads/CrewBillingPlugin.java')).toContain('"unavailable"');
});
