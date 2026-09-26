import { describe, expect, it } from 'vitest';
import Decimal from 'break_infinity.js';
import { UPGRADES, UPGRADE_PARENT, type UpgradeId } from '../src/game/catalog';
import { buyUpgrade, createGame, production, upgradeCost } from '../src/game/engine';
import { decode, encode } from '../src/game/storage';
import { prestige } from '../src/game/progression';
import { HoldInput } from '../src/game/input';
import { NOTE_SIZE, TREE_PINS, TREE_SIZE } from '../src/ui/upgrade-tree';

describe('chapter upgrade tree', () => {
  it('positions every note inside the canvas without overlap', () => {
    expect(Object.keys(TREE_PINS).sort()).toEqual(UPGRADES.map(item => item.id).sort());
    const pins = Object.values(TREE_PINS);
    for (const [index, [x, y]] of pins.entries()) {
      expect(x - NOTE_SIZE / 2).toBeGreaterThanOrEqual(8);
      expect(x + NOTE_SIZE / 2).toBeLessThanOrEqual(TREE_SIZE.width - 8);
      expect(y).toBeGreaterThanOrEqual(8);
      expect(y + NOTE_SIZE).toBeLessThanOrEqual(TREE_SIZE.height - 8);
      for (const [otherX, otherY] of pins.slice(index + 1)) {
        expect(Math.abs(x - otherX) >= NOTE_SIZE + 6 || Math.abs(y - otherY) >= NOTE_SIZE + 6).toBe(true);
      }
    }
  });
  it('connects every node to the only root without cycles', () => {
    expect(Object.keys(UPGRADE_PARENT).sort()).toEqual(UPGRADES.map(item => item.id).sort());
    expect(UPGRADES.filter(item => UPGRADE_PARENT[item.id] === null).map(item => item.id)).toEqual(['hold']);
    for (const item of UPGRADES) {
      const visited = new Set<UpgradeId>(); let current: UpgradeId | null = item.id;
      while (current) {
        expect(visited.has(current)).toBe(false); visited.add(current); current = UPGRADE_PARENT[current];
      }
      expect(visited.has('hold')).toBe(true);
    }
  });
  it('starts with no upgrades and blocks descendants without spending', () => {
    const game = createGame(0); game.yarn = new Decimal(1000000);
    for (const item of UPGRADES.filter(item => item.id !== 'hold')) expect(buyUpgrade(game, item.id)).toBe(false);
    expect(game.yarn.eq(1000000)).toBe(true);
    expect(game.stats.upgradePurchases).toBe(0);
    expect(buyUpgrade(game, 'hold')).toBe(true);
    expect(game.yarn.eq(999975)).toBe(true);
    expect(buyUpgrade(game, 'paws')).toBe(true);
    expect(buyUpgrade(game, 'silky')).toBe(false);
    expect(buyUpgrade(game, 'mittens')).toBe(true);
    expect(buyUpgrade(game, 'silky')).toBe(true);
  });
  it('requires both the tools branch and Master Knitters talent', () => {
    const game = createGame(); game.yarn = new Decimal(1e8);
    game.talents = ['knitters'];
    expect(buyUpgrade(game, 'master')).toBe(false);
    for (const id of ['hold', 'happy', 'tools'] as const) expect(buyUpgrade(game, id)).toBe(true);
    game.talents = [];
    expect(buyUpgrade(game, 'master')).toBe(false);
    game.talents = ['knitters']; expect(buyUpgrade(game, 'master')).toBe(true);
  });
  it('scales root price and resets it with the chapter, not on reload', () => {
    const game = createGame(0); game.yarn = game.lifetime = game.runEarned = new Decimal(1e6);
    buyUpgrade(game, 'hold'); expect(prestige(game)).toBe(true);
    const restored = decode(encode(game)); expect(restored.upgrades).toEqual([]);
    expect(upgradeCost(restored, UPGRADES.find(item => item.id === 'hold')!).toNumber()).toBeCloseTo(27.5);
    expect(decode(encode(createGame())).upgrades).toEqual([]);
  });
  it.each([1, 2, 3, 4, 5])('migrates v%i once without granting effectful ancestors or spending', version => {
    const game = createGame(0); game.yarn = game.lifetime = game.runEarned = new Decimal(12345);
    game.upgrades = ['moonlit']; game.talents = ['hephaestus']; game.owned.kitten = 3;
    game.stats.upgradePurchases = 7; game.achievements = ['first-thread'];
    const before = production(game);
    const migrated = decode(JSON.stringify({ ...JSON.parse(encode(game)), version }));
    expect(migrated.version).toBe(6);
    expect(migrated.upgrades).toEqual(['moonlit', 'hold']);
    expect(production(migrated).eq(before)).toBe(true);
    expect(migrated.yarn.eq(12345)).toBe(true);
    expect(migrated.lifetime.eq(12345)).toBe(true);
    expect(migrated.stats.upgradePurchases).toBe(version === 1 ? 1 : 7);
    expect(decode(encode(migrated)).upgrades).toEqual(migrated.upgrades);
    if (version >= 2) expect(migrated.achievements).toContain('first-thread');
  });
  it.each(['pointer', 'keyboard'])('only repeats %s input after root unlock', source => {
    const times: number[] = []; let unlocked = false;
    const input = new HoldInput(time => times.push(time), () => unlocked);
    input.press(source, 0); input.flush(900); input.press(source, 900); input.release(source, 1000);
    expect(times).toEqual([0]);
    unlocked = true; input.press(source, 1200); input.release(source, 1800);
    expect(times).toEqual([0, 1200, 1400, 1600, 1800]);
  });
});
