import { create } from 'zustand';
import type { Implant } from '../types/implants';
import type { BodySlot } from '../types/implants';
import type { ThreatTier } from '../types/enemies';

interface ThreatEntry {
  enemyId: string;
  tier: ThreatTier;
}

interface MetaState {
  cred: number;
  rep: number;
  unlockedImplants: Implant[];
  equippedLoadout: Map<BodySlot, Implant>;
  threatDatabase: ThreatEntry[];
}

interface MetaStore extends MetaState {
  addCred: (amount: number) => void;
  spendCred: (amount: number) => void;
  setRep: (level: number) => void;
  unlockImplant: (implant: Implant) => void;
  equipImplant: (slot: BodySlot, implant: Implant) => void;
  unequipImplant: (slot: BodySlot) => void;
  updateThreatTier: (enemyId: string, tier: ThreatTier) => void;
}

export const useMetaStore = create<MetaStore>((set) => ({
  cred: 0,
  rep: 0,
  unlockedImplants: [],
  equippedLoadout: new Map(),
  threatDatabase: [],

  addCred: (amount) =>
    set((s) => ({ cred: s.cred + amount })),

  spendCred: (amount) =>
    set((s) => ({ cred: s.cred - amount })),

  setRep: (level) =>
    set({ rep: level }),

  unlockImplant: (implant) =>
    set((s) => ({
      unlockedImplants: [...s.unlockedImplants, implant],
    })),

  equipImplant: (slot, implant) =>
    set((s) => {
      const next = new Map(s.equippedLoadout);
      next.set(slot, implant);
      return { equippedLoadout: next };
    }),

  unequipImplant: (slot) =>
    set((s) => {
      const next = new Map(s.equippedLoadout);
      next.delete(slot);
      return { equippedLoadout: next };
    }),

  updateThreatTier: (enemyId, tier) =>
    set((s) => {
      const existing = s.threatDatabase.find((e) => e.enemyId === enemyId);
      if (existing) {
        return {
          threatDatabase: s.threatDatabase.map((e) =>
            e.enemyId === enemyId ? { ...e, tier } : e
          ),
        };
      }
      return {
        threatDatabase: [...s.threatDatabase, { enemyId, tier }],
      };
    }),
}));
