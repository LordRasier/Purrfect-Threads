import Decimal from 'break_infinity.js';
import { ACHIEVEMENTS, updateAchievements } from './achievements';
import { PRODUCERS, UPGRADES, TALENTS } from './catalog';
import { createGame, MAX_CHAPTERS, MAX_OWNED, updateCollection, type GameState } from './engine';
import { applyOffline } from './progression';

export const SAVE_KEY = 'purrfect-threads.save.v1';
export const BACKUP_KEY = 'purrfect-threads.backup.v1';
export interface StoragePort { getItem(key: string): string | null; setItem(key: string, value: string): void }
export type LoadResult = {
  game: GameState | null;
  status: 'new' | 'loaded' | 'recovered' | 'corrupt' | 'unavailable';
  offline: Decimal;
};

export function encode(game: GameState): string {
  return JSON.stringify({ ...game, lastTap: undefined });
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid save object.');
  return value as Record<string, unknown>;
}
function integer(value: unknown, max = Number.MAX_SAFE_INTEGER): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0 || value > max) throw new Error('Invalid save count.');
  return value;
}
function decimal(value: unknown): Decimal {
  if (typeof value !== 'string' || !/^[+]?\d+(?:\.\d+)?(?:e[+-]?\d+)?$/i.test(value)) throw new Error('Invalid yarn amount.');
  const parsed = new Decimal(value);
  if (!Number.isFinite(parsed.mantissa) || !Number.isFinite(parsed.exponent) || Math.abs(parsed.exponent) > 1e6 || parsed.lt(0)) throw new Error('Unsupported yarn amount.');
  return parsed;
}
function knownList<T extends string | number>(value: unknown, known: readonly T[]): T[] {
  if (!Array.isArray(value) || value.length > known.length || value.some(item => !known.includes(item)) || new Set(value).size !== value.length) throw new Error('Invalid save collection.');
  return value as T[];
}

