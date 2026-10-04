import { expect, it } from 'vitest';
import { privacyContent } from '../src/ui/privacy';
import { readFileSync } from 'node:fs';

it('discloses optional accounts, manual requests and retained anti-replay records for closed testing', () => {
  for (const language of ['en', 'es'] as const) {
    const policy = privacyContent(language);
    for (const value of ['Firebase Authentication', 'App Check', 'Play Integrity', 'UID', 'Google Play', 'rasier_k@hotmail.com', '90', '#delete-account']) expect(policy).toContain(value);
    expect(policy).not.toMatch(/only in internal|solo en versiones internas|no Purrfect Threads account to close/);
  }
  expect(privacyContent('en')).toContain('indefinitely');
  expect(privacyContent('en')).toContain('token hashes');
  expect(privacyContent('es')).toContain('indefinidamente');
  expect(privacyContent('es')).toContain('huellas de tokens');
});
it('prepares a new version without reusing the already uploaded code', () => {
  expect(JSON.parse(readFileSync('package.json', 'utf8')).version).toBe('0.6.1');
  const gradle = readFileSync('android/app/build.gradle', 'utf8');
  expect(gradle).toContain('versionCode 3');
  expect(gradle).toContain('versionName "0.6.1"');
});
