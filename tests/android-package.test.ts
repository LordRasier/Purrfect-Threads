import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import config from '../capacitor.config';

describe('offline Android package safeguards', () => {
  it('loads bundled assets, never a development server', () => {
    expect(config.webDir).toBe('dist');
    expect(config.server?.url).toBeUndefined();
    expect(config.server?.allowNavigation).toBeUndefined();
    expect(config.android?.allowMixedContent).not.toBe(true);
  });
  it('disables backups, cleartext traffic and unnecessary permissions', () => {
    const manifest = readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8');
    expect(manifest).toContain('android:allowBackup="false"');
    expect(manifest).toContain('android:usesCleartextTraffic="false"');
    expect(manifest).toContain('android:dataExtractionRules="@xml/data_extraction_rules"');
    expect(manifest).not.toContain('<uses-permission');
  });
  it('excludes app-private data from cloud and device transfer', () => {
    const rules = readFileSync('android/app/src/main/res/xml/data_extraction_rules.xml', 'utf8');
    for (const section of ['cloud-backup', 'device-transfer']) {
      const body = rules.split(`<${section}>`)[1]?.split(`</${section}>`)[0];
      expect(body).toBeDefined();
      for (const domain of ['root', 'file', 'database', 'sharedpref', 'external', 'device_root', 'device_file', 'device_database', 'device_sharedpref']) {
        expect(body).toContain(`domain="${domain}" path="."`);
      }
    }
  });
});
