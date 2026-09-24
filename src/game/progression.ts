import Decimal from 'break_infinity.js';
import { TALENTS, type TalentId } from './catalog';
import { createGame, production, updateCollection, type GameState } from './engine';

export function prestigeReward(game: GameState): Decimal {
  return Decimal.max(0, game.lifetime.div(100000).sqrt().floor().sub(game.claimed));
}

export function prestige(game: GameState): boolean {
  const reward = prestigeReward(game);
  if (reward.lt(1)) return false;
  game.points = game.points.add(reward);
  game.claimed = game.claimed.add(reward);
  game.chapters++;
  game.yarn = new Decimal(0);
  game.runEarned = new Decimal(0);
  game.owned = createGame().owned;
  game.upgrades = [];
  game.starterCats = game.talents.includes('welcome') ? 3 : 0;
  // Do not reset lastTap: a chapter transition must not bypass the rate limit.
  updateCollection(game);
  return true;
}

export function buyTalent(game: GameState, id: TalentId): boolean {
  const talent = TALENTS.find(item => item.id === id)!;
  if (game.talents.includes(id) || game.points.lt(talent.cost)) return false;
  game.points = game.points.sub(talent.cost);
  game.talents.push(id);
  return true;
}

export function selectCoat(game: GameState, index: number): boolean {
  if (!game.collection.includes(index)) return false;
  game.coat = index;
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
  return amount;
}
