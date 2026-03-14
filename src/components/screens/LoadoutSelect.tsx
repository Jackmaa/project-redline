import { useState, useRef, useEffect, useCallback } from 'react';
import { useUIStore, Screen } from '../../stores/uiStore';
import { useRunStore } from '../../stores/runStore';
import { CYBERDECKS } from '../../data/cyberdecks';
import type { Cyberdeck } from '../../types/cyberdecks';
import './LoadoutSelect.css';

/* ─── Inline SVG stat icons ─── */

function IconRam() {
  return (
    <svg className="stat-icon" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <polygon points="7,1 12.5,4 12.5,10 7,13 1.5,10 1.5,4" fill="none" stroke="currentColor" strokeWidth="1" />
      <line x1="4.5" y1="6" x2="4.5" y2="9" stroke="currentColor" strokeWidth="1.2" />
      <line x1="7" y1="5" x2="7" y2="9" stroke="currentColor" strokeWidth="1.2" />
      <line x1="9.5" y1="6" x2="9.5" y2="9" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function IconMem() {
  return (
    <svg className="stat-icon" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <rect x="3" y="2" width="8" height="3" rx="0.5" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="3" y="5.5" width="8" height="3" rx="0.5" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="3" y="9" width="8" height="3" rx="0.5" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function IconUpload() {
  return (
    <svg className="stat-icon" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M7 9.5V5M5 7l2-2 2 2" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
    </svg>
  );
}

function IconGear() {
  return (
    <svg className="stat-icon" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <circle cx="7" cy="7" r="2.5" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.76 2.76l1.06 1.06M10.18 10.18l1.06 1.06M11.24 2.76l-1.06 1.06M3.82 10.18l-1.06 1.06" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
}

function IconDraw() {
  return (
    <svg className="stat-icon" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <rect x="4" y="3" width="6" height="8" rx="0.5" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="2.5" y="4" width="6" height="8" rx="0.5" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5" />
      <rect x="5.5" y="2" width="6" height="8" rx="0.5" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.5" />
    </svg>
  );
}

function IconHeatSink() {
  return (
    <svg className="stat-icon" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M4 3v8M7 3v8M10 3v8" stroke="currentColor" strokeWidth="1" />
      <path d="M4 8l-1.5 2M7 8l-1.5 2M10 8l-1.5 2M4 8l1.5 2M7 8l1.5 2M10 8l1.5 2" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
    </svg>
  );
}

function IconBack() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M11 4L6 9l5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}

function IconTrait() {
  return (
    <svg className="trait-icon" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <polygon points="6,1 7.5,4 11,4.5 8.5,7 9,10.5 6,9 3,10.5 3.5,7 1,4.5 4.5,4" fill="none" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
}

/* ─── Color mapping per deck ─── */

const DECK_ACCENT: Record<string, { color: string; glow: string; bg: string }> = {
  'vanta-0': {
    color: '#8888a0',
    glow: '0 0 8px rgba(136,136,160,0.2)',
    bg: 'rgba(136,136,160,0.04)',
  },
  ghostdeck: {
    color: '#cc44ff',
    glow: '0 0 8px rgba(204,68,255,0.3), 0 0 20px rgba(204,68,255,0.1)',
    bg: 'rgba(204,68,255,0.04)',
  },
  'helios-mk4': {
    color: '#00d4ff',
    glow: '0 0 8px rgba(0,212,255,0.3), 0 0 20px rgba(0,212,255,0.1)',
    bg: 'rgba(0,212,255,0.04)',
  },
};

/* ─── Stat row component ─── */

function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="stat-row">
      <span className="stat-label-group">
        {icon}
        <span className="stat-label">{label}</span>
      </span>
      <span className="stat-value">{value}</span>
    </div>
  );
}

/* ─── Deck card component ─── */

function DeckCard({ deck, isActive }: { deck: Cyberdeck; isActive: boolean }) {
  const accent = DECK_ACCENT[deck.id] ?? DECK_ACCENT['vanta-0'];

  return (
    <article
      className={`deck-card ${isActive ? 'deck-card--active' : ''}`}
      style={{
        '--deck-accent': accent.color,
        '--deck-glow': accent.glow,
        '--deck-bg': accent.bg,
      } as React.CSSProperties}
    >
      {/* Corner accents */}
      <div className="deck-corner deck-corner--tl" aria-hidden="true" />
      <div className="deck-corner deck-corner--br" aria-hidden="true" />

      <header className="deck-header">
        <h2 className="deck-name">{deck.name}</h2>
        <span className="deck-playstyle">{deck.playstyle}</span>
      </header>

      <div className="deck-divider" />

      <div className="deck-stats">
        <StatRow icon={<IconRam />} label="RAM" value={deck.baseRam} />
        <StatRow icon={<IconMem />} label="MEM" value={deck.memorySlots} />
        <StatRow icon={<IconUpload />} label="UPLOAD" value={deck.uploadSlots} />
        <StatRow icon={<IconGear />} label="GEAR" value={deck.gearSlots} />
        <StatRow icon={<IconDraw />} label="DRAW" value={deck.drawCount} />
        <StatRow icon={<IconHeatSink />} label="SINK" value={deck.heatSink} />
      </div>

      {deck.trait && (
        <>
          <div className="deck-divider" />
          <div className="deck-trait">
            <span className="deck-trait-label">
              <IconTrait />
              HARDWARE TRAIT
            </span>
            <p className="deck-trait-text">{deck.trait}</p>
          </div>
        </>
      )}

      <div className="deck-flavor">
        <p>{deck.flavorText}</p>
      </div>
    </article>
  );
}

/* ─── Main component ─── */

export function LoadoutSelect() {
  const setScreen = useUIStore((s) => s.setScreen);
  const startRun = useRunStore((s) => s.startRun);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleInitialize = useCallback(() => {
    const selectedDeck = CYBERDECKS[activeIndex];
    startRun(selectedDeck, []);
    setScreen(Screen.Map);
  }, [setScreen, startRun, activeIndex]);

  // Track which card is centered via IntersectionObserver
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const idx = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(idx)) setActiveIndex(idx);
          }
        }
      },
      { root: scrollEl, threshold: 0.6 }
    );

    const cards = scrollEl.querySelectorAll('.deck-card-wrapper');
    cards.forEach((card) => observerRef.current?.observe(card));

    return () => observerRef.current?.disconnect();
  }, []);

  // Scroll to a specific card when dots are tapped
  const scrollToIndex = useCallback((idx: number) => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    const card = scrollEl.children[idx] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, []);

  const activeDeck = CYBERDECKS[activeIndex];
  const accent = DECK_ACCENT[activeDeck.id] ?? DECK_ACCENT['vanta-0'];

  return (
    <div className="screen loadout-screen">
      {/* Header */}
      <header className="loadout-header">
        <button className="loadout-back" onClick={() => setScreen(Screen.Title)}>
          <IconBack />
        </button>
        <div className="loadout-title-group">
          <span className="loadout-label">SELECT CYBERDECK</span>
          <span className="loadout-sublabel">{String(activeIndex + 1).padStart(2, '0')}/{String(CYBERDECKS.length).padStart(2, '0')}</span>
        </div>
        <div className="loadout-header-spacer" />
      </header>

      {/* Scrollable deck cards */}
      <div className="deck-scroll" ref={scrollRef}>
        {CYBERDECKS.map((deck, i) => (
          <div className="deck-card-wrapper" key={deck.id} data-index={i}>
            <DeckCard deck={deck} isActive={i === activeIndex} />
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="deck-dots">
        {CYBERDECKS.map((deck, i) => {
          const dotAccent = DECK_ACCENT[deck.id] ?? DECK_ACCENT['vanta-0'];
          return (
            <button
              key={deck.id}
              className={`deck-dot ${i === activeIndex ? 'deck-dot--active' : ''}`}
              style={{ '--dot-color': dotAccent.color } as React.CSSProperties}
              onClick={() => scrollToIndex(i)}
              aria-label={`Select ${deck.name}`}
            />
          );
        })}
      </div>

      {/* Initialize button */}
      <div className="loadout-action">
        <button
          className="loadout-init-btn"
          style={{ '--init-accent': accent.color, '--init-glow': accent.glow } as React.CSSProperties}
          onClick={handleInitialize}
        >
          <svg className="init-icon" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M3 7h5M6.5 4.5L9 7l-2.5 2.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="square" />
          </svg>
          INITIALIZE
        </button>
      </div>
    </div>
  );
}
