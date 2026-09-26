import { afterEach, expect, it, vi } from 'vitest';
import { setLanguage } from '../src/ui/localization';
import { shopPanel } from '../src/ui/shop';

afterEach(() => { setLanguage('en'); vi.unstubAllEnvs(); });

it('loads contractor art relative to the packaged base and keeps its native aspect ratio', () => {
  vi.stubEnv('BASE_URL', '/nested/');
  const panel = shopPanel();
  expect(panel).toContain('src="/nested/art/meowtastic-contractors.png"');
  expect(panel).toContain('width="1536" height="1024"');
});

it('introduces the contractors with localized flavor copy', () => {
  expect(shopPanel()).toContain('When efficiency calls');
  setLanguage('es');
  expect(shopPanel()).toContain('Cuando hace falta eficiencia');
});
