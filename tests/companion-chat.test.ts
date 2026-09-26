import { describe, expect, it } from 'vitest';
import { COMPANION_LINES } from '../src/ui/companion-lines';
import { CompanionChat } from '../src/ui/companion-chat';

describe('companion chat content', () => {
  it('ships 100 unique authored bilingual lines for every companion', () => {
    expect(Object.keys(COMPANION_LINES).sort()).toEqual(['biscocho', 'kira', 'lola', 'luigi', 'mario', 'roman']);
    for (const [id, lines] of Object.entries(COMPANION_LINES)) {
      expect(lines).toHaveLength(100);
      expect(new Set(lines.map(line => line.en)).size, id).toBe(100);
      expect(new Set(lines.map(line => line.es)).size, id).toBe(100);
      expect(new Set(lines.map(line => line.en.split(',', 1)[0])).size, id).toBe(100);
      for (const line of lines) {
        expect(line.en.trim()).not.toBe('');
        expect(line.es.trim()).not.toBe('');
        expect(line.es).not.toBe(line.en);
      }
    }
  });

  it('does not ship numbered or third-person placeholder dialogue', () => {
    const placeholder = /\b(?:thought about|dream number|tangle number|has an observation about)\b|\d/i;

    for (const lines of Object.values(COMPANION_LINES)) {
      for (const line of lines) {
        expect(line.en).not.toMatch(placeholder);
        expect(line.es).not.toMatch(placeholder);
      }
    }
  });
});

describe('CompanionChat timer', () => {
  it('only starts eligible conversation after a random 45–90 second interval', () => {
    const chat = new CompanionChat(null, () => 0);
    chat.update(0, 'kira', 'en', true); chat.update(44.99, 'kira', 'en', true); expect(chat.currentLine).toBeNull();
    chat.update(0.01, 'kira', 'en', true); expect(chat.currentLine?.id).toBe('kira');
  });
  it('resets when the companion, language, or eligibility changes', () => {
    const chat = new CompanionChat(null, () => 0); chat.update(0, 'kira', 'en', true); chat.update(45, 'kira', 'en', true); expect(chat.currentLine).not.toBeNull();
    chat.update(1, 'mario', 'en', true); expect(chat.currentLine).toBeNull();
    chat.update(0, 'mario', 'es', true); chat.update(45, 'mario', 'es', true); expect(chat.currentLine?.text).toBe(COMPANION_LINES.mario[0].es);
    chat.update(1, 'mario', 'es', false); expect(chat.currentLine).toBeNull();
  });
  it('does not repeat any of the prior five lines for the same companion', () => {
    const chat = new CompanionChat(null, () => 0); const shown: string[] = [];
    chat.update(0, 'lola', 'en', true); for (let index = 0; index < 7; index++) { chat.update(90, 'lola', 'en', true); shown.push(chat.currentLine!.text); }
    for (let index = 1; index < shown.length; index++) expect(shown.slice(Math.max(0, index - 5), index)).not.toContain(shown[index]);
  });
});




describe('CompanionChat eligibility and long-run selection', () => {
  it('pauses eligible time while hidden and resumes the remaining interval', () => {
    const chat = new CompanionChat(null, () => 0);
    chat.update(0, 'roman', 'en', true);
    chat.update(44, 'roman', 'en', true);
    chat.update(600, 'roman', 'en', false);
    expect(chat.currentLine).toBeNull();
    chat.update(1, 'roman', 'en', true);
    expect(chat.currentLine?.id).toBe('roman');
  });

  it('avoids every prior-five line across more than one hundred emissions', () => {
    const chat = new CompanionChat(null, () => 0);
    const shown: string[] = [];
    chat.update(0, 'biscocho', 'es', true);
    for (let index = 0; index < 130; index++) {
      chat.update(90, 'biscocho', 'es', true);
      shown.push(chat.currentLine!.text);
    }
    for (let index = 1; index < shown.length; index++) {
      expect(shown.slice(Math.max(0, index - 5), index)).not.toContain(shown[index]);
    }
  });
});
