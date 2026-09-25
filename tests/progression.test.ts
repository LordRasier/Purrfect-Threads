import { describe, expect, it } from 'vitest';
import Decimal from 'break_infinity.js';
import { createGame, advance, buyProducer, buyUpgrade, population, production, tapValue } from '../src/game/engine';
import { prestigeReward, prestige, buyTalent, selectCoat, applyOffline } from '../src/game/progression';

describe('chapters, talents and collection', () => {
  it('requires a reward before resetting and never reclaims old rewards', () => {
    const game = createGame(0);
    expect(prestige(game)).toBe(false);
    game.lifetime = new Decimal(100000);
    expect(prestigeReward(game).toNumber()).toBe(1);
    expect(prestige(game)).toBe(true);
    expect(game.points.toNumber()).toBe(1);
    expect(prestigeReward(game).toNumber()).toBe(0);
    expect(prestige(game)).toBe(false);
  });
  it('keeps talents, collection and stats; resets prices, currency and run upgrades', () => {
    const game = createGame(123);
    game.lifetime = new Decimal(400000);
    game.yarn = new Decimal(50000);
    buyProducer(game, 'basket', 10);
    buyUpgrade(game, 'paws');
    game.stats.taps = 55;
    game.settings.volume = 0.2;
    const coats = [...game.collection];
    prestige(game);
    expect(buyTalent(game, 'welcome')).toBe(true);
    expect(buyTalent(game, 'welcome')).toBe(false);
    game.lifetime = new Decimal(900000);
    prestige(game);
    expect(game.starterCats).toBe(3);
    expect(game.owned.basket).toBe(0);
    expect(game.upgrades).toEqual([]);
    expect(game.yarn.toNumber()).toBe(0);
    expect(game.collection).toEqual(coats);
    expect(game.stats.taps).toBe(55);
    expect(game.settings.volume).toBe(0.2);
    expect(game.claimed.toNumber()).toBe(3);
  });
  it('applies Helping Paw and gates Master Tools behind its permanent talent', () => {
    const game = createGame(0);
    game.points = new Decimal(6);
    game.yarn = new Decimal(1e6);
    game.owned.workshop = 1;
    expect(buyUpgrade(game, 'master')).toBe(false);
    buyTalent(game, 'helping');
    expect(tapValue(game).toNumber()).toBe(4);
    buyTalent(game, 'knitters');
    expect(buyUpgrade(game, 'master')).toBe(true);
    expect(production(game).toNumber()).toBe(600);
    expect(selectCoat(game, 5)).toBe(false);
  });
  it('progresses through three chapters by accelerated production without rewarding twice', () => {
    const game = createGame(0);
    game.yarn = new Decimal(75);
    buyProducer(game, 'kitten', 1);
    for (let chapter = 0; chapter < 3; chapter++) {
      if (!population(game).gt(0)) game.owned.kitten = 1;
      while (prestigeReward(game).lt(1)) {
        advance(game, 60);
        buyProducer(game, 'kitten', 'max');
      }
      expect(prestige(game)).toBe(true);
      if (chapter === 0) buyTalent(game, 'welcome');
      expect(prestigeReward(game).toNumber()).toBe(0);
    }
    expect(game.chapters).toBe(3);
    expect(game.lifetime.gte(900000)).toBe(true);
  });
});

describe('offline progress', () => {
  it('earns half production, caps at eight hours, and applies exactly once', () => {
    const game = createGame(1000);
    game.owned.kitten = 10;
    expect(applyOffline(game, 1000 + 12 * 3600000).toNumber()).toBe(144000);
    expect(applyOffline(game, 1000 + 12 * 3600000).toNumber()).toBe(0);
    expect(game.lifetime.toNumber()).toBe(144000);
  });
  it('does not reward a backward clock or re-open an already credited time window', () => {
    const game = createGame(10000);
    game.owned.kitten = 2;
    applyOffline(game, 1000);
    expect(game.savedAt).toBe(10000);
    expect(applyOffline(game, 11000).toNumber()).toBe(1);
  });
});