/** Imported saves are untrusted. Reconstruct only recognized, validated fields. */
export function decode(raw: string): GameState {
  if (raw.length > 100000) throw new Error('Save file is too large.');
  const data = record(JSON.parse(raw));
  if (data.version !== 1 && data.version !== 2 && data.version !== 3 && data.version !== 4) throw new Error('This save version is not supported.');
  const game = createGame(integer(data.savedAt));
  for (const key of ['yarn', 'lifetime', 'runEarned', 'points', 'claimed'] as const) game[key] = decimal(data[key]);
  const owned = record(data.owned);
  for (const item of PRODUCERS) game.owned[item.id] = integer(data.version === 1 && !['kitten','basket','corner','workshop','factory'].includes(item.id) ? 0 : owned[item.id], MAX_OWNED);
  game.upgrades = knownList(data.upgrades, UPGRADES.map(item => item.id));
  game.talents = knownList(data.talents, TALENTS.map(item => item.id));
  game.collection = knownList(data.collection, [0, 1, 2, 3, 4, 5]);
  game.coat = integer(data.coat, 5);
  if (game.coat !== 0 && !game.collection.includes(game.coat)) throw new Error('Selected cat is locked.');
  game.chapters = integer(data.chapters, MAX_CHAPTERS);
  if (data.version === 4) {
    game.legacyClaimed = decimal(data.legacyClaimed);
    game.legacyChapters = integer(data.legacyChapters);
  } else {
    // v1-v3 used lifetime-derived rewards. Preserve only their already validated claims.
    game.legacyClaimed = game.claimed;
    game.legacyChapters = game.chapters;
  }
  game.starterCats = integer(data.starterCats, 3);
  if (![0, 3].includes(game.starterCats) || (game.starterCats && !game.talents.includes('welcome'))) throw new Error('Invalid starting team.');
  if (game.upgrades.includes('master') && !game.talents.includes('knitters')) throw new Error('Missing permanent talent.');
  if (game.yarn.gt(game.lifetime) || game.runEarned.gt(game.lifetime) || game.points.gt(game.claimed) || !game.points.floor().eq(game.points) || !game.claimed.floor().eq(game.claimed)) throw new Error('Inconsistent save totals.');
  if (game.yarn.gt(game.runEarned)) throw new Error('Unearned progress in save.');
  if (data.version <= 3 && game.claimed.gt(game.lifetime.div(100000).sqrt().floor())) throw new Error('Unearned legacy progress in save.');
  if (data.version === 4 && (game.legacyChapters > game.chapters || game.legacyClaimed.gt(game.lifetime.div(100000).sqrt().floor()) || !game.claimed.eq(game.legacyClaimed.add(game.chapters - game.legacyChapters)))) throw new Error('Unearned progress in save.');
  const stats = record(data.stats);
  game.stats.taps = integer(stats.taps);
  if (typeof stats.playSeconds !== 'number' || !Number.isFinite(stats.playSeconds) || stats.playSeconds < 0) throw new Error('Invalid play time.');
  game.stats.playSeconds = stats.playSeconds;
  if (data.version >= 2) {
    game.achievements = knownList(data.achievements, ACHIEVEMENTS.map(item => item.id));
    for (const key of ['upgradePurchases', 'bulkPurchases', 'maxPurchases', 'coatChanges'] as const) game.stats[key] = integer(stats[key]);
    game.stats.offlineYarn = decimal(stats.offlineYarn);
    if (game.stats.offlineYarn.gt(game.lifetime)) throw new Error('Invalid offline total.');
  } else {
    // Legacy saves did not track these counters. Infer only facts still present.
    game.stats.upgradePurchases = game.upgrades.length;
  }
  const settings = record(data.settings);
  if (typeof settings.volume !== 'number' || !Number.isFinite(settings.volume) || settings.volume < 0 || settings.volume > 1 || typeof settings.reducedMotion !== 'boolean' || !['auto', 'low', 'high'].includes(String(settings.quality))) throw new Error('Invalid settings.');
  if (data.version >= 3 && (typeof settings.musicVolume !== 'number' || !Number.isFinite(settings.musicVolume) || settings.musicVolume < 0 || settings.musicVolume > 1 || !['en', 'es'].includes(String(settings.language)))) throw new Error('Invalid music or language settings.');
  game.settings = { ...game.settings, volume: settings.volume, reducedMotion: settings.reducedMotion, quality: settings.quality as GameState['settings']['quality'], ...(data.version >= 3 ? { musicVolume: settings.musicVolume as number, language: settings.language as 'en' | 'es' } : {}) };
  updateCollection(game);
  updateAchievements(game);
  return game;
}

export function saveGame(storage: StoragePort, game: GameState, now: number): void {
  const previous = storage.getItem(SAVE_KEY);
  if (previous) {
    let valid = false;
    try { decode(previous); valid = true; } catch { /* Keep the last valid backup. */ }
    if (valid) storage.setItem(BACKUP_KEY, previous);
  }
  game.savedAt = Math.max(game.savedAt, now);
  storage.setItem(SAVE_KEY, encode(game));
}

export function loadGame(storage: StoragePort, now: number): LoadResult {
  let primary: string | null, backup: string | null;
  try { primary = storage.getItem(SAVE_KEY); backup = storage.getItem(BACKUP_KEY); }
  catch { return { game: createGame(now), status: 'unavailable', offline: new Decimal(0) }; }
  if (!primary && !backup) return { game: createGame(now), status: 'new', offline: new Decimal(0) };
  for (const [raw, status] of [[primary, 'loaded'], [backup, 'recovered']] as const) {
    if (!raw) continue;
    let game: GameState;
    try { game = decode(raw); } catch { continue; }
    const offline = applyOffline(game, now);
    try { saveGame(storage, game, now); }
    catch { return { game, status: 'unavailable', offline }; }
    return { game, status, offline };
  }
  return { game: null, status: 'corrupt', offline: new Decimal(0) };
}
