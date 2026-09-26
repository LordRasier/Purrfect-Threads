import { describe, expect, it } from 'vitest';
import Decimal from 'break_infinity.js';
import { PRODUCERS, UPGRADES, type UpgradeId } from '../src/game/catalog';
import { buyUpgrade, createGame, producerOutput, upgradeCost } from '../src/game/engine';
import { prestige } from '../src/game/progression';
import { decode, encode } from '../src/game/storage';

describe('small producer upgrades', () => {
  it('offers fifty small upgrades in addition to the existing thirteen nodes', () => {
    expect(UPGRADES).toHaveLength(63);
    expect(new Set(UPGRADES.map(item => item.id)).size).toBe(63);
  });
  it.each(PRODUCERS)('adds five isolated percentage points for $name, not five global multipliers', producer => {
    const game = createGame(); game.yarn = new Decimal('1e30'); game.upgrades = ['hold'];
    game.talents = ['hephaestus'];
    const base = PRODUCERS.map(item => producerOutput(game, item.id));
    let priorCost = 0;
    for (let tier = 1; tier <= 5; tier++) {
      const id = `${producer.id}-practice-${tier}` as UpgradeId;
      const item = UPGRADES.find(item => item.id === id);
      expect(item).toBeDefined();
      expect(item!.cost).toBeGreaterThan(priorCost); priorCost = item!.cost;
      const before = game.yarn;
      expect(buyUpgrade(game, id)).toBe(true);
      expect(game.yarn.eq(before.sub(upgradeCost(game, item!)))).toBe(true);
      expect(buyUpgrade(game, id)).toBe(false);
      PRODUCERS.forEach((target, index) => {
        const ratio = producerOutput(game, target.id).div(base[index]).toNumber();
        expect(ratio).toBeCloseTo(target.id === producer.id ? 1 + tier / 100 : 1, 12);
      });
    }
    game.chapters = 2;
    const item = UPGRADES.find(item => item.id === `${producer.id}-practice-5`)!;
    expect(upgradeCost(game, item).div(item.cost).toNumber()).toBeCloseTo(1.21);
  });
  it('blocks skipped tiers without spending and clears all chapter nodes after prestige', () => {
    const game = createGame(); game.yarn = game.runEarned = game.lifetime = new Decimal('1e25');
    const balance = game.yarn;
    expect(buyUpgrade(game, 'basket-practice-1' as UpgradeId)).toBe(false);
    expect(game.yarn.eq(balance)).toBe(true);
    buyUpgrade(game, 'hold');
    expect(buyUpgrade(game, 'basket-practice-2' as UpgradeId)).toBe(false);
    // Topological purchases exercise every legacy and new branch.
    game.talents = ['knitters', 'hephaestus'];
    for (let pass = 0; pass < 6; pass++) for (const item of UPGRADES) buyUpgrade(game, item.id);
    expect(game.upgrades).toHaveLength(63);
    expect(decode(encode(game)).upgrades).toEqual(game.upgrades);
    expect(prestige(game)).toBe(true);
    const restored = decode(encode(game));
    expect(restored.upgrades).toEqual([]);
    expect(restored.talents).toEqual(['knitters', 'hephaestus']);
    expect(buyUpgrade(restored, 'basket-practice-1' as UpgradeId)).toBe(false);
    restored.yarn = new Decimal(10000);
    expect(buyUpgrade(restored, 'hold')).toBe(true);
    expect(buyUpgrade(restored, 'basket-practice-1' as UpgradeId)).toBe(true);
  });
});
