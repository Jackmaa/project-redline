export const BodySlot = {
  Eyes: 'Eyes',
  Neural: 'Neural',
  Arms: 'Arms',
  Spine: 'Spine',
  Legs: 'Legs',
  Torso: 'Torso',
} as const;
export type BodySlot = (typeof BodySlot)[keyof typeof BodySlot];

export const ImplantRarity = {
  Common: 'Common',
  Uncommon: 'Uncommon',
  Rare: 'Rare',
  Epic: 'Epic',
  Legendary: 'Legendary',
  Mythic: 'Mythic',
} as const;
export type ImplantRarity = (typeof ImplantRarity)[keyof typeof ImplantRarity];

export interface Implant {
  id: string;
  name: string;
  bodySlot: BodySlot;
  rarity: ImplantRarity;
  loadCost: number;
  effect: string;
  tradeOff: string | null;
  unlockMethod: string;
  flavorText: string;
}
