export const PRODUCERS = [
  { id: 'kitten', name: 'Kitten', detail: 'A tiny pair of helping paws.', cost: 75, cats: 1, icon: 'cat', color: 'peach' },
  { id: 'basket', name: 'Basket Buddies', detail: 'Eight roommates. One big yarn habit.', cost: 750, cats: 8, icon: 'basket', color: 'sage' },
  { id: 'corner', name: 'Knitter Cats', detail: 'A cozy corner for a creative crew.', cost: 7500, cats: 50, icon: 'knit', color: 'lilac' },
  { id: 'workshop', name: 'Artisan Cats', detail: 'Little paws. Serious production.', cost: 75000, cats: 300, icon: 'house', color: 'sand' },
  { id: 'factory', name: 'Cloud Cats', detail: 'A whole new level of fluffy.', cost: 750000, cats: 2000, icon: 'cloud', color: 'blue' },
  { id: 'tailor', name: 'Tailor Tabbies', detail: 'Tiny waistcoats. Impeccable seams.', cost: 7500000, cats: 12000, icon: 'knit', color: 'peach' },
  { id: 'dyer', name: 'Rainbow Dyers', detail: 'A splash of color in every pawprint.', cost: 75000000, cats: 75000, icon: 'sun', color: 'lilac' },
  { id: 'spinner', name: 'Spinning Siamese', detail: 'Spinning wheels and even taller tales.', cost: 750000000, cats: 450000, icon: 'yarn', color: 'sand' },
  { id: 'weaver', name: 'Dream Weavers', detail: 'Weaving blankets from the softest dreams.', cost: 7500000000, cats: 2700000, icon: 'cloud', color: 'sage' },
  { id: 'astral', name: 'Celestial Cats', detail: 'The universe is just one enormous yarn ball.', cost: 75000000000, cats: 16000000, icon: 'star', color: 'blue' },
] as const;
export type ProducerId = typeof PRODUCERS[number]['id'];

export const UPGRADES = [
  { id: 'paws', name: 'Soft Paws', detail: 'Twice the yarn with every touch.', cost: 100, icon: 'paw' },
  { id: 'happy', name: 'Happy Workers', detail: '+50% yarn from all your cats.', cost: 1000, icon: 'heart' },
  { id: 'tools', name: 'Better Tools', detail: 'Double all automatic production.', cost: 10000, icon: 'knit' },
  { id: 'master', name: 'Master Tools', detail: 'Double Artisan & Cloud Cats output.', cost: 25000, icon: 'star' },
  { id: 'bell', name: 'Lucky Bell', detail: '5% chance for a triple-yarn touch.', cost: 300, icon: 'star' },
  { id: 'clover', name: 'Four-leaf Paw', detail: '+5% chance for a triple-yarn touch.', cost: 1500, icon: 'paw' },
  { id: 'mittens', name: 'Velvet Mittens', detail: '50% more yarn with every touch.', cost: 5000, icon: 'paw' },
  { id: 'tea', name: 'Tea Break', detail: '25% more automatic production.', cost: 8000, icon: 'heart' },
  { id: 'whiskers', name: 'Golden Whiskers', detail: '+10% chance for a triple-yarn touch.', cost: 50000, icon: 'cat' },
  { id: 'purring', name: 'Purring Engine', detail: '50% more automatic production.', cost: 100000, icon: 'house' },
  { id: 'silky', name: 'Silky Threads', detail: 'Double the yarn with every touch.', cost: 500000, icon: 'yarn' },
  { id: 'moonlit', name: 'Moonlit Shift', detail: 'Double all automatic production.', cost: 1000000, icon: 'cloud' },
] as const;
export type UpgradeId = typeof UPGRADES[number]['id'];
export const TALENTS = [
  { id: 'welcome', name: 'Welcome Home', god: 'Hera', statue: 0, detail: 'Start every new chapter with 3 cats.', cost: 1, icon: 'house' },
  { id: 'helping', name: 'Helping Paw', god: 'Hermes', statue: 1, detail: 'Each touch also earns 1% of your yarn per second.', cost: 2, icon: 'paw' },
  { id: 'knitters', name: 'Master Knitters', god: 'Athena', statue: 2, detail: 'Unlock Master Tools to buy in every chapter.', cost: 3, icon: 'knit' },
  { id: 'zeus', name: 'Thunder Paws', god: 'Zeus', statue: 3, detail: '+20% yarn from every touch.', cost: 2, icon: 'star' },
  { id: 'poseidon', name: 'Tidal Tails', god: 'Poseidon', statue: 4, detail: '+20% Kitten and Basket Buddies production.', cost: 2, icon: 'cloud' },
  { id: 'demeter', name: 'Harvest Threads', god: 'Demeter', statue: 5, detail: '+20% Knitter and Artisan Cats production.', cost: 2, icon: 'heart' },
  { id: 'apollo', name: 'Sunlit Spools', god: 'Apollo', statue: 6, detail: '+20% Cloud and Tailor Tabbies production.', cost: 3, icon: 'sun' },
  { id: 'artemis', name: 'Moon Hunt', god: 'Artemis', statue: 7, detail: '+20% Rainbow Dyers and Spinning Siamese production.', cost: 3, icon: 'moon' },
  { id: 'ares', name: 'Warrior Weave', god: 'Ares', statue: 8, detail: '+20% Dream Weavers and Celestial Cats production.', cost: 4, icon: 'star' },
  { id: 'aphrodite', name: 'Love of Labor', god: 'Aphrodite', statue: 9, detail: '+10% all automatic production.', cost: 4, icon: 'heart' },
  { id: 'hephaestus', name: 'Forge of Paws', god: 'Hephaestus', statue: 10, detail: '+10% automatic production per purchased chapter upgrade.', cost: 3, icon: 'house' },
  { id: 'dionysus', name: 'Joyful Pull', god: 'Dionysus', statue: 11, detail: '+10% yarn from every touch.', cost: 2, icon: 'paw' },
] as const;
export type TalentId = typeof TALENTS[number]['id'];
export const COATS = [
  { name: 'Biscuit', milestone: 1, color: '#e6ad73', accent: '#fff0d6', personality: 'Head of quality naps' },
  { name: 'Mochi', milestone: 10, color: '#f6eee1', accent: '#e1c2ae', personality: 'Softness specialist' },
  { name: 'Pepper', milestone: 50, color: '#716b78', accent: '#e6deeb', personality: 'Night shift supervisor' },
  { name: 'Peaches', milestone: 100, color: '#e8b1a1', accent: '#fff0dc', personality: 'Chief cuddle officer' },
  { name: 'Sage', milestone: 500, color: '#a9b5a0', accent: '#e5eed6', personality: 'Sustainability expert' },
  { name: 'Luna', milestone: 2000, color: '#b5a3cc', accent: '#efe8ff', personality: 'Dream department lead' },
] as const;
