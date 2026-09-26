import Decimal from 'break_infinity.js';
import { productionSeconds, type CrewEntitlement } from './shop';
import { updateAchievements } from './achievements';
import { COATS, PRODUCERS, UPGRADES, MILESTONE_UPGRADES, PRODUCER_UPGRADES, UPGRADE_PARENT, type ProducerId, type UpgradeId, type TalentId } from './catalog';

export type Quantity = 1 | 10 | 'max';
// Beyond the authored prototype content, bound transactions and imported teams.
export const MAX_OWNED = 10000;
// Keeps exponential chapter goals inside the supported Decimal save exponent range.
export const MAX_CHAPTERS = 3_000_000;
export interface GameState {
  version: 6;
  yarn: Decimal;
  lifetime: Decimal;
  runEarned: Decimal;
  owned: Record<ProducerId, number>;
  upgrades: UpgradeId[];
  talents: TalentId[];
  points: Decimal;
  claimed: Decimal;
  legacyClaimed: Decimal;
  legacyChapters: number;
  chapters: number;
  starterCats: number;
  collection: number[];
  coat: number;
  achievements: string[];
  readAchievements: string[];
  stats: { taps: number; playSeconds: number; upgradePurchases: number; bulkPurchases: number; maxPurchases: number; coatChanges: number; offlineYarn: Decimal };
  settings: { volume: number; musicVolume: number; language: 'en' | 'es'; reducedMotion: boolean; quality: 'auto' | 'low' | 'high' };
  savedAt: number;
  lastTap: number;
}

export function createGame(now = Date.now()): GameState {
  return {
    version: 6, yarn: new Decimal(0), lifetime: new Decimal(0), runEarned: new Decimal(0),
    owned: Object.fromEntries(PRODUCERS.map(item => [item.id, 0])) as Record<ProducerId, number>,
    upgrades: [], talents: [], points: new Decimal(0), claimed: new Decimal(0), legacyClaimed: new Decimal(0), legacyChapters: 0, chapters: 0,
    starterCats: 0, collection: [], coat: 0, achievements: [], readAchievements: [], stats: { taps: 0, playSeconds: 0, upgradePurchases: 0, bulkPurchases: 0, maxPurchases: 0, coatChanges: 0, offlineYarn: new Decimal(0) },
    settings: { volume: 0.35, musicVolume: 0.2, language: 'en', reducedMotion: false, quality: 'auto' }, savedAt: now, lastTap: -Infinity,
  };
}

export function population(game: GameState): Decimal {
  return PRODUCERS.reduce((sum, item) => sum.add(new Decimal(game.owned[item.id]).mul(item.cats)), new Decimal(game.starterCats));
}

/** The selected companion only becomes active after its permanent unlock. */
export function activeCompanion(game: GameState): typeof COATS[number] | undefined {
  return game.collection.includes(game.coat) ? COATS[game.coat] : undefined;
}

export interface CompanionRequirementProgress { key: string; current: Decimal; target: Decimal; ratio: number }
export interface CompanionProgress { ratio: number; requirements: CompanionRequirementProgress[] }

/** UI-facing unlock progress. `ratio` is the least-complete requirement (0..1). */
export function companionProgress(game: GameState, index: number): CompanionProgress {
  const requirements = (() => {
    switch (index) {
      case 0: return [{ key: 'population', current: population(game), target: new Decimal(250) }, { key: 'taps', current: new Decimal(game.stats.taps), target: new Decimal(1000) }];
      case 1: return [{ key: 'upgradePurchases', current: new Decimal(game.stats.upgradePurchases), target: new Decimal(12) }];
      case 2: return [{ key: 'offlineYarn', current: game.stats.offlineYarn, target: new Decimal(100000) }];
      case 3: return [{ key: 'chapters', current: new Decimal(game.chapters), target: new Decimal(3) }];
      case 4: return [{ key: 'population', current: population(game), target: new Decimal(5000) }];
      case 5: return [{ key: 'chapters', current: new Decimal(game.chapters), target: new Decimal(5) }, { key: 'taps', current: new Decimal(game.stats.taps), target: new Decimal(5000) }];
      default: return [];
    }
  })().map(requirement => ({ ...requirement, ratio: Math.max(0, Math.min(1, requirement.current.div(requirement.target).toNumber())) }));
  return { requirements, ratio: requirements.length ? Math.min(...requirements.map(requirement => requirement.ratio)) : 0 };
}

