export const StatusEffectType = {
  Buff: 'Buff',
  Debuff: 'Debuff',
} as const;
export type StatusEffectType = (typeof StatusEffectType)[keyof typeof StatusEffectType];

export type StatusTarget = 'Player' | 'Enemy' | 'Both';

export interface StatusEffect {
  id: string;
  name: string;
  type: StatusEffectType;
  appliesTo: StatusTarget;
  effect: string;
  duration: number | 'until_cleansed' | 'permanent';
  stackable: boolean;
  stackBehavior: string | null;
  visualCue: string;
}

/** An active status effect instance on a combatant */
export interface ActiveStatusEffect {
  statusId: string;
  stacks: number;
  remainingDuration: number | 'until_cleansed' | 'permanent';
}
