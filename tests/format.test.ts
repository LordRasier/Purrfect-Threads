import { describe, expect, it } from 'vitest';
import { format } from '../src/ui/format';
import { setLanguage } from '../src/ui/localization';

describe('localized quantities', () => {
  it('uses the selected decimal separator without changing economic values', () => {
    setLanguage('es');
    expect(format(1.5)).toBe('1,5');
    expect(format(7500)).toBe('7,5K');
    setLanguage('en');
    expect(format(1.5)).toBe('1.5');
    expect(format(7500)).toBe('7.5K');
  });
});
