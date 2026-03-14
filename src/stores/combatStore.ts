import { create } from 'zustand';
import type { CombatState, TurnPhase } from '../types/combat';

interface CombatStore {
  combat: CombatState | null;

  // Actions — shells only, logic lives in game/
  startCombat: (initialState: CombatState) => void;
  endCombat: () => void;
  setCombat: (state: CombatState) => void;
  setTurnPhase: (phase: TurnPhase) => void;
}

export const useCombatStore = create<CombatStore>((set) => ({
  combat: null,

  startCombat: (initialState) => set({ combat: initialState }),
  endCombat: () => set({ combat: null }),
  setCombat: (state) => set({ combat: state }),
  setTurnPhase: (phase) =>
    set((s) => {
      if (!s.combat) return s;
      return { combat: { ...s.combat, turnPhase: phase } };
    }),
}));
