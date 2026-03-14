import type { Act } from './map';

export interface EventChoice {
  text: string;
  outcome: string;
  risk: string;
}

export interface MiniGame {
  type: string;
  rules: string;
  rewardScaling: string;
}

export interface GameEvent {
  id: string;
  name: string;
  act: Act | 'any';
  description: string;
  choices: EventChoice[];
  miniGame: MiniGame | null;
}
