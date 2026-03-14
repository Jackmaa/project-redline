import { useState, useEffect, useCallback, useRef } from 'react';
import { useUIStore, Screen } from '../../stores/uiStore';
import './LoreIntro.css';

interface LoreFragment {
  text: string;
  highlights: Record<string, 'red' | 'dim'>;
}

const LORE_SEQUENCES: LoreFragment[] = [
  {
    text: '2096.\nThe global network is no longer called the internet.\nIt is known as The Black Grid.',
    highlights: { 'The Black Grid': 'red' },
  },
  {
    text: 'Deep inside its infrastructure lies a hidden architecture...\nThe Daemon Layer.\nSelf-replicating code entities.\nNobody knows who wrote the first one.',
    highlights: { 'The Daemon Layer': 'red' },
  },
  {
    text: 'When a cyberdeck overheats beyond safe thresholds,\nthe firmware disables all safety systems.\nRunners call this Redlining.',
    highlights: { 'Redlining': 'red' },
  },
  {
    text: 'During Redline:\nRAM spikes. Daemons mutate.\nICE behaves unpredictably.\nSometimes... the network answers back.',
    highlights: { 'Redline': 'red' },
  },
  {
    text: 'Many who crossed Redline never came back.\nSome say they became part of the Grid.',
    highlights: { 'Redline': 'red', 'the Grid': 'red' },
  },
  {
    text: 'You are a netrunner.\nYour mission: breach The Tower.',
    highlights: { 'The Tower': 'red' },
  },
];

const SEQUENCE_DURATION = 4200;
const FADE_DURATION = 800;
const CHAR_DELAY = 30;

function renderHighlightedText(text: string, highlights: Record<string, 'red' | 'dim'>): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    let earliestMatch: { term: string; index: number; type: 'red' | 'dim' } | null = null;

    for (const [term, type] of Object.entries(highlights)) {
      const idx = remaining.indexOf(term);
      if (idx !== -1 && (earliestMatch === null || idx < earliestMatch.index)) {
        earliestMatch = { term, index: idx, type };
      }
    }

    if (earliestMatch) {
      if (earliestMatch.index > 0) {
        parts.push(<span key={keyIdx++}>{remaining.slice(0, earliestMatch.index)}</span>);
      }
      parts.push(
        <span key={keyIdx++} className={`lore-highlight lore-highlight--${earliestMatch.type}`}>
          {earliestMatch.term}
        </span>
      );
      remaining = remaining.slice(earliestMatch.index + earliestMatch.term.length);
    } else {
      parts.push(<span key={keyIdx++}>{remaining}</span>);
      remaining = '';
    }
  }

  return parts;
}

export function LoreIntro() {
  const setScreen = useUIStore((s) => s.setScreen);
  const [currentSeq, setCurrentSeq] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'hold' | 'fadeout' | 'done'>('typing');
  const [visibleChars, setVisibleChars] = useState(0);
  const skipRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sequence = LORE_SEQUENCES[currentSeq];
  const fullText = sequence?.text ?? '';

  const advance = useCallback(() => {
    if (skipRef.current) return;
    if (currentSeq >= LORE_SEQUENCES.length - 1 && phase === 'fadeout') {
      setPhase('done');
      return;
    }
    if (phase === 'fadeout') {
      setCurrentSeq((s) => s + 1);
      setVisibleChars(0);
      setPhase('typing');
    }
  }, [currentSeq, phase]);

  const skipToEnd = useCallback(() => {
    skipRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    setScreen(Screen.LoadoutSelect);
  }, [setScreen]);

  // Typing effect
  useEffect(() => {
    if (phase !== 'typing') return;
    if (visibleChars >= fullText.length) {
      setPhase('hold');
      return;
    }
    const timer = setTimeout(() => {
      setVisibleChars((c) => c + 1);
    }, CHAR_DELAY);
    timerRef.current = timer;
    return () => clearTimeout(timer);
  }, [phase, visibleChars, fullText]);

  // Hold then fade
  useEffect(() => {
    if (phase !== 'hold') return;
    const holdTime = SEQUENCE_DURATION - fullText.length * CHAR_DELAY;
    const timer = setTimeout(() => setPhase('fadeout'), Math.max(holdTime, 1200));
    timerRef.current = timer;
    return () => clearTimeout(timer);
  }, [phase, fullText]);

  // Fade out then advance
  useEffect(() => {
    if (phase !== 'fadeout') return;
    const timer = setTimeout(advance, FADE_DURATION);
    timerRef.current = timer;
    return () => clearTimeout(timer);
  }, [phase, advance]);

  // Build visible text with proper line breaks
  const visibleText = fullText.slice(0, visibleChars);
  const highlightedContent = sequence
    ? renderHighlightedText(visibleText, sequence.highlights)
    : null;

  return (
    <div className="screen lore-screen" onClick={phase === 'done' ? () => setScreen(Screen.LoadoutSelect) : undefined}>
      <div className="lore-scanlines" aria-hidden="true" />

      {/* Skip button — always visible */}
      <button className="lore-skip" onClick={skipToEnd}>
        SKIP
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2 2l8 4-8 4z" fill="currentColor" />
        </svg>
      </button>

      {/* Sequence counter */}
      <div className="lore-counter">
        {String(currentSeq + 1).padStart(2, '0')}/{String(LORE_SEQUENCES.length).padStart(2, '0')}
      </div>

      {/* Text content */}
      {phase !== 'done' && (
        <div className={`lore-text-container ${phase === 'fadeout' ? 'lore-text-container--fadeout' : ''}`}>
          <p className="lore-text">
            {highlightedContent}
            <span className="lore-cursor" aria-hidden="true">_</span>
          </p>
        </div>
      )}

      {/* Final prompt */}
      {phase === 'done' && (
        <div className="lore-final">
          <p className="lore-final-text">
            <span className="lore-highlight lore-highlight--red">PROTOCOL: REDLINE</span>
          </p>
          <button className="lore-continue" onClick={() => setScreen(Screen.LoadoutSelect)}>
            TAP TO CONTINUE
          </button>
        </div>
      )}
    </div>
  );
}
