import { describe, expect, it } from 'vitest';
import Decimal from 'break_infinity.js';
import { COATS } from '../src/game/catalog';
import { activeCompanion, advance, buyProducer, buyUpgrade, companionProgress, createGame, criticalChance, producerOutput, quote, tap, tapValue } from '../src/game/engine';
import { applyOffline, prestige, prestigeGoal, selectCoat } from '../src/game/progression';
import { decode, encode } from '../src/game/storage';

describe('home companions', () => {
  it('keeps the six legacy indexes while exposing the named companion catalog', () => {
    expect(COATS.map(cat => cat.id)).toEqual(['kira', 'mario', 'roman', 'luigi', 'lola', 'biscocho']);
    expect(COATS.map(cat => cat.name)).toEqual(['Kira', 'Mario', 'Roman', 'Luigi', 'Lola', 'Biscocho']);
    expect(COATS.map(cat => cat.personality)).toEqual([
      'The grumpy boss. Always has a complaint.',
      'All cuddles, not a single clever thought.',
      'A sleepy, chubby sweetheart.',
      'Fluffy, feisty, and always pestering someone.',
      'Tiny paws. The sweetest heart.',
      'A lovable klutz. Trouble follows every step.',
    ]);
  });

  it('unlocks every challenge exactly at its boundary and never relocks earned companions', () => {
    const kira = createGame(0); kira.owned.workshop = 1; kira.stats.taps = 999;
    advance(kira, 1); expect(kira.collection).toEqual([]);
    kira.stats.taps = 1000; advance(kira, 1); expect(kira.collection).toContain(0);

    const mario = createGame(0); mario.stats.upgradePurchases = 11; advance(mario, 1); expect(mario.collection).toEqual([]);
    mario.stats.upgradePurchases = 12; advance(mario, 1); expect(mario.collection).toContain(1);

    const roman = createGame(0); roman.stats.offlineYarn = new Decimal(99999); advance(roman, 1); expect(roman.collection).toEqual([]);
    roman.stats.offlineYarn = new Decimal(100000); advance(roman, 1); expect(roman.collection).toContain(2);

    const luigi = createGame(0); luigi.chapters = 2; advance(luigi, 1); expect(luigi.collection).toEqual([]);
    luigi.chapters = 3; advance(luigi, 1); expect(luigi.collection).toContain(3);

    const lola = createGame(0); lola.owned.factory = 2; lola.owned.workshop = 3; advance(lola, 1); expect(lola.collection).toEqual([]);
    lola.owned.factory = 2; lola.owned.workshop = 4; advance(lola, 1); expect(lola.collection).toContain(4);

    const biscocho = createGame(0); biscocho.chapters = 5; biscocho.stats.taps = 4999; advance(biscocho, 1); expect(biscocho.collection).not.toContain(5);
    biscocho.stats.taps = 5000; advance(biscocho, 1); expect(biscocho.collection).toContain(5);
    biscocho.chapters = 0; biscocho.stats.taps = 0; advance(biscocho, 1); expect(biscocho.collection).toContain(5);
  });

  it('has no active companion until the selected index is unlocked and rejects locked selection', () => {
    const game = createGame(0);
    expect(activeCompanion(game)).toBeUndefined();
    advance(game, 1); expect(game.coat).toBe(0);
    expect(selectCoat(game, 5)).toBe(false);
    game.collection = [1]; game.coat = 0;
    advance(game, 1);
    expect(game.coat).toBe(1);
    expect(activeCompanion(game)?.id).toBe('mario');
  });

  it('applies each selected buff once and only to its intended output', () => {
    const game = createGame(0); game.collection = [0, 1, 2, 3, 4, 5]; game.coat = 0; game.owned.kitten = 1;
    expect(producerOutput(game, 'kitten').toNumber()).toBe(1.1);
    game.coat = 1; expect(tapValue(game).toNumber()).toBe(1.25);
    game.coat = 3; expect(producerOutput(game, 'kitten').toNumber()).toBe(1.3); expect(producerOutput(game, 'workshop').toNumber()).toBe(300);
    game.coat = 5; expect(criticalChance(game)).toBe(0.05);
    game.upgrades = ['bell', 'clover', 'whiskers']; expect(criticalChance(game)).toBe(0.25);
    game.coat = 0; expect(producerOutput(game, 'kitten').toNumber()).toBe(1.1);
  });

  it('applies Roman only to offline income and ignores a locked selected index', () => {
    const roman = createGame(0); roman.collection = [2]; roman.coat = 2; roman.owned.kitten = 10;
    expect(applyOffline(roman, 1000).toNumber()).toBe(6.5);
    const locked = createGame(0); locked.coat = 2; locked.owned.kitten = 10;
    expect(applyOffline(locked, 1000).toNumber()).toBe(5);
  });

  it('discounts each crew price before rounding and matches sequential, x10, and max buying', () => {
    const single = createGame(0), bulk = createGame(0), max = createGame(0);
    for (const game of [single, bulk, max]) { game.collection = [4]; game.coat = 4; game.yarn = new Decimal(100000); }
    expect(quote(single, 'kitten', 1).cost.toNumber()).toBe(72);
    expect(buyProducer(bulk, 'kitten', 10)).toBe(10);
    for (let i = 0; i < 10; i++) buyProducer(single, 'kitten', 1);
    expect(bulk.yarn.eq(single.yarn)).toBe(true);
    const maxCount = buyProducer(max, 'kitten', 'max');
    let sequential = createGame(0); sequential.collection = [4]; sequential.coat = 4; sequential.yarn = new Decimal(100000);
    for (let i = 0; i < maxCount; i++) expect(buyProducer(sequential, 'kitten', 1)).toBe(1);
    expect(max.yarn.eq(sequential.yarn)).toBe(true);
    expect(max.yarn.gte(0)).toBe(true);
  });

  it('keeps earned collection and selected companion through saves and chapter resets', () => {
    const game = createGame(0); game.collection = [3]; game.coat = 3; game.runEarned = game.lifetime = prestigeGoal(game);
    expect(prestige(game)).toBe(true);
    expect(game.collection).toContain(3); expect(game.coat).toBe(3);
    const restored = decode(encode(game));
    expect(restored.collection).toContain(3); expect(restored.coat).toBe(3);
  });

  it('reports a bounded progress ratio for companion UI', () => {
    const game = createGame(0); game.owned.workshop = 1; game.stats.taps = 500;
    const progress = companionProgress(game, 0);
    expect(progress.ratio).toBe(0.5);
    expect(progress.requirements).toHaveLength(2);
  });
});


