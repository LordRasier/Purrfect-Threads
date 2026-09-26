import { describe, expect, it } from 'vitest';
import Decimal from 'break_infinity.js';
import { advance, createGame } from '../src/game/engine';
import { decode, encode, loadGame, saveGame, SAVE_KEY, BACKUP_KEY, type StoragePort } from '../src/game/storage';
import { markAchievementRead, unreadAchievementCount } from '../src/game/achievements';

function memoryStorage(): StoragePort {
  const values = new Map<string, string>();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); } };
}

describe('versioned local saves', () => {
  it('round trips giant numbers, upgrades, settings and collection', () => {
    const game = createGame(100);
    game.yarn = game.lifetime = game.runEarned = new Decimal('1e500');
    game.upgrades = ['paws'];
    game.collection = [0, 1]; game.coat = 1;
    game.owned.kitten = 10;
    const result = decode(encode(game));
    expect(result.yarn.eq(game.yarn)).toBe(true);
    expect(result.upgrades).toEqual(['paws']);
    expect(result.coat).toBe(1);
    expect(result.settings).toEqual(game.settings);
  });
  it('persists individual achievement reads and migrates existing unlocked patches as unread', () => {
    const game = createGame(100); game.achievements = ['first-thread', 'persistent-paws'];
    expect(unreadAchievementCount(game)).toBe(2);
    expect(markAchievementRead(game, 'first-thread')).toBe(true);
    expect(markAchievementRead(game, 'first-thread')).toBe(false);
    expect(unreadAchievementCount(decode(encode(game)))).toBe(1);

    const legacy = JSON.parse(encode(game)); legacy.version = 4; delete legacy.readAchievements;
    const migrated = decode(JSON.stringify(legacy));
    expect(unreadAchievementCount(migrated)).toBe(2);
  });
  it.each([
    { version: 8 }, { yarn: '-1' }, { yarn: 'Infinity' }, { yarn: 'NaN' },
    { owned: { kitten: -1 } }, { upgrades: ['paws', 'paws'] },
    { settings: { volume: 9 } }, { collection: [99] }, { savedAt: -1 }, { chapters: 3000001 },
  ])('rejects malformed input rather than silently resetting: %j', patch => {
    const raw = JSON.parse(encode(createGame(100)));
    expect(() => decode(JSON.stringify({ ...raw, ...patch }))).toThrow();
  });
  it('preserves valid backup and explicitly reports primary corruption', () => {
    const storage = memoryStorage(), game = createGame(100);
    saveGame(storage, game, 100);
    game.yarn = game.lifetime = game.runEarned = new Decimal(20);
    saveGame(storage, game, 200);
    const backup = storage.getItem(BACKUP_KEY);
    storage.setItem(SAVE_KEY, 'broken');
    const restored = loadGame(storage, 200);
    expect(restored.status).toBe('recovered');
    expect(restored.game?.yarn.toNumber()).toBe(0);
    expect(storage.getItem(BACKUP_KEY)).toBe(backup);
    saveGame(storage, restored.game!, 200);
    expect(decode(storage.getItem(BACKUP_KEY)!).yarn.toNumber()).toBe(0);
  });
  it('blocks silent overwriting when both saves are invalid', () => {
    const storage = memoryStorage();
    storage.setItem(SAVE_KEY, 'broken');
    storage.setItem(BACKUP_KEY, 'also broken');
    expect(loadGame(storage, 200).status).toBe('corrupt');
    expect(storage.getItem(SAVE_KEY)).toBe('broken');
  });
  it('persists offline credit immediately so reloads cannot award it again', () => {
    const storage = memoryStorage(), game = createGame(1000);
    game.owned.kitten = 10;
    saveGame(storage, game, 1000);
    const first = loadGame(storage, 11000);
    expect(first.offline.toNumber()).toBe(50);
    expect(loadGame(storage, 11000).offline.toNumber()).toBe(0);
  });
  it('rejects unearned prestige points and inconsistent run balances', () => {
    const raw = JSON.parse(encode(createGame(100)));
    expect(() => decode(JSON.stringify({ ...raw, claimed: '1', points: '1' }))).toThrow();
    expect(() => decode(JSON.stringify({ ...raw, lifetime: '100', yarn: '2', runEarned: '1' }))).toThrow();
  });
  it('recovers a valid backup when a primary has impossible prestige totals', () => {
    const storage = memoryStorage();
    const valid = encode(createGame(100));
    storage.setItem(BACKUP_KEY, valid);
    storage.setItem(SAVE_KEY, JSON.stringify({ ...JSON.parse(valid), claimed: '1', points: '1' }));
    expect(loadGame(storage, 100).status).toBe('recovered');
    expect(storage.getItem(BACKUP_KEY)).toBe(valid);
  });
  it('keeps counters serializable under runaway finite time deltas', () => {
    const game = createGame(0);
    game.owned.kitten = 1;
    advance(game, Number.MAX_VALUE);
    advance(game, Number.MAX_VALUE);
    expect(() => decode(encode(game))).not.toThrow();
  });

  it('grandfathers legitimate v3 claims exactly once and preserves talents across reload', () => {
    const game = createGame(100);
    game.lifetime = new Decimal('1000000'); game.runEarned = game.yarn = new Decimal(100);
    game.chapters = 2; game.claimed = new Decimal(3); game.points = new Decimal(1); game.talents = ['welcome', 'helping', 'knitters']; game.achievements = ['pantheon'];
    const legacy = JSON.parse(encode(game)); legacy.version = 3; delete legacy.legacyClaimed; delete legacy.legacyChapters;
    const migrated = decode(JSON.stringify(legacy));
    expect(migrated.version).toBe(5);
    expect(migrated.points.toNumber()).toBe(1); expect(migrated.claimed.toNumber()).toBe(3);
    expect(migrated.legacyClaimed.toNumber()).toBe(3); expect(migrated.legacyChapters).toBe(2);
    expect(migrated.talents).toEqual(['welcome', 'helping', 'knitters']);
    expect(migrated.achievements).toContain('pantheon');
    expect(decode(encode(migrated)).points.eq(1)).toBe(true);
  });
  it('rejects arbitrary v4 points and claims outside the migration allowance', () => {
    const raw = JSON.parse(encode(createGame(100)));
    expect(() => decode(JSON.stringify({ ...raw, points: '1', claimed: '1' }))).toThrow();
    expect(() => decode(JSON.stringify({ ...raw, legacyClaimed: '1', legacyChapters: 0, points: '1', claimed: '1' }))).toThrow();
  });
});
