export const PRODUCERS = [
  { id: 'kitten', name: 'Kitten', detail: 'A tiny pair of helping paws.', cost: 15, cats: 1, icon: 'cat', color: 'peach' },
  { id: 'basket', name: 'Cat Basket', detail: 'Eight roommates. One big yarn habit.', cost: 150, cats: 8, icon: 'basket', color: 'sage' },
  { id: 'corner', name: 'Knitting Corner', detail: 'A cozy corner for a creative crew.', cost: 1500, cats: 50, icon: 'knit', color: 'lilac' },
  { id: 'workshop', name: 'Yarn Workshop', detail: 'Little paws. Serious production.', cost: 15000, cats: 300, icon: 'house', color: 'sand' },
  { id: 'factory', name: 'Cloud Factory', detail: 'A whole new level of fluffy.', cost: 150000, cats: 2000, icon: 'cloud', color: 'blue' },
] as const;
export type ProducerId = typeof PRODUCERS[number]['id'];

export const UPGRADES = [
  { id: 'paws', name: 'Soft Paws', detail: 'Twice the yarn with every touch.', cost: 100, icon: 'paw' },
  { id: 'happy', name: 'Happy Workers', detail: '+50% yarn from all your cats.', cost: 1000, icon: 'heart' },
  { id: 'tools', name: 'Better Tools', detail: 'Double all automatic production.', cost: 10000, icon: 'knit' },
  { id: 'master', name: 'Master Tools', detail: 'Double Workshop & Cloud Factory output.', cost: 25000, icon: 'star' },
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
