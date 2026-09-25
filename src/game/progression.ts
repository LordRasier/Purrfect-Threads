import Decimal from 'break_infinity.js';
import { updateAchievements } from './achievements';
import { TALENTS, type TalentId } from './catalog';
import { MAX_CHAPTERS, createGame, production, updateCollection, type GameState } from './engine';

export function prestigeGoal(game: GameState): Decimal {
  return new Decimal(100000).mul(Decimal.pow(2, game.chapters));
}

/** A completed chapter always awards exactly one golden paw. */
export function prestigeReward(game: GameState): Decimal {
  return game.chapters < MAX_CHAPTERS && game.runEarned.gte(prestigeGoal(game)) ? new Decimal(1) : new Decimal(0);
}

export function prestige(game: GameState): boolean {
  const reward = prestigeReward(game);
  if (reward.lt(1)) return false;
  game.points = game.points.add(reward);
  game.claimed = game.claimed.add(1);
  game.chapters++;
  updateAchievements(game);
  game.yarn = new Decimal(0);
  game.runEarned = new Decimal(0);
  game.owned = createGame().owned;
  game.upgrades = [];
  game.starterCats = game.talents.includes('welcome') ? 3 : 0;
  // Do not reset lastTap: a chapter transition must not bypass the rate limit.
  updateCollection(game);
  updateAchievements(game);
  return true;
}

export function buyTalent(game: GameState, id: TalentId): boolean {
  const talent = TALENTS.find(item => item.id === id)!;
  if (game.talents.includes(id) || game.points.lt(talent.cost)) return false;
  game.points = game.points.sub(talent.cost);
  game.talents.push(id);
  updateAchievements(game);
  return true;
}

export function selectCoat(game: GameState, index: number): boolean {
  if (!game.collection.includes(index)) return false;
  if (game.coat !== index) game.stats.coatChanges = Math.min(Number.MAX_SAFE_INTEGER, game.stats.coatChanges + 1);
  game.coat = index;
  updateAchievements(game);
  return true;
}

export function applyOffline(game: GameState, now: number): Decimal {
  if (!Number.isFinite(now)) return new Decimal(0);
  const elapsed = Math.min(8 * 3600, Math.max(0, (now - game.savedAt) / 1000));
  const amount = production(game).mul(elapsed * 0.5);
  game.yarn = game.yarn.add(amount);
  game.lifetime = game.lifetime.add(amount);
  game.runEarned = game.runEarned.add(amount);
  game.savedAt = Math.max(game.savedAt, now);
  game.stats.offlineYarn = game.stats.offlineYarn.add(amount);
  updateAchievements(game);
  return amount;
}
