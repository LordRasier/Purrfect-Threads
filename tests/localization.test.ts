import { afterEach, describe, expect, it } from 'vitest';
import { ACHIEVEMENTS } from '../src/game/achievements';
import { COATS, PRODUCERS, TALENTS, UPGRADES } from '../src/game/catalog';
import { englishText, text } from '../src/ui/copy';
import { getLanguage, getLocalizedText, setLanguage, translate } from '../src/ui/localization';
afterEach(() => setLanguage('en'));

describe('localization', () => {
  it('translates every non-brand static UI string', () => {
    setLanguage('es');
    const localized = getLocalizedText(englishText);
    const unchanged = Object.entries(englishText).filter(([key, value]) => typeof value === 'string' && !['brand', 'brandFirst', 'brandSecond'].includes(key) && localized[key as keyof typeof localized] === value).map(([key]) => key);
    expect(unchanged).toEqual([]);
    setLanguage('en');
  });
  it('uses English by default and keeps the text API live after changing language', () => {
    expect(getLanguage()).toBe('en');
    expect(text.upgradesTab).toBe('Upgrades');
    setLanguage('es');
    expect(text.upgradesTab).toBe('Mejoras');
    expect(text.criticalOdds(15)).toContain('15%');
    setLanguage('en');
    expect(text.prototype).toBe('PLAYABLE PROTOTYPE · 0.4');
  });

  it('translates every catalog and achievement display source in Spanish', () => {
    setLanguage('es');
    for (const item of [...PRODUCERS, ...UPGRADES, ...TALENTS]) {
      expect(translate(item.name)).not.toBe(item.name);
      expect(translate(item.detail)).not.toBe(item.detail);
    }
    for (const coat of COATS) expect(translate(coat.personality)).not.toBe(coat.personality);
    for (const item of ACHIEVEMENTS) {
      expect(translate(item.name)).not.toBe(item.name);
      expect(translate(item.detail)).not.toBe(item.detail);
      expect(translate(item.category)).not.toBe(item.category);
    }
    expect(translate('Lucky Bell')).toBe('Campana de la suerte');
    expect(translate('5% chance for a triple-yarn touch.')).toContain('5%');
    setLanguage('en');
  });

  it('returns unknown source strings unchanged', () => {
    setLanguage('es');
    expect(translate('A future source string')).toBe('A future source string');
    setLanguage('en');
  });
});

describe('Spanish artifact language', () => {
  it('uses neutral Spanish rather than Rioplatense voseo', () => {
    setLanguage('es');
    expect(translate('Pull the yarn once.')).toBe('Tira de la lana una vez.');
    expect(text.holdHint).toBe('Toca la lana o mantén presionado para seguir tirando');
    expect(text.imported).toContain('bienvenida');
    setLanguage('en');
  });
});



describe('localized copy caching', () => {
  it('caches a fully translated Spanish copy and keeps it correct after switching languages', () => {
    setLanguage('es');
    const first = getLocalizedText(englishText);
    const second = getLocalizedText(englishText);
    expect(second).toBe(first);
    expect(first.statueTitles).toEqual(['Guardiana del hogar', 'Patrón de las patas ayudantes', 'Maestra del hilo dorado']);
    expect(text.patchHint).toBe('Toca un parche para descubrir su historia.');
    expect(text.upgradeHint).toContain('Inspecciona');
    expect(text.criticalOdds(15)).toBe('Probabilidad actual: 15% de lana ×3. Las bonificaciones se suman.');
    setLanguage('en');
    expect(getLocalizedText(englishText)).toBe(englishText);
    expect(text.patchHint).toBe('Tap a patch to discover its story.');
    expect(text.criticalOdds(15)).toBe('Current chance: 15% for ×3 yarn. Bonuses add.');
    setLanguage('es');
    expect(getLocalizedText(englishText)).toBe(first);
    setLanguage('en');
  });
});
