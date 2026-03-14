import { create } from 'zustand';
import type { Card } from '../types/cards';
import type { Relic } from '../types/relics';
import type { Cyberdeck } from '../types/cyberdecks';
import { Act } from '../types/map';
import type { GameMap } from '../types/map';

interface RunState {
  active: boolean;
  currentAct: Act;
  map: GameMap | null;
  currentNodeId: string | null;
  deck: Card[];
  relics: Relic[];
  credits: number;
  cyberdeck: Cyberdeck | null;
  integrity: number;
  maxIntegrity: number;
}

interface RunStore extends RunState {
  startRun: (cyberdeck: Cyberdeck, starterDeck: Card[]) => void;
  endRun: () => void;
  setMap: (map: GameMap) => void;
  moveToNode: (nodeId: string) => void;
  addCardToDeck: (card: Card) => void;
  removeCardFromDeck: (cardId: string) => void;
  addRelic: (relic: Relic) => void;
  addCredits: (amount: number) => void;
  spendCredits: (amount: number) => void;
  setIntegrity: (value: number) => void;
  advanceAct: () => void;
}

const initialRunState: RunState = {
  active: false,
  currentAct: Act.TheStreets,
  map: null,
  currentNodeId: null,
  deck: [],
  relics: [],
  credits: 0,
  cyberdeck: null,
  integrity: 0,
  maxIntegrity: 0,
};

export const useRunStore = create<RunStore>((set) => ({
  ...initialRunState,

  startRun: (cyberdeck, starterDeck) =>
    set({
      active: true,
      currentAct: Act.TheStreets,
      map: null,
      currentNodeId: null,
      deck: starterDeck,
      relics: [],
      credits: 0,
      cyberdeck,
      // TODO: starting integrity TBD in game design
      integrity: 0,
      maxIntegrity: 0,
    }),

  endRun: () => set(initialRunState),

  setMap: (map) => set({ map }),

  moveToNode: (nodeId) => set({ currentNodeId: nodeId }),

  addCardToDeck: (card) =>
    set((s) => ({ deck: [...s.deck, card] })),

  removeCardFromDeck: (cardId) =>
    set((s) => ({ deck: s.deck.filter((c) => c.id !== cardId) })),

  addRelic: (relic) =>
    set((s) => ({ relics: [...s.relics, relic] })),

  addCredits: (amount) =>
    set((s) => ({ credits: s.credits + amount })),

  spendCredits: (amount) =>
    set((s) => ({ credits: s.credits - amount })),

  setIntegrity: (value) =>
    set({ integrity: value }),

  advanceAct: () =>
    set((s) => ({
      currentAct: Math.min(s.currentAct + 1, Act.TheTower) as Act,
    })),
}));