export function producerOutput(game: GameState, id: ProducerId, count = 1): Decimal {
  const item = PRODUCERS.find(item => item.id === id)!;
  let multiplier = 1;
  if (game.upgrades.includes('happy')) multiplier *= 1.5;
  if (game.upgrades.includes('tools')) multiplier *= 2;
  if (game.upgrades.includes('tea')) multiplier *= 1.25;
  if (game.upgrades.includes('purring')) multiplier *= 1.5;
  if (game.upgrades.includes('moonlit')) multiplier *= 2;
  if (game.upgrades.includes('master') && (id === 'workshop' || id === 'factory')) multiplier *= 2;
  if (game.talents.includes('poseidon') && (id === 'kitten' || id === 'basket')) multiplier *= 1.2;
  if (game.talents.includes('demeter') && (id === 'corner' || id === 'workshop')) multiplier *= 1.2;
  if (game.talents.includes('apollo') && (id === 'factory' || id === 'tailor')) multiplier *= 1.2;
  if (game.talents.includes('artemis') && (id === 'dyer' || id === 'spinner')) multiplier *= 1.2;
  if (game.talents.includes('ares') && (id === 'weaver' || id === 'astral')) multiplier *= 1.2;
  if (game.talents.includes('aphrodite')) multiplier *= 1.1;
  // Count legacy milestones only: the free input root and small practice steps add no global bonus.
  if (game.talents.includes('hephaestus')) multiplier *= 1 + MILESTONE_UPGRADES.filter(item => item.id !== 'hold' && game.upgrades.includes(item.id)).length * 0.1;
  const practice = PRODUCER_UPGRADES.filter(item => item.producer === id && game.upgrades.includes(item.id)).length;
  multiplier *= 1 + practice / 100;
  const companion = activeCompanion(game);
  if (companion?.id === 'kira') multiplier *= 1.1;
  if (companion?.id === 'luigi' && (id === 'kitten' || id === 'basket' || id === 'corner')) multiplier *= 1.3;
  return new Decimal(item.cats).mul(count).mul(multiplier);
}

export function production(game: GameState): Decimal {
  const starters = producerOutput(game, 'kitten', game.starterCats);
  return PRODUCERS.reduce((sum, item) => sum.add(producerOutput(game, item.id, game.owned[item.id])), starters);
}

export function tapValue(game: GameState): Decimal {
  let base = new Decimal(game.upgrades.includes('paws') ? 2 : 1);
  if (game.upgrades.includes('mittens')) base = base.mul(1.5);
  if (game.upgrades.includes('silky')) base = base.mul(2);
  if (game.talents.includes('helping')) base = base.add(production(game).mul(0.01));
  if (game.talents.includes('zeus')) base = base.mul(1.2);
  if (game.talents.includes('dionysus')) base = base.mul(1.1);
  if (activeCompanion(game)?.id === 'mario') base = base.mul(1.25);
  return base;
}

function earn(game: GameState, amount: Decimal): void {
  game.yarn = game.yarn.add(amount);
  game.lifetime = game.lifetime.add(amount);
  game.runEarned = game.runEarned.add(amount);
}

/** Independent rolls; percentage-point bonuses add, never affect passive income. */
export function criticalChance(game: GameState): number {
  const chance = (game.upgrades.includes('bell') ? 5 : 0) + (game.upgrades.includes('clover') ? 5 : 0) + (game.upgrades.includes('whiskers') ? 10 : 0) + (activeCompanion(game)?.id === 'biscocho' ? 5 : 0);
  return Math.min(25, chance) / 100;
}

/** Fixed active-event reward: it contributes to ordinary earned/run totals, never tap stats. */
export function grantBonus(game: GameState): Decimal {
  const amount = new Decimal(5);
  earn(game, amount);
  updateCollection(game);
  updateAchievements(game);
  return amount;
}

