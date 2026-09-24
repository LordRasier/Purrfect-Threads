import { describe, expect, it } from 'vitest';
import Decimal from 'break_infinity.js';
import { createGame } from '../src/game/engine';
import { decode, encode, loadGame, saveGame, SAVE_KEY, BACKUP_KEY, type StoragePort } from '../src/game/storage';

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
  it.each([
    { version: 8 }, { yarn: '-1' }, { yarn: 'Infinity' }, { yarn: 'NaN' },
    { owned: { kitten: -1 } }, { upgrades: ['paws', 'paws'] },
    { settings: { volume: 9 } }, { collection: [99] }, { savedAt: -1 },
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
});
