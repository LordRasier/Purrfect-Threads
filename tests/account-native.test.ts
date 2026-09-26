import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
const read = (path: string) => readFileSync(path, 'utf8');
const native = 'android/app/src/';
it('selects a Firebase-free stub in default builds and registers the same narrow plugin', () => {
  const stub = read(native + 'accountUnavailable/java/com/rasie/purrfectthreads/GoogleAccountPlugin.java');
  expect(stub).toContain('"unavailable"'); expect(stub).not.toMatch(/import .*firebase/i);
  expect(read('android/app/build.gradle')).toContain("sourceSets.main.java.srcDir 'src/accountUnavailable/java'");
  expect(read(native + 'main/java/com/rasie/purrfectthreads/MainActivity.java')).toContain('registerPlugin(GoogleAccountPlugin.class)');
});
it('exports only explicit account operations and fixed status fields, not credentials or URLs', () => {
  const plugin = read(native + 'billingFoundation/java/com/rasie/purrfectthreads/GoogleAccountPlugin.java');
  expect([...plugin.matchAll(/@PluginMethod\s+public void (\w+)/g)].map(match => match[1])).toEqual(['status', 'connect', 'disconnect']);
  expect([...plugin.matchAll(/\.put\("(\w+)"/g)].map(match => match[1])).toEqual(['status', 'outcome']);
  expect(plugin).toContain('handleOnDestroy'); expect(plugin).toContain('cancelPending');
  expect(plugin).not.toMatch(/withTokens|signInAnonymously|call\.getString|call\.getData|BillingClient/);
});
