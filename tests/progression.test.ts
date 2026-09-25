import { describe, expect, it } from 'vitest';
import Decimal from 'break_infinity.js';
import { TALENTS, PRODUCERS } from '../src/game/catalog';
import { createGame, advance, buyProducer, buyUpgrade, population, producerOutput, production, tapValue } from '../src/game/engine';
import { prestigeGoal, prestigeReward, prestige, buyTalent, selectCoat, applyOffline } from '../src/game/progression';

describe('chapters, talents and collection', () => {
  it('pays one golden paw only after the current run reaches its chapter goal', () => {
    const game = createGame(0);
    expect(prestigeGoal(game).eq(100000)).toBe(true);
    game.yarn = game.lifetime = new Decimal('1e50');
    expect(prestigeReward(game).toNumber()).toBe(0);
    game.runEarned = new Decimal(100000);
    expect(prestigeReward(game).toNumber()).toBe(1);
    expect(prestige(game)).toBe(true);
    expect(game.points.toNumber()).toBe(1);
    expect(game.runEarned.toNumber()).toBe(0);
    expect(prestigeGoal(game).eq(200000)).toBe(true);
    expect(prestigeReward(game).toNumber()).toBe(0);
    expect(prestige(game)).toBe(false);
  });
  it('keeps talents, collection and stats; resets prices, currency and run upgrades', () => {
    const game = createGame(123);
    game.runEarned = game.lifetime = new Decimal(100000);
    game.yarn = new Decimal(50000);
    buyProducer(game, 'basket', 10);
    buyUpgrade(game, 'paws');
    game.stats.taps = 55;
    game.settings.volume = 0.2;
    const coats = [...game.collection];
    expect(prestige(game)).toBe(true);
    expect(buyTalent(game, 'welcome')).toBe(true);
    expect(buyTalent(game, 'welcome')).toBe(false);
    game.runEarned = new Decimal(200000);
    game.lifetime = game.lifetime.add(200000);
    expect(prestige(game)).toBe(true);
    expect(game.starterCats).toBe(3);
    expect(game.owned.basket).toBe(0);
    expect(game.upgrades).toEqual([]);
    expect(game.yarn.toNumber()).toBe(0);
    expect(game.collection).toEqual(coats);
    expect(game.stats.taps).toBe(55);
    expect(game.settings.volume).toBe(0.2);
    expect(game.claimed.toNumber()).toBe(2);
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
  it('progresses through three accelerated runs without rewarding a reset twice', () => {
    const game = createGame(0);
    for (let chapter = 0; chapter < 3; chapter++) {
      game.owned.kitten = 10000;
      advance(game, prestigeGoal(game).div(10000).toNumber());
      expect(prestige(game)).toBe(true);
      expect(prestigeReward(game).toNumber()).toBe(0);
    }
    expect(game.chapters).toBe(3);
    expect(game.points.toNumber()).toBe(3);
  });

  it.each([
    ['poseidon', ['kitten', 'basket']], ['demeter', ['corner', 'workshop']], ['apollo', ['factory', 'tailor']],
    ['artemis', ['dyer', 'spinner']], ['ares', ['weaver', 'astral']],
  ] as const)('applies %s only to its intended producer pair', (id, affected) => {
    const game = createGame(0); game.points = new Decimal(10);
    expect(buyTalent(game, id)).toBe(true);
    for (const producer of PRODUCERS) {
      const expected = new Decimal(producer.cats).mul((affected as readonly string[]).includes(producer.id) ? 1.2 : 1);
      expect(producerOutput(game, producer.id).eq(expected)).toBe(true);
    }
  });
  it('applies Hephaestus linearly per chapter upgrade and loses its boost when upgrades reset', () => {
    const game = createGame(0); game.points = new Decimal(10); game.owned.kitten = 1;
    game.upgrades = ['happy', 'tools'];
    const withoutTalent = production(game);
    expect(buyTalent(game, 'hephaestus')).toBe(true);
    expect(production(game).eq(withoutTalent.mul(1.2))).toBe(true);
    game.runEarned = game.lifetime = prestigeGoal(game);
    expect(prestige(game)).toBe(true);
    expect(game.upgrades).toEqual([]);
    expect(production(game).eq(0)).toBe(true);
  });
  it('multiplies the whole Helping Paw touch value with Zeus and Dionysus', () => {
    const game = createGame(0); game.points = new Decimal(10); game.owned.workshop = 1;
    expect(buyTalent(game, 'helping')).toBe(true);
    expect(buyTalent(game, 'zeus')).toBe(true);
    expect(buyTalent(game, 'dionysus')).toBe(true);
    expect(tapValue(game).eq(5.28)).toBe(true);
  });
  it('does not unlock the full pantheon with only three talents, but unlocks it at twelve', () => {
    const game = createGame(0); game.points = new Decimal(100);
    for (const talent of TALENTS.slice(0, 3)) expect(buyTalent(game, talent.id)).toBe(true);
    expect(game.achievements).not.toContain('pantheon');
    for (const talent of TALENTS.slice(3)) expect(buyTalent(game, talent.id)).toBe(true);
    expect(game.achievements).toContain('pantheon');
  });
  it('has twelve uniquely indexed Greek cat gods whose new boons are once-only and effective', () => {
    expect(TALENTS).toHaveLength(12);
    expect(TALENTS.map(talent => talent.statue)).toEqual([...Array(12).keys()]);
    expect(TALENTS.map(talent => talent.god)).toEqual(['Hera', 'Hermes', 'Athena', 'Zeus', 'Poseidon', 'Demeter', 'Apollo', 'Artemis', 'Ares', 'Aphrodite', 'Hephaestus', 'Dionysus']);
    for (const talent of TALENTS.slice(3)) {
      const game = createGame(0); game.points = new Decimal(20); game.owned.kitten = game.owned.basket = game.owned.corner = game.owned.workshop = game.owned.factory = game.owned.tailor = game.owned.dyer = game.owned.spinner = game.owned.weaver = game.owned.astral = 1;
      if (talent.id === 'hephaestus') game.upgrades = ['happy'];
      const beforeProduction = production(game); const beforeTap = tapValue(game);
      expect(buyTalent(game, talent.id)).toBe(true);
      expect(buyTalent(game, talent.id)).toBe(false);
      expect(production(game).eq(beforeProduction) && tapValue(game).eq(beforeTap)).toBe(false);
    }
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