describe('companion edge cases', () => {
  it('requires both Kira and Biscocho conditions, and accepted taps unlock Kira through real input', () => {
    const kira = createGame(0); kira.owned.workshop = 1;
    for (let index = 0; index < 999; index++) tap(kira, index * 200);
    expect(kira.collection).not.toContain(0);
    tap(kira, 999 * 200);
    expect(kira.collection).toContain(0);

    const biscocho = createGame(0); biscocho.chapters = 4; biscocho.stats.taps = 5000;
    advance(biscocho, 1); expect(biscocho.collection).not.toContain(5);
    biscocho.chapters = 5; biscocho.stats.taps = 4999;
    advance(biscocho, 1); expect(biscocho.collection).not.toContain(5);
    biscocho.stats.taps = 5000;
    advance(biscocho, 1); expect(biscocho.collection).toContain(5);
  });

  it('uses exact below-boundaries for every one-condition companion unlock', () => {
    const mario = createGame(0); mario.stats.upgradePurchases = 11; advance(mario, 1); expect(mario.collection).not.toContain(1);
    mario.stats.upgradePurchases = 12; advance(mario, 1); expect(mario.collection).toContain(1);

    const roman = createGame(0); roman.stats.offlineYarn = new Decimal(99999); advance(roman, 1); expect(roman.collection).not.toContain(2);
    roman.stats.offlineYarn = new Decimal(100000); advance(roman, 1); expect(roman.collection).toContain(2);

    const luigi = createGame(0); luigi.chapters = 2; advance(luigi, 1); expect(luigi.collection).not.toContain(3);
    luigi.chapters = 3; advance(luigi, 1); expect(luigi.collection).toContain(3);

    const lola = createGame(0); lola.owned.factory = 2; lola.owned.workshop = 3; lola.owned.corner = 1; lola.owned.kitten = 49;
    advance(lola, 1); expect(lola.collection).not.toContain(4);
    lola.owned.kitten = 50; advance(lola, 1); expect(lola.collection).toContain(4);
  });

  it('keeps a permanent unlock when its current-run population disappears on prestige', () => {
    const game = createGame(0); game.owned.workshop = 1; game.stats.taps = 1000;
    advance(game, 1); expect(game.collection).toContain(0);
    game.runEarned = game.lifetime = prestigeGoal(game);
    expect(prestige(game)).toBe(true);
    expect(game.owned.workshop).toBe(0);
    expect(game.collection).toContain(0);
  });

  it('does not retroactively increase the offline absence that unlocks Roman', () => {
    const game = createGame(0); game.owned.kitten = 1; game.stats.offlineYarn = new Decimal(99999);
    const earned = applyOffline(game, 8 * 3600 * 1000);
    expect(earned.toNumber()).toBe(14400);
    expect(game.collection).toContain(2);
    expect(game.coat).toBe(2);
  });

  it('keeps Lola x1, x10, and max arithmetic equivalent at large owned counts and the next-price boundary', () => {
    const boundary = createGame(0); boundary.collection = [4]; boundary.coat = 4; boundary.owned.kitten = 255;
    boundary.yarn = quote(boundary, 'kitten', 1).cost;
    expect(buyProducer(boundary, 'kitten', 'max')).toBe(1);
    expect(boundary.yarn.eq(0)).toBe(true);

    const bulk = createGame(0), single = createGame(0), max = createGame(0), sequential = createGame(0);
    for (const game of [bulk, single, max, sequential]) {
      game.collection = [4]; game.coat = 4; game.owned.kitten = 300; game.yarn = new Decimal('1e25');
    }
    expect(buyProducer(bulk, 'kitten', 10)).toBe(10);
    for (let index = 0; index < 10; index++) expect(buyProducer(single, 'kitten', 1)).toBe(1);
    expect(bulk.yarn.eq(single.yarn)).toBe(true);
    const maxCount = buyProducer(max, 'kitten', 'max');
    for (let index = 0; index < maxCount; index++) expect(buyProducer(sequential, 'kitten', 1)).toBe(1);
    expect(max.yarn.eq(sequential.yarn)).toBe(true);
  });

  it('preserves selected buffs across save/load without stacking them', () => {
    const game = createGame(0); game.collection = [0, 2]; game.coat = 0; game.owned.kitten = 1;
    const firstLoad = decode(encode(game));
    const secondLoad = decode(encode(firstLoad));
    expect(producerOutput(firstLoad, 'kitten').toNumber()).toBe(1.1);
    expect(producerOutput(secondLoad, 'kitten').toNumber()).toBe(1.1);
    expect(secondLoad.coat).toBe(0);
    secondLoad.coat = 2; secondLoad.savedAt = 0;
    expect(applyOffline(secondLoad, 1000).toNumber()).toBe(0.65);
  });
});

describe('Lola mid-transaction selection', () => {
  function oneCatShortOfLola() {
    const game = createGame(0);
    game.owned.factory = 2;
    game.owned.workshop = 3;
    game.owned.corner = 1;
    game.owned.kitten = 49;
    game.yarn = new Decimal('1e7');
    return game;
  }

  it('forecasts the automatic Lola selection during x10 and max purchases exactly like separate purchases', () => {
    const bulk = oneCatShortOfLola();
    const single = oneCatShortOfLola();
    expect(buyProducer(bulk, 'kitten', 10)).toBe(10);
    for (let index = 0; index < 10; index++) expect(buyProducer(single, 'kitten', 1)).toBe(1);
    expect(bulk.yarn.eq(single.yarn)).toBe(true);
    expect(bulk.collection).toContain(4);
    expect(bulk.coat).toBe(4);

    const max = oneCatShortOfLola();
    const sequential = oneCatShortOfLola();
    const count = buyProducer(max, 'kitten', 'max');
    for (let index = 0; index < count; index++) expect(buyProducer(sequential, 'kitten', 1)).toBe(1);
    expect(max.yarn.eq(sequential.yarn)).toBe(true);
    expect(max.collection).toContain(4);
    expect(max.coat).toBe(4);
  });
});
