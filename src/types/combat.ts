import type { Card, ProgramCard, GearCard, DaemonCard } from './cards';
import type { Enemy } from './enemies';
import type { PlayerResources } from './player';
import type { ActiveStatusEffect } from './status-effects';

export interface CombatEnemy extends Enemy {
  firewall: number;
  heat: number;
  currentIntent: string | null;
  statusEffects: ActiveStatusEffect[];
  uploadedDaemons: DaemonCard[];
}

export const TurnPhase = {
  DrawPhase: 'DrawPhase',
  PlayerAction: 'PlayerAction',
  EnemyTurn: 'EnemyTurn',
  TurnEnd: 'TurnEnd',
} as const;
export type TurnPhase = (typeof TurnPhase)[keyof typeof TurnPhase];

export interface CombatState {
  player: PlayerResources;
  playerStatusEffects: ActiveStatusEffect[];
  enemies: CombatEnemy[];
  hand: Card[];
  drawPile: Card[];
  discardPile: Card[];
  exhaustPile: Card[];
  installedPrograms: ProgramCard[];
  activeGear: GearCard[];
  turnNumber: number;
  turnPhase: TurnPhase;
}
