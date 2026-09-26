import { describe, it, expect } from 'vitest';
import Decimal from 'break_infinity.js';
import { PRODUCERS } from '../src/game/catalog';
import { createGame, tap, buyProducer, buyUpgrade, advance } from '../src/game/engine';
import { prestige, buyTalent, applyOffline, selectCoat } from '../src/game/progression';
import { decode, encode } from '../src/game/storage';
import { text } from '../src/ui/copy';
import { ACHIEVEMENTS, achievementProgress } from '../src/game/achievements';

describe('expanded workshop', () => {
  it('keeps UTF-8 copy and the current release label intact', () => {
    expect(text.chapterLabel(0)).toContain(' · ');
    expect(text.prototype).toBe('PLAYABLE PROTOTYPE · 0.5.0');
  });
  it('requires 75 valid pulls for the first kitten', () => {
    const game = createGame(0);
    for (let i = 0; i < 74; i++) tap(game, i * 200);
    expect(buyProducer(game, 'kitten', 1)).toBe(0);
    tap(game, 14800);
    expect(buyProducer(game, 'kitten', 1)).toBe(1);
    expect(game.yarn.eq(0)).toBe(true);
  });
  it('has ten distinct purchasable crews with growing costs and yields', () => {
    expect(PRODUCERS).toHaveLength(10);
    const game = createGame(); game.yarn = new Decimal('1e18');
    PRODUCERS.forEach((item, index) => {
      expect(buyProducer(game, item.id, 1)).toBe(1);
      if (index) { expect(item.cost).toBeGreaterThan(PRODUCERS[index-1].cost); expect(item.cats).toBeGreaterThan(PRODUCERS[index-1].cats); }
    });
    expect(new Set(PRODUCERS.map(item => item.id)).size).toBe(10);
  });
  it('has at least thirty unique achievements spanning the play loop', () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(30);
    expect(new Set(ACHIEVEMENTS.map(item => item.id)).size).toBe(ACHIEVEMENTS.length);
    for (const category of ['Pulling', 'Production', 'Crew', 'Upgrades', 'Chapters', 'Collection', 'Homecoming']) {
      expect(ACHIEVEMENTS.some(item => item.category === category)).toBe(true);
    }
  });
  it('earns achievements once from commands and retains them across prestige and reload', () => {
    const game = createGame(0);
    tap(game, 0); expect(game.achievements).toContain('first-thread');
    game.yarn = game.runEarned = game.lifetime = new Decimal('1e9');
    buyProducer(game, 'kitten', 10); buyUpgrade(game, 'paws');
    expect(game.stats.bulkPurchases).toBe(1);
    expect(game.stats.upgradePurchases).toBe(1);
    expect(buyUpgrade(game, 'paws')).toBe(false);
    expect(game.stats.upgradePurchases).toBe(1);
    const prior = [...game.achievements];
    expect(prestige(game)).toBe(true);
    expect(game.achievements).toEqual(expect.arrayContaining(prior));
    expect(game.achievements).toContain('fresh-start');
    buyTalent(game, 'welcome');
    expect(game.achievements).toContain('divine-favor');
    const restored = decode(encode(game));
    expect(restored.achievements).toEqual(game.achievements);
    expect(new Set(restored.achievements).size).toBe(restored.achievements.length);
  });
  it('counts offline yarn once and unlocks collection and max-buy milestones', () => {
    const game = createGame(0); game.owned.kitten = 10; game.collection = [0, 1];
    selectCoat(game, 1); expect(game.achievements).toContain('new-look');
    applyOffline(game, 200000);
    expect(game.stats.offlineYarn.eq(1000)).toBe(true);
    applyOffline(game, 200000); expect(game.stats.offlineYarn.eq(1000)).toBe(true);
    expect(game.achievements).toContain('while-you-napped');
    buyProducer(game, 'kitten', 'max'); expect(game.stats.maxPurchases).toBe(1);
    advance(game, 3600); expect(game.achievements).toContain('cozy-hour');
    for (const item of ACHIEVEMENTS) {
      const progress = achievementProgress(game, item);
      expect(progress.ratio).toBeGreaterThanOrEqual(0); expect(progress.ratio).toBeLessThanOrEqual(1);
    }
  });
  it('migrates v1 without changing owned teams, balances, talents or settings', () => {
    const game = createGame(100); game.owned.kitten = 10; game.collection = [0,1];
    game.yarn = game.runEarned = game.lifetime = new Decimal(10000);
    const legacy = JSON.parse(encode(game)); legacy.version = 1;
    for (const key of ['tailor','dyer','spinner','weaver','astral']) delete legacy.owned[key];
    delete legacy.achievements; legacy.stats = { taps: 75, playSeconds: 22 };
    const restored = decode(JSON.stringify(legacy));
    expect(restored.version).toBe(5); expect(restored.owned.kitten).toBe(10); expect(restored.owned.astral).toBe(0);
    expect(restored.yarn.eq(10000)).toBe(true); expect(restored.settings).toEqual(game.settings);
    expect(restored.achievements).toContain('first-thread');
    expect(restored.stats.upgradePurchases).toBe(0);
  });
  it('rejects malformed v2 statistics and achievements', () => {
    const data = JSON.parse(encode(createGame()));
    expect(() => decode(JSON.stringify({...data, achievements:['not-real']}))).toThrow();
    expect(() => decode(JSON.stringify({...data, stats:{...data.stats, bulkPurchases:-1}}))).toThrow();
    expect(() => decode(JSON.stringify({...data, owned:{...data.owned, astral:undefined}}))).toThrow();
  });
});
