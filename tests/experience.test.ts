import { describe, expect, it, vi } from 'vitest';
import Decimal from 'break_infinity.js';
import { UPGRADES } from '../src/game/catalog';
import { createGame, tap, tapValue, criticalChance, buyUpgrade, production } from '../src/game/engine';
import { decode, encode } from '../src/game/storage';
import { prestige } from '../src/game/progression';

describe('expanded chapter upgrades', () => {
  it('offers twelve unique one-time upgrades', () => {
    expect(UPGRADES).toHaveLength(12);
    expect(new Set(UPGRADES.map(item => item.id)).size).toBe(12);
  });
  it('uses explicit additive critical odds and triples the whole manual reward only', () => {
    const game = createGame(); game.upgrades = ['bell', 'clover', 'whiskers'];
    game.owned.kitten = 100; game.talents = ['helping'];
    expect(criticalChance(game)).toBeCloseTo(.2);
    expect(tap(game, 0, () => .199).toNumber()).toBe(6);
    expect(tap(game, 200, () => .2).toNumber()).toBe(2);
    expect(production(game).toNumber()).toBe(100);
  });
  it('does not roll randomness for rejected taps or a fresh game', () => {
    const random = vi.fn(() => 0), game = createGame();
    expect(tap(game, 0, random).toNumber()).toBe(1);
    expect(random).not.toHaveBeenCalled();
    game.upgrades = ['bell'];
    expect(tap(game, 199, random).toNumber()).toBe(0);
    expect(random).not.toHaveBeenCalled();
    expect(tap(game, 200, random).toNumber()).toBe(3);
    expect(random).toHaveBeenCalledTimes(1);
  });
  it('stacks the manual and automatic upgrades exactly once and resets them', () => {
    const game = createGame(); game.yarn = game.runEarned = game.lifetime = new Decimal('1e8');
    game.owned.kitten = 1;
    for (const id of ['paws','mittens','silky','happy','tools','tea','purring','moonlit'] as const) {
      expect(buyUpgrade(game,id)).toBe(true); expect(buyUpgrade(game,id)).toBe(false);
    }
    expect(tapValue(game).toNumber()).toBe(6);
    expect(production(game).toNumber()).toBe(11.25);
    const restored = decode(encode(game));
    expect(tapValue(restored).toNumber()).toBe(6);
    expect(prestige(restored)).toBe(true);
    expect(restored.upgrades).toEqual([]); expect(criticalChance(restored)).toBe(0);
  });
});

describe('v3 settings migration', () => {
  it('preserves v2 progress and adds music/language defaults', () => {
    const game = createGame(123); game.owned.kitten = 10;
    const old = JSON.parse(encode(game)); old.version = 2;
    delete old.settings.language; delete old.settings.musicVolume;
    const restored = decode(JSON.stringify(old));
    expect(restored.version).toBe(3); expect(restored.owned.kitten).toBe(10);
    expect(restored.settings.language).toBe('en'); expect(restored.settings.musicVolume).toBe(.2);
  });
  it('validates and retains the selected language and music level across prestige', () => {
    const game = createGame(); game.settings.language = 'es'; game.settings.musicVolume = .45;
    game.yarn = game.runEarned = game.lifetime = new Decimal('1e6');
    prestige(game);
    expect(decode(encode(game)).settings).toEqual(game.settings);
    const raw = JSON.parse(encode(game));
    for (const language of ['fr', null, '<script>']) expect(() => decode(JSON.stringify({...raw, settings:{...raw.settings,language}}))).toThrow();
    expect(() => decode(JSON.stringify({...raw, settings:{...raw.settings,musicVolume:2}}))).toThrow();
  });
});
