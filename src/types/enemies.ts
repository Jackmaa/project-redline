import type { Act } from './map';

export const EnemyCategory = {
  StreetLevel: 'StreetLevel',
  ICE: 'ICE',
  Netrunner: 'Netrunner',
  Cyborg: 'Cyborg',
  RogueAI: 'RogueAI',
} as const;
export type EnemyCategory = (typeof EnemyCategory)[keyof typeof EnemyCategory];

export const ThreatTier = {
  Unknown: 'Unknown',
  Recognized: 'Recognized',
  Analyzed: 'Analyzed',
  Decoded: 'Decoded',
} as const;
export type ThreatTier = (typeof ThreatTier)[keyof typeof ThreatTier];

export interface EnemyAbility {
  name: string;
  effect: string;
  ramCost: number;
  /** Threat tier required for the player to see this ability */
  revealedAtTier: ThreatTier;
}

export interface Enemy {
  id: string;
  name: string;
  category: EnemyCategory;
  act: Act | 'any';
  integrity: number;
  maxIntegrity: number;
  ram: number;
  heatBehavior: string;
  intentPattern: string;
  abilities: EnemyAbility[];
  flavorText: string;
}

export interface BossPhase {
  name: string;
  integrityThreshold: number;
  intentPattern: string;
  abilities: EnemyAbility[];
}

export interface Boss extends Omit<Enemy, 'intentPattern' | 'abilities'> {
  phases: BossPhase[];
  uniqueMechanic: string;
}
