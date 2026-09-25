import { afterEach, expect, it } from 'vitest';
import { createGame } from '../src/game/engine';
import { collectionPanel } from '../src/ui/panels';
import { setLanguage } from '../src/ui/localization';

afterEach(() => setLanguage('en'));
it('shows six named pet illustrations, their buffs, challenges and an empty active slot', () => {
  const html = collectionPanel(createGame());
  for (const id of ['kira','mario','roman','luigi','lola','biscocho']) {
    expect(html).toContain(`art/companions/${id}.webp`);
    expect(html).toContain(`id="companion-${id}"`);
  }
  expect(html).toContain('Only your selected companion provides a bonus.');
  expect(html).toContain('The cushion is waiting for your first companion.');
  expect(html).toContain('Reach 250 cats and 1,000 lifetime taps.');
  expect(html).toContain('All passive production +10%.');
  expect(html.match(/data-companion-progress/g)).toHaveLength(6);
  expect(html).not.toContain('Biscuit');
});
it('marks exactly one unlocked selected cat active and keeps other bonuses inactive', () => {
  const game = createGame(); game.collection = [0,1]; game.coat = 1;
  const html = collectionPanel(game);
  expect(html).toContain('id="companion-mario"');
  expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
  expect(html).toContain('Choose companion · Kira');
  expect(html).toContain('Your companion · Mario');
});
it('localizes companion explanations but preserves the real cats names', () => {
  setLanguage('es'); const html = collectionPanel(createGame());
  expect(html).toContain('Solo el acompañante seleccionado aporta una bonificación.');
  expect(html).toContain('Kira'); expect(html).toContain('Biscocho');
  expect(html).not.toContain('All passive production');
});
