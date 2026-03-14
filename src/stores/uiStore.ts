import { create } from 'zustand';

export const Screen = {
  Title: 'Title',
  LoreIntro: 'LoreIntro',
  LoadoutSelect: 'LoadoutSelect',
  Map: 'Map',
  Combat: 'Combat',
  Shop: 'Shop',
  RestSite: 'RestSite',
  Event: 'Event',
  Reward: 'Reward',
  GameOver: 'GameOver',
  Victory: 'Victory',
} as const;
export type Screen = (typeof Screen)[keyof typeof Screen];

interface UIState {
  currentScreen: Screen;
  modalOpen: string | null;
  animating: boolean;
}

interface UIStore extends UIState {
  setScreen: (screen: Screen) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  setAnimating: (animating: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  currentScreen: Screen.Title,
  modalOpen: null,
  animating: false,

  setScreen: (screen) => set({ currentScreen: screen }),
  openModal: (modalId) => set({ modalOpen: modalId }),
  closeModal: () => set({ modalOpen: null }),
  setAnimating: (animating) => set({ animating }),
}));
