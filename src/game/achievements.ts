import Decimal from 'break_infinity.js';
import { PRODUCERS } from './catalog';
import type { GameState } from './engine';

type Metric = 'taps' | 'lifetime' | 'cats' | 'teams' | 'upgrades' | 'chapters' | 'talents' | 'coats' | 'looks' | 'offline' | 'time' | 'bulk' | 'max';
export interface Achievement { id: string; name: string; detail: string; category: string; metric: Metric; target: number; icon: string }
const badge = (id: string, name: string, detail: string, category: string, metric: Metric, target: number, icon: string): Achievement => ({ id, name, detail, category, metric, target, icon });
export const ACHIEVEMENTS: readonly Achievement[] = [
  badge('first-thread', 'A loose thread', 'Pull the yarn once.', 'Pulling', 'taps', 1, 'yarn'),
  badge('persistent-paws', 'Persistent paws', 'Pull the yarn 75 times.', 'Pulling', 'taps', 75, 'paw'),
  badge('paw-marathon', 'Paw marathon', 'Pull the yarn 500 times.', 'Pulling', 'taps', 500, 'paw'),
  badge('thread-legend', 'Legend of the thread', 'Pull the yarn 2500 times.', 'Pulling', 'taps', 2500, 'star'),
  badge('first-skein', 'A proper skein', 'Produce 1000 lifetime yarn.', 'Production', 'lifetime', 1000, 'yarn'),
  badge('woolly-ambition', 'Woolly ambition', 'Produce 10000 lifetime yarn.', 'Production', 'lifetime', 10000, 'yarn'),
  badge('thread-empire', 'Thread empire', 'Produce 100000 lifetime yarn.', 'Production', 'lifetime', 100000, 'house'),
  badge('million-meows', 'A million meows', 'Produce one million lifetime yarn.', 'Production', 'lifetime', 1e6, 'star'),
  badge('cosmic-skein', 'The cosmic skein', 'Produce one billion lifetime yarn.', 'Production', 'lifetime', 1e9, 'cloud'),
  badge('first-hire', 'Employee of the meownth', 'Have your first working cat.', 'Crew', 'cats', 1, 'cat'),
  badge('cat-party', 'A very small union', 'Have 10 working cats at once.', 'Crew', 'cats', 10, 'cat'),
  badge('crowded-sofa', 'No room on the sofa', 'Have 100 working cats at once.', 'Crew', 'cats', 100, 'basket'),
  badge('fluffy-thousand', 'Fluffy thousand', 'Have 1000 working cats at once.', 'Crew', 'cats', 1000, 'basket'),
  badge('cat-city', 'The city of purrs', 'Have 100000 working cats at once.', 'Crew', 'cats', 100000, 'house'),
  badge('mixed-company', 'Mixed company', 'Own three different crew types in one chapter.', 'Crew', 'teams', 3, 'paw'),
  badge('full-house', 'Full house', 'Own five different crew types in one chapter.', 'Crew', 'teams', 5, 'house'),
  badge('ten-lives', 'Ten lives', 'Own all ten crew types in one chapter.', 'Crew', 'teams', 10, 'star'),
  badge('first-upgrade', 'A bright idea', 'Buy your first chapter upgrade.', 'Upgrades', 'upgrades', 1, 'sun'),
  badge('toolbox', 'The forbidden toolbox', 'Buy three chapter upgrades across all chapters.', 'Upgrades', 'upgrades', 3, 'knit'),
  badge('serial-tinkerer', 'Serial tinkerer', 'Buy ten chapter upgrades across all chapters.', 'Upgrades', 'upgrades', 10, 'knit'),
  badge('professor-purr', 'Professor Purr', 'Buy 25 chapter upgrades across all chapters.', 'Upgrades', 'upgrades', 25, 'sun'),
  badge('fresh-start', 'A fresh start', 'Begin your first new chapter.', 'Chapters', 'chapters', 1, 'house'),
  badge('third-time', 'Third time is a purr', 'Begin three new chapters.', 'Chapters', 'chapters', 3, 'star'),
  badge('nine-lives', 'Nine lives, new address', 'Begin nine new chapters.', 'Chapters', 'chapters', 9, 'cloud'),
  badge('divine-favor', 'Divine favor', 'Buy one permanent Olympus talent.', 'Chapters', 'talents', 1, 'star'),
  badge('demigod', 'Demigod of fluff', 'Buy two permanent Olympus talents.', 'Chapters', 'talents', 2, 'star'),
  badge('pantheon', 'The purrfect pantheon', 'Buy all twelve permanent Olympus talents.', 'Chapters', 'talents', 12, 'star'),
  badge('hello-friend', 'Hello, friend', 'Meet your first collectible companion.', 'Collection', 'coats', 1, 'heart'),
  badge('friend-circle', 'The cuddle circle', 'Meet three collectible companions.', 'Collection', 'coats', 3, 'heart'),
  badge('whole-family', 'The whole family', 'Meet all six collectible companions.', 'Collection', 'coats', 6, 'heart'),
  badge('new-look', 'A new leading cat', 'Choose a different unlocked companion.', 'Collection', 'looks', 1, 'cat'),
  badge('while-you-napped', 'While you napped', 'Collect 1000 yarn through offline production.', 'Homecoming', 'offline', 1000, 'cloud'),
  badge('dream-shift', 'The dream shift', 'Collect 100000 yarn through offline production.', 'Homecoming', 'offline', 100000, 'cloud'),
  badge('cozy-hour', 'One cozy hour', 'Spend one active hour in your workshop.', 'Homecoming', 'time', 3600, 'sun'),
  badge('group-hug', 'Group hug', 'Make a successful ×10 purchase.', 'Crew', 'bulk', 1, 'basket'),
  badge('all-in', 'All paws in', 'Make a successful Max purchase.', 'Crew', 'max', 1, 'paw'),
];

function metricValue(game: GameState, metric: Metric): Decimal {
  switch (metric) {
    case 'taps': return new Decimal(game.stats.taps);
    case 'lifetime': return game.lifetime;
    case 'cats': return PRODUCERS.reduce((sum, p) => sum.add(new Decimal(game.owned[p.id]).mul(p.cats)), new Decimal(game.starterCats));
    case 'teams': return new Decimal(PRODUCERS.filter(p => game.owned[p.id] > 0).length);
    case 'upgrades': return new Decimal(game.stats.upgradePurchases);
    case 'chapters': return new Decimal(game.chapters);
    case 'talents': return new Decimal(game.talents.length);
    case 'coats': return new Decimal(game.collection.length);
    case 'looks': return new Decimal(game.stats.coatChanges);
    case 'offline': return game.stats.offlineYarn;
    case 'time': return new Decimal(game.stats.playSeconds);
    case 'bulk': return new Decimal(game.stats.bulkPurchases);
    case 'max': return new Decimal(game.stats.maxPurchases);
  }
}
export function achievementProgress(game: GameState, item: Achievement): { value: Decimal; ratio: number } {
  const value = game.achievements.includes(item.id) ? new Decimal(item.target) : metricValue(game, item.metric);
  return { value: Decimal.min(value, item.target), ratio: Math.max(0, Math.min(1, value.div(item.target).toNumber())) };
}
export function updateAchievements(game: GameState): string[] {
  const unlocked: string[] = [];
  for (const item of ACHIEVEMENTS) {
    if (!game.achievements.includes(item.id) && metricValue(game, item.metric).gte(item.target)) {
      game.achievements.push(item.id); unlocked.push(item.id);
    }
  }
  return unlocked;
}
