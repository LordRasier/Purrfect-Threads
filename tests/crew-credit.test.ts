import { expect, it } from 'vitest';
import Decimal from 'break_infinity.js';
import { applyCrewCredit } from '../src/game/crew-credit';
import { createGame } from '../src/game/engine';
it('adds only native settled bonus at captured production and existing offline efficiency', () => {
  const game = createGame(); game.owned.kitten = 100;
  applyCrewCredit(game, 2, 10, new Decimal(1), 0.5);
  expect(game.yarn.toNumber()).toBe(7);
  expect(game.stats.offlineYarn.toNumber()).toBe(5);
  expect(game.stats.playSeconds).toBe(0);
});
it('rejects malformed credits rather than granting from save data', () => {
  const game = createGame();
  applyCrewCredit(game, Infinity, 10, new Decimal(1), 0.5);
  expect(game.yarn.toNumber()).toBe(0);
});
