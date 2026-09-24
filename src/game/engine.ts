import Decimal from 'break_infinity.js';
import { COATS, PRODUCERS, UPGRADES, type ProducerId, type UpgradeId, type TalentId } from './catalog';

export type Quantity = 1 | 10 | 'max';
export interface GameState {
  version: 1;
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
  stats: { taps: number; playSeconds: number };
  settings: { volume: number; reducedMotion: boolean; quality: 'auto' | 'low' | 'high' };
  savedAt: number;
  lastTap: number;
}

export function createGame(now = Date.now()): GameState {
  return {
    version: 1, yarn: new Decimal(0), lifetime: new Decimal(0), runEarned: new Decimal(0),
    owned: { kitten: 0, basket: 0, corner: 0, workshop: 0, factory: 0 },
    upgrades: [], talents: [], points: new Decimal(0), claimed: new Decimal(0), chapters: 0,
    starterCats: 0, collection: [], coat: 0, stats: { taps: 0, playSeconds: 0 },
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
  game.stats.taps++;
  return amount;
}

export function advance(game: GameState, seconds: number): void {
  if (!Number.isFinite(seconds) || seconds <= 0) return;
  earn(game, production(game).mul(seconds));
  game.stats.playSeconds += seconds;
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

function costOf(id: ProducerId, owned: number, count: number): Decimal {
  // Sum individually rounded prices at human-scale magnitudes. Above this,
  // rounding is below Decimal precision; use a bounded geometric tail.
  const exactCount = Math.min(count, Math.max(0, 256 - owned));
  let sum = new Decimal(0);
  for (let i = 0; i < exactCount; i++) sum = sum.add(price(id, owned + i));
  const rest = count - exactCount;
  if (rest) {
    const first = Decimal.pow(1.15, owned + exactCount).mul(PRODUCERS.find(item => item.id === id)!.cost);
    sum = sum.add(first.mul(Decimal.pow(1.15, rest).sub(1)).div(0.15));
  }
  return sum;
}

export function quote(game: GameState, id: ProducerId, quantity: Quantity): { count: number; cost: Decimal } {
  const owned = game.owned[id];
  if (quantity !== 'max') return { count: quantity, cost: costOf(id, owned, quantity) };
  const base = price(id, owned);
  const estimate = Math.floor(game.yarn.mul(0.15).div(base).add(1).log(1.15));
  let low = 0, high = Math.min(Number.MAX_SAFE_INTEGER - owned, Math.max(1, estimate + 2));
  while (low < high) {
    const mid = low + Math.ceil((high - low) / 2);
    if (costOf(id, owned, mid).lte(game.yarn)) low = mid;
    else high = mid - 1;
  }
  return { count: low, cost: costOf(id, owned, low) };
}

export function buyProducer(game: GameState, id: ProducerId, quantity: Quantity): number {
  const purchase = quote(game, id, quantity);
  if (!purchase.count || purchase.cost.gt(game.yarn) || game.owned[id] + purchase.count > Number.MAX_SAFE_INTEGER) return 0;
  game.yarn = Decimal.max(0, game.yarn.sub(purchase.cost));
  game.owned[id] += purchase.count;
  updateCollection(game);
  return purchase.count;
}

export function buyUpgrade(game: GameState, id: UpgradeId): boolean {
  const upgrade = UPGRADES.find(item => item.id === id)!;
  if (game.upgrades.includes(id) || game.yarn.lt(upgrade.cost)) return false;
  if (id === 'master' && !game.talents.includes('knitters')) return false;
  game.yarn = game.yarn.sub(upgrade.cost);
  game.upgrades.push(id);
  return true;
}