export function tap(game: GameState, now: number, random: () => number = Math.random): Decimal {
  if (!Number.isFinite(now) || now - game.lastTap < 200) return new Decimal(0);
  game.lastTap = now;
  const chance = criticalChance(game);
  const amount = tapValue(game).mul(chance > 0 && random() < chance ? 3 : 1);
  earn(game, amount);
  game.stats.taps = Math.min(Number.MAX_SAFE_INTEGER, game.stats.taps + 1);
  updateCollection(game);
  updateAchievements(game);
  return amount;
}

export function advance(game: GameState, seconds: number, entitlement: CrewEntitlement | null = null, now = Date.now()): void {
  if (!Number.isFinite(seconds) || seconds <= 0) return;
  earn(game, production(game).mul(entitlement ? productionSeconds(now - seconds * 1000, now, entitlement) : seconds));
  game.stats.playSeconds = Math.min(Number.MAX_SAFE_INTEGER, game.stats.playSeconds + seconds);
  updateCollection(game);
  updateAchievements(game);
}

export function updateCollection(game: GameState): void {
  COATS.forEach((_, index) => {
    if (companionProgress(game, index).ratio >= 1 && !game.collection.includes(index)) game.collection.push(index);
  });
  if (game.collection.length && !game.collection.includes(game.coat)) game.coat = COATS.findIndex((_, index) => game.collection.includes(index));
}

function price(game: GameState, id: ProducerId, owned: number): Decimal {
  const discount = activeCompanion(game)?.id === 'lola' ? 0.95 : 1;
  return Decimal.pow(1.15, owned).mul(PRODUCERS.find(item => item.id === id)!.cost).mul(discount).ceil();
}

export function quote(game: GameState, id: ProducerId, quantity: Quantity): { count: number; cost: Decimal; remaining: Decimal; affordable: boolean } {
  const owned = game.owned[id];
  const limit = Math.min(MAX_OWNED - owned, quantity === 'max' ? MAX_OWNED : quantity);
  let remaining = game.yarn, cost = new Decimal(0), count = 0;
  // Forecast state once, rather than mutating the real game or cloning per unit.
  // This lets a bulk quote honor an automatic companion selection reached mid-buy.
  const preview: GameState = { ...game, owned: { ...game.owned }, collection: [...game.collection] };
  // Preserve the same arithmetic order as separate purchases, even at huge
  // magnitudes. A geometric shortcut changes Decimal rounding at boundaries.
  for (let i = 0; i < limit; i++) {
    const next = price(preview, id, owned + i);
    if (quantity === 'max' && remaining.lt(next)) break;
    remaining = remaining.sub(next);
    cost = cost.add(next);
    count++;
    preview.owned[id]++;
    if (!activeCompanion(preview)) updateCollection(preview);
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
  const cost = upgradeCost(game, upgrade);
  if (game.upgrades.includes(id) || game.yarn.lt(cost)) return false;
  if (missingUpgradeRequirements(game, id).length) return false;
  game.yarn = game.yarn.sub(cost);
  game.upgrades.push(id);
  game.stats.upgradePurchases = Math.min(Number.MAX_SAFE_INTEGER, game.stats.upgradePurchases + 1);
  updateCollection(game);
  updateAchievements(game);
  return true;
}

export function missingUpgradeRequirements(game: GameState, id: UpgradeId): string[] {
  // Existing owned leaves remain valid even when they predate the tree.
  if (game.upgrades.includes(id)) return [];
  const parent = UPGRADE_PARENT[id];
  const missing: string[] = parent && !game.upgrades.includes(parent) ? [UPGRADES.find(item => item.id === parent)!.name] : [];
  if (id === 'master' && !game.talents.includes('knitters')) missing.push('Master Knitters');
  return missing;
}

/** Chapter restarts preserve upgrade power while gently raising the next board's costs. */
export function upgradeCost(game: GameState, upgrade: typeof UPGRADES[number]): Decimal {
  return new Decimal(upgrade.cost).mul(Decimal.pow('1.1', game.chapters));
}
