import Decimal from 'break_infinity.js';
import { updateAchievements } from './achievements';
import { COATS, PRODUCERS, UPGRADES, type ProducerId, type UpgradeId, type TalentId } from './catalog';

export type Quantity = 1 | 10 | 'max';
// Beyond the authored prototype content, bound transactions and imported teams.
export const MAX_OWNED = 10000;
export interface GameState {
  version: 2;
  yarn: Decimal;
  lifetime: Decimal;
  runEarned: Decimal;
  owned: Record<ProducerId, number>;
  upgrades: UpgradeId[];
  talents: TalentId[];
  points: Decimal;
  claimed: Decimal;
  chapters: number;
  starterCats: number;
  collection: number[];
  coat: number;
  achievements: string[];
  stats: { taps: number; playSeconds: number; upgradePurchases: number; bulkPurchases: number; maxPurchases: number; coatChanges: number; offlineYarn: Decimal };
  settings: { volume: number; reducedMotion: boolean; quality: 'auto' | 'low' | 'high' };
  savedAt: number;
  lastTap: number;
}

export function createGame(now = Date.now()): GameState {
  return {
    version: 2, yarn: new Decimal(0), lifetime: new Decimal(0), runEarned: new Decimal(0),
    owned: Object.fromEntries(PRODUCERS.map(item => [item.id, 0])) as Record<ProducerId, number>,
    upgrades: [], talents: [], points: new Decimal(0), claimed: new Decimal(0), chapters: 0,
    starterCats: 0, collection: [], coat: 0, achievements: [], stats: { taps: 0, playSeconds: 0, upgradePurchases: 0, bulkPurchases: 0, maxPurchases: 0, coatChanges: 0, offlineYarn: new Decimal(0) },
    settings: { volume: 0.35, reducedMotion: false, quality: 'auto' }, savedAt: now, lastTap: -Infinity,
  };
}

export function population(game: GameState): Decimal {
  return PRODUCERS.reduce((sum, item) => sum.add(new Decimal(game.owned[item.id]).mul(item.cats)), new Decimal(game.starterCats));
}

export function producerOutput(game: GameState, id: ProducerId, count = 1): Decimal {
  const item = PRODUCERS.find(item => item.id === id)!;
  let multiplier = 1;
  if (game.upgrades.includes('happy')) multiplier *= 1.5;
  if (game.upgrades.includes('tools')) multiplier *= 2;
  if (game.upgrades.includes('master') && (id === 'workshop' || id === 'factory')) multiplier *= 2;
  return new Decimal(item.cats).mul(count).mul(multiplier);
}

export function production(game: GameState): Decimal {
  const starters = producerOutput(game, 'kitten', game.starterCats);
  return PRODUCERS.reduce((sum, item) => sum.add(producerOutput(game, item.id, game.owned[item.id])), starters);
}

export function tapValue(game: GameState): Decimal {
  const base = new Decimal(game.upgrades.includes('paws') ? 2 : 1);
  return game.talents.includes('helping') ? base.add(production(game).mul(0.01)) : base;
}

function earn(game: GameState, amount: Decimal): void {
  game.yarn = game.yarn.add(amount);
  game.lifetime = game.lifetime.add(amount);
  game.runEarned = game.runEarned.add(amount);
}

export function tap(game: GameState, now: number): Decimal {
  if (!Number.isFinite(now) || now - game.lastTap < 200) return new Decimal(0);
  game.lastTap = now;
  const amount = tapValue(game);
  earn(game, amount);
  game.stats.taps = Math.min(Number.MAX_SAFE_INTEGER, game.stats.taps + 1);
  updateAchievements(game);
  return amount;
}

export function advance(game: GameState, seconds: number): void {
  if (!Number.isFinite(seconds) || seconds <= 0) return;
  earn(game, production(game).mul(seconds));
  game.stats.playSeconds = Math.min(Number.MAX_SAFE_INTEGER, game.stats.playSeconds + seconds);
  updateAchievements(game);
}

export function updateCollection(game: GameState): void {
  const cats = population(game);
  COATS.forEach((coat, index) => {
    if (cats.gte(coat.milestone) && !game.collection.includes(index)) game.collection.push(index);
  });
}

function price(id: ProducerId, owned: number): Decimal {
  return Decimal.pow(1.15, owned).mul(PRODUCERS.find(item => item.id === id)!.cost).ceil();
}

export function quote(game: GameState, id: ProducerId, quantity: Quantity): { count: number; cost: Decimal; remaining: Decimal; affordable: boolean } {
  const owned = game.owned[id];
  const limit = Math.min(MAX_OWNED - owned, quantity === 'max' ? MAX_OWNED : quantity);
  let remaining = game.yarn, cost = new Decimal(0), count = 0;
  // Preserve the same arithmetic order as separate purchases, even at huge
  // magnitudes. A geometric shortcut changes Decimal rounding at boundaries.
  for (let i = 0; i < limit; i++) {
    const next = price(id, owned + i);
    if (quantity === 'max' && remaining.lt(next)) break;
    remaining = remaining.sub(next);
    cost = cost.add(next);
    count++;
  }
  return { count, cost, remaining, affordable: count > 0 && remaining.gte(0) };
}

export function buyProducer(game: GameState, id: ProducerId, quantity: Quantity): number {
  const purchase = quote(game, id, quantity);
  if (!purchase.affordable) return 0;
  game.yarn = purchase.remaining;
  game.owned[id] += purchase.count;
  if (quantity === 10 && purchase.count === 10) game.stats.bulkPurchases = Math.min(Number.MAX_SAFE_INTEGER, game.stats.bulkPurchases + 1);
  if (quantity === 'max') game.stats.maxPurchases = Math.min(Number.MAX_SAFE_INTEGER, game.stats.maxPurchases + 1);
  updateCollection(game);
  updateAchievements(game);
  return purchase.count;
}

export function buyUpgrade(game: GameState, id: UpgradeId): boolean {
  const upgrade = UPGRADES.find(item => item.id === id)!;
  if (game.upgrades.includes(id) || game.yarn.lt(upgrade.cost)) return false;
  if (id === 'master' && !game.talents.includes('knitters')) return false;
  game.yarn = game.yarn.sub(upgrade.cost);
  game.upgrades.push(id);
  game.stats.upgradePurchases = Math.min(Number.MAX_SAFE_INTEGER, game.stats.upgradePurchases + 1);
  updateAchievements(game);
  return true;
}
