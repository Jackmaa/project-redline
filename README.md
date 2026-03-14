# PROTOCOL: REDLINE

A cyberpunk roguelike deck-builder for Android.

> *When your heat hits 90, the system stops protecting you.*

## What Is This

You are a netrunner navigating The Black Grid -- a hidden network layer crawling with daemons, rogue AIs, and corporate ICE. Build a deck of Scripts, Programs, Daemons, and Gear. Push your cyberdeck to its thermal limits. Breach The Tower.

## Tech Stack

- **React 19 + TypeScript** -- UI framework
- **Zustand** -- state management
- **Vite** -- build tool
- **Canvas** -- map rendering
- **Capacitor** -- Android wrapper (not yet configured)

No game frameworks. No drag libraries. No Redux.

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in Chrome DevTools mobile emulation.

## Project Structure

```
src/
  components/screens/   Implemented screens (Title, Lore, Loadout, Map)
  components/cards/     Card rendering (empty -- content not yet designed)
  components/combat/    Combat screen (empty)
  components/map/       Map components (empty)
  components/ui/        Shared UI primitives (empty)
  components/icons/     SVG icon components (empty)
  game/                 Pure game logic -- no React imports
    map/                Map generation algorithm
    combat/             Combat engine (empty)
    cards/              Card effect resolution (empty)
    enemies/            Enemy AI (empty)
    systems/            Heat, RAM, resource calculations (empty)
  stores/               Zustand stores (combat, run, meta, UI)
  types/                TypeScript type definitions for all entities
  data/                 Static game data (cyberdecks defined, cards TBD)
  canvas/               Canvas rendering (map renderer)
```

### Key Separation

`game/` contains pure logic (testable without React). `components/` is UI. `stores/` bridges them via Zustand.

## Screens Implemented

1. **Title Screen** -- Boot sequence animation, PROTOCOL: REDLINE branding
2. **Lore Intro** -- Typewriter text crawl introducing The Black Grid
3. **Loadout Select** -- Horizontal snap-scroll cyberdeck picker (3 decks)
4. **Map Screen** -- Canvas-rendered StS-style branching path (Act 1: The Streets)

## Game Systems (Typed, Not Yet Implemented)

- **4 Card Types**: Script (instant), Program (persistent), Daemon (enemy DoT), Gear (temp equipment)
- **Heat System**: Safe (0-40), Overclocked (40-70), Redline (70-90), Crash (90+)
- **Resources**: Integrity (HP), RAM (energy), Firewall (block), Credits (currency)
- **Meta Progression**: Cred (XP), Rep (level), permanent Implants, per-run Relics
- **Enemies**: Same resource systems as player (RAM, heat, can crash)
- **Threat Database**: Unknown / Recognized / Analyzed / Decoded

## Design Documents

- `GAME_DESIGN.md` -- Single source of truth for all game mechanics
- `CLAUDE.md` -- Implementation rules and coding conventions
- `.design/` -- Entity templates and design workflows (cards, enemies, bosses, etc.)
- `protocol_redline.md` -- Full lore, factions, card concepts, enemy rosters, archetypes

## Scripts

```bash
npm run dev       # Start dev server
npm run build     # TypeScript check + production build
npm run lint      # ESLint
npm run preview   # Preview production build
```
