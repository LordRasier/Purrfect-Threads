import { expect, it } from 'vitest';
import Decimal from 'break_infinity.js';
import { CrewCreditDelivery, applyCrewCredit } from '../src/game/crew-credit';
import { createGame } from '../src/game/engine';
import { applyOffline } from '../src/game/progression';
it('defers hidden paid delivery until baseline offline earnings are settled', () => {
  let hidden = true;
  const game = createGame(0); game.owned.kitten = 1;
  const delivery = new CrewCreditDelivery(() => hidden);
  delivery.deliver(() => { applyCrewCredit(game, 0, 60, new Decimal(1), 0.5); game.savedAt = 60000; });
  expect(game.savedAt).toBe(0);
  expect(game.yarn.toNumber()).toBe(0);
  hidden = false;
  applyOffline(game, 120000); delivery.flush();
  expect(game.yarn.toNumber()).toBe(90);
  delivery.flush(); expect(game.yarn.toNumber()).toBe(90);
});
