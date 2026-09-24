import { describe, expect, it } from 'vitest';
import Decimal from 'break_infinity.js';
import { createGame, tap, advance, buyProducer, quote, production, population, buyUpgrade } from '../src/game/engine';

describe('yarn economy', () => {
  it('starts empty and rate-limits all manual input to five actions per second', () => {
    const game = createGame(0);
    expect(tap(game, 0).toNumber()).toBe(1);
    expect(tap(game, 100).toNumber()).toBe(0);
    expect(tap(game, 200).toNumber()).toBe(1);
    expect(game.yarn.toNumber()).toBe(2);
    expect(game.lifetime.toNumber()).toBe(2);
  });
  it('spends yarn but preserves lifetime and adds workers exactly once', () => {
    const game = createGame(0);
    for (let i = 0; i < 15; i++) tap(game, i * 200);
    expect(buyProducer(game, 'kitten', 1)).toBe(1);
    expect(game.yarn.toNumber()).toBe(0);
    expect(game.lifetime.toNumber()).toBe(15);
    expect(population(game).toNumber()).toBe(1);
    expect(quote(game, 'kitten', 1).cost.toNumber()).toBe(18);
    expect(buyProducer(game, 'kitten', 1)).toBe(0);
  });
  it('produces the same amount at different frame rates without manual clicks', () => {
    const totals = [30, 60, 144].map(fps => {
      const game = createGame(0);
      game.owned.kitten = 8;
      for (let n = 0; n < fps * 20; n++) advance(game, 1 / fps);
      expect(game.stats.taps).toBe(0);
      return game.yarn.toNumber();
    });
    for (const total of totals) expect(total).toBeCloseTo(160, 6);
  });
  it('bulk purchases match sequential purchases including individual rounding', () => {
    const bulk = createGame(0), single = createGame(0);
    bulk.yarn = single.yarn = new Decimal(10000);
    expect(buyProducer(bulk, 'basket', 10)).toBe(10);
    for (let n = 0; n < 10; n++) buyProducer(single, 'basket', 1);
    expect(bulk.yarn.eq(single.yarn)).toBe(true);
    expect(bulk.owned).toEqual(single.owned);
  });
  it('max buys only affordable units and never leaves a negative balance', () => {
    const game = createGame(0);
    game.yarn = new Decimal(1000);
    const result = quote(game, 'kitten', 'max');
    expect(result.count).toBeGreaterThan(1);
    expect(buyProducer(game, 'kitten', 'max')).toBe(result.count);
    expect(game.yarn.gte(0)).toBe(true);
    expect(quote(game, 'kitten', 1).cost.gt(game.yarn)).toBe(true);
  });
  it('stacks run upgrades, rejects repeat purchases, and handles giant magnitudes', () => {
    const game = createGame(0);
    game.yarn = new Decimal('1e500');
    game.owned.kitten = 2;
    expect(buyUpgrade(game, 'happy')).toBe(true);
    expect(buyUpgrade(game, 'tools')).toBe(true);
    expect(buyUpgrade(game, 'tools')).toBe(false);
    expect(production(game).toNumber()).toBe(6);
    expect(buyUpgrade(game, 'paws')).toBe(true);
    expect(tap(game, 0).toNumber()).toBe(2);
    expect(game.yarn.toString()).not.toContain('Infinity');
  });
});
