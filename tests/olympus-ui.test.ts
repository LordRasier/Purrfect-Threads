import { afterEach, expect, it } from 'vitest';
import { chapterPanel } from '../src/ui/panels';
import { setLanguage } from '../src/ui/localization';
import { text } from '../src/ui/copy';

afterEach(() => setLanguage('en'));

it('provides twelve real 3D viewports and an accessible icon-only back control', () => {
  const html = chapterPanel();
  expect(html.match(/class="statue-viewport"/g)).toHaveLength(12);
  expect(html).toContain('data-action="talent-info"');
  expect(html).not.toContain('class="talent-statue"');
  expect(html).toContain('aria-label="Back to workshop"');
  expect(html).toMatch(/realm-toolbar[\s\S]*<h2[\s\S]*points-label[\s\S]*data-action="settings"/);
});

it('explains fixed reset rewards without implying that yarn is exchanged for paws', () => {
  expect(text.reward('1')).toBe('+1 golden paw');
  expect(text.remaining('500')).toContain('this chapter');
  setLanguage('es');
  expect(text.reward('1')).toBe('+1 pata dorada');
  expect(text.remaining('500')).toContain('este capítulo');
});

it('accepts formatted Decimal paw balances without native-number overflow', () => {
  expect(text.spendPoints('1')).toBe('1 golden paw');
  expect(text.spendPoints('1e500')).toBe('1e500 golden paws');
  setLanguage('es');
  expect(text.spendPoints('1')).toBe('1 pata dorada');
});
