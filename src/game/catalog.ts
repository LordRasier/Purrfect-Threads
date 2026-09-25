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
] as const;
export type UpgradeId = typeof UPGRADES[number]['id'];
export const TALENTS = [
  { id: 'welcome', name: 'Welcome Home', detail: 'Start every new chapter with 3 cats.', cost: 1, icon: 'house' },
  { id: 'helping', name: 'Helping Paw', detail: 'Each touch also earns 1% of your yarn per second.', cost: 2, icon: 'paw' },
  { id: 'knitters', name: 'Master Knitters', detail: 'Unlock Master Tools to buy in every chapter.', cost: 3, icon: 'knit' },
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
