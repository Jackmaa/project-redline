export const RelicRarity = {
  Common: 'Common',
  Uncommon: 'Uncommon',
  Rare: 'Rare',
} as const;
export type RelicRarity = (typeof RelicRarity)[keyof typeof RelicRarity];

export const DropSource = {
  Elite: 'Elite',
  Event: 'Event',
  Shop: 'Shop',
  Boss: 'Boss',
} as const;
export type DropSource = (typeof DropSource)[keyof typeof DropSource];

export interface Relic {
  id: string;
  name: string;
  rarity: RelicRarity;
  effect: string;
  dropSource: DropSource;
  flavorText: string;
}
