export const CardType = {
  Script: 'Script',
  Program: 'Program',
  Daemon: 'Daemon',
  Gear: 'Gear',
} as const;
export type CardType = (typeof CardType)[keyof typeof CardType];

export const CardRarity = {
  Starter: 'Starter',
  Common: 'Common',
  Uncommon: 'Uncommon',
  Rare: 'Rare',
} as const;
export type CardRarity = (typeof CardRarity)[keyof typeof CardRarity];

/** Fields shared by all card types */
interface BaseCard {
  id: string;
  name: string;
  rarity: CardRarity;
  ramCost: number;
  heatGenerated: number;
  effect: string;
  upgradeEffect: string;
  flavorText: string;
  upgraded: boolean;
}

export interface ScriptCard extends BaseCard {
  type: typeof CardType.Script;
}

export interface ProgramCard extends BaseCard {
  type: typeof CardType.Program;
  memorySlotsUsed: number;
  trigger: string;
}

export interface DaemonCard extends BaseCard {
  type: typeof CardType.Daemon;
  ticks: number | 'until_cleansed';
  perTickEffect: string;
  onExpireEffect: string | null;
}

export interface GearCard extends BaseCard {
  type: typeof CardType.Gear;
  gearSlotsUsed: number;
}

/** Discriminated union of all card types */
export type Card = ScriptCard | ProgramCard | DaemonCard | GearCard;
