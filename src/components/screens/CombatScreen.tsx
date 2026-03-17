import { useState } from 'react';
import { useUIStore, Screen } from '../../stores/uiStore';
import './CombatScreen.css';

/* ═══════════════════════════════════════════════════════
   MOCK DATA — hardcoded for UI prototyping
   ═══════════════════════════════════════════════════════ */

const MOCK_PLAYER = {
  integrity: 28,
  maxIntegrity: 40,
  ram: 2,
  maxRam: 3,
  heat: 35,
  firewall: 6,
};

interface MockEnemy {
  id: string;
  name: string;
  sprite: string;
  integrity: number;
  maxIntegrity: number;
  firewall: number;
  heat: number;
  ram: number;
  maxRam: number;
  intent: { type: 'attack' | 'drain' | 'firewall' | 'buff'; value: number; label?: string };
  category: string;
  statusEffects: { name: string; stacks: number; color: string }[];
  uploadedDaemons: { name: string; ticksLeft: number }[];
  threatTier: 'Unknown' | 'Recognized' | 'Analyzed' | 'Decoded';
}

const MOCK_ENEMIES: MockEnemy[] = [
  {
    id: 'enemy-1',
    name: 'Script Kiddy',
    sprite: '/assets/Sprites/ScriptKiddy.png',
    integrity: 18,
    maxIntegrity: 24,
    firewall: 0,
    heat: 12,
    ram: 2,
    maxRam: 2,
    intent: { type: 'attack', value: 6 },
    category: 'StreetLevel',
    statusEffects: [],
    uploadedDaemons: [{ name: 'RAM Siphon', ticksLeft: 2 }],
    threatTier: 'Recognized',
  },
  {
    id: 'enemy-2',
    name: 'Data Leech',
    sprite: '/assets/Sprites/Data_Leech.png',
    integrity: 30,
    maxIntegrity: 30,
    firewall: 4,
    heat: 45,
    ram: 3,
    maxRam: 3,
    intent: { type: 'drain', value: 4, label: 'RAM' },
    category: 'ICE',
    statusEffects: [{ name: 'VULN', stacks: 2, color: '#ff6600' }],
    uploadedDaemons: [],
    threatTier: 'Unknown',
  },
];

interface MockCard {
  id: string;
  name: string;
  type: 'Script' | 'Program' | 'Daemon' | 'Gear';
  ramCost: number;
  heatGenerated: number;
  effect: string;
  sprite: string;
  flavorText: string;
  meta?: string;
}

const MOCK_HAND: MockCard[] = [
  {
    id: 'card-1',
    name: 'Ping Spike',
    type: 'Script',
    ramCost: 1,
    heatGenerated: 0,
    effect: 'Deal 6 damage',
    sprite: '/assets/Sprites/PingSpike_card.png',
    flavorText: 'A single packet, surgically aimed.',
  },
  {
    id: 'card-2',
    name: 'Packet Storm',
    type: 'Script',
    ramCost: 2,
    heatGenerated: 8,
    effect: 'Deal 12 damage to all enemies',
    sprite: '/assets/Sprites/PacketStorm.png',
    flavorText: 'Flood the bus. Fry everything.',
  },
  {
    id: 'card-3',
    name: 'RAM Siphon',
    type: 'Daemon',
    ramCost: 1,
    heatGenerated: 0,
    effect: 'Drain 1 RAM per tick',
    sprite: '/assets/Sprites/RAMSiphon.png',
    flavorText: 'It feeds while they sleep.',
    meta: '3 TICKS',
  },
  {
    id: 'card-4',
    name: 'Thermal Reg',
    type: 'Gear',
    ramCost: 1,
    heatGenerated: 0,
    effect: 'Reduce heat gain by 50%',
    sprite: '/assets/Sprites/ThermalRegulator.png',
    flavorText: 'Corporate cooling. Stolen, of course.',
    meta: '1 GEAR',
  },
  {
    id: 'card-5',
    name: 'Ghost RAM',
    type: 'Program',
    ramCost: 2,
    heatGenerated: 4,
    effect: '+1 RAM at start of turn',
    sprite: '/assets/Sprites/GhostRAM.png',
    flavorText: 'Memory that doesn\'t exist — until you need it.',
    meta: '1 MEM',
  },
];

const MOCK_ACTIVE_PROGRAMS = [
  { id: 'prog-1', name: 'Firewall Daemon v2', shortName: 'FW.D v2', effect: 'Gain 3 Firewall at start of turn', type: 'Program' as const },
];

const MOCK_COMBAT_LOG = [
  { id: 1, text: '> RAM Siphon drains 1 RAM from Script Kiddy', color: 'var(--neon-magenta)' },
  { id: 2, text: '> Firewall Daemon v2 generates 3 Firewall', color: 'var(--neon-cyan)' },
  { id: 3, text: '> Script Kiddy intends to Attack for 6', color: 'var(--neon-red)' },
  { id: 4, text: '> Data Leech intends to Drain 4 RAM', color: 'var(--neon-yellow)' },
  { id: 5, text: '> Turn 3 begins. Draw 5 cards.', color: 'var(--text-dim)' },
];

const CARD_TYPE_COLOR: Record<string, string> = {
  Script: '#00d4ff',
  Program: '#00ff9f',
  Daemon: '#ff00aa',
  Gear: '#ffee00',
};

const CARD_TYPE_GLOW: Record<string, string> = {
  Script: '0 0 8px rgba(0,212,255,0.25), 0 0 20px rgba(0,212,255,0.08)',
  Program: '0 0 8px rgba(0,255,159,0.25), 0 0 20px rgba(0,255,159,0.08)',
  Daemon: '0 0 8px rgba(255,0,170,0.25), 0 0 20px rgba(255,0,170,0.08)',
  Gear: '0 0 8px rgba(255,238,0,0.25), 0 0 20px rgba(255,238,0,0.08)',
};

/* ═══════════════════════════════════════════════════════
   SVG ICON COMPONENTS
   ═══════════════════════════════════════════════════════ */

function IconAttack() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 13L13 3M13 3H7M13 3v6" fill="none" stroke="var(--neon-red)" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}

function IconDrain() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="5.5" fill="none" stroke="var(--neon-magenta)" strokeWidth="1" />
      <path d="M8 5v6M5 8l3 3 3-3" fill="none" stroke="var(--neon-magenta)" strokeWidth="1.2" strokeLinecap="square" />
    </svg>
  );
}

function IconFirewallIntent() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M7 1L2 3.5v4C2 10.5 4.2 12.5 7 13c2.8-.5 5-2.5 5-5.5v-4L7 1z" fill="rgba(0,212,255,0.15)" stroke="var(--neon-cyan)" strokeWidth="1" />
    </svg>
  );
}

function IconFirewallSmall() {
  return (
    <svg width="7" height="7" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M7 1L2 3.5v4C2 10.5 4.2 12.5 7 13c2.8-.5 5-2.5 5-5.5v-4L7 1z" fill="rgba(0,212,255,0.3)" stroke="var(--neon-cyan)" strokeWidth="1.5" />
    </svg>
  );
}

function IconDrawPile() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <rect x="3" y="2" width="8" height="10" rx="0.5" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="1.5" y="3" width="8" height="10" rx="0.5" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
      <line x1="5" y1="5" x2="9" y2="5" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
      <line x1="5" y1="7" x2="9" y2="7" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
    </svg>
  );
}

function IconDiscard() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <rect x="3" y="2" width="8" height="10" rx="0.5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <path d="M5 5l4 4M9 5L5 9" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
    </svg>
  );
}

function IconExhaust() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <rect x="3" y="2" width="8" height="10" rx="0.5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <path d="M5 7h4M7 4v1" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
    </svg>
  );
}

function IconIntegrity() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <polygon points="6,1 11,4 11,8 6,11 1,8 1,4" fill="none" stroke="var(--neon-red)" strokeWidth="1" />
      <polygon points="6,3.5 8.5,5 8.5,7 6,8.5 3.5,7 3.5,5" fill="var(--neon-red)" opacity="0.3" />
    </svg>
  );
}

function IconHeat() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M6 1c0 2-3 3-3 6a3.5 3.5 0 007 0c0-3-3-4-3-6z" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M6 7v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconRamPip({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <polygon
        points="7,1 12.5,4 12.5,10 7,13 1.5,10 1.5,4"
        fill={filled ? 'var(--neon-cyan)' : 'transparent'}
        stroke={filled ? 'var(--neon-cyan)' : 'var(--border-dim)'}
        strokeWidth="1"
        opacity={filled ? 1 : 0.5}
      />
    </svg>
  );
}

function IconRamPipSmall({ filled }: { filled: boolean }) {
  return (
    <svg width="8" height="8" viewBox="0 0 14 14" aria-hidden="true">
      <polygon
        points="7,1 12.5,4 12.5,10 7,13 1.5,10 1.5,4"
        fill={filled ? 'var(--neon-cyan)' : 'transparent'}
        stroke={filled ? 'var(--neon-cyan)' : 'var(--border-dim)'}
        strokeWidth="1.5"
        opacity={filled ? 1 : 0.4}
      />
    </svg>
  );
}

function IconProgram() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <rect x="1.5" y="2" width="9" height="8" rx="0.5" fill="none" stroke="var(--neon-green)" strokeWidth="0.8" />
      <circle cx="6" cy="6" r="1.5" fill="var(--neon-green)" opacity="0.5" />
    </svg>
  );
}

function IconEndTurn() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M3 7h6M7 4.5L10 7 7 9.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="square" />
      <path d="M10 3v8" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

function IconMap() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M2 3l3.5 1.5v7L2 10V3zM5.5 4.5L9 3v7l-3.5 1.5V4.5zM9 3l3 1.5v7L9 10V3z" fill="none" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 4l8 8M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}

function IconDaemon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <circle cx="5" cy="5" r="3.5" fill="none" stroke="var(--neon-magenta)" strokeWidth="0.8" />
      <path d="M5 2.5v5M3 5h4" stroke="var(--neon-magenta)" strokeWidth="0.6" />
    </svg>
  );
}

function IconThreatTier({ tier }: { tier: string }) {
  const fills = tier === 'Decoded' ? 4 : tier === 'Analyzed' ? 3 : tier === 'Recognized' ? 2 : 1;
  return (
    <svg width="20" height="8" viewBox="0 0 20 8" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={i * 5}
          y={0}
          width="4"
          height="8"
          fill={i < fills ? 'var(--neon-cyan)' : 'var(--border-dim)'}
          opacity={i < fills ? 0.8 : 0.3}
        />
      ))}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   CARD TYPE ICON SVGs
   ═══════════════════════════════════════════════════════ */

function CardTypeIcon({ type }: { type: string }) {
  const color = CARD_TYPE_COLOR[type] ?? 'var(--text-dim)';
  switch (type) {
    case 'Script':
      return (
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M2 8L5 2l3 6" fill="none" stroke={color} strokeWidth="1" strokeLinecap="square" />
        </svg>
      );
    case 'Program':
      return (
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <rect x="1.5" y="1.5" width="7" height="7" fill="none" stroke={color} strokeWidth="1" />
          <circle cx="5" cy="5" r="1.5" fill={color} opacity="0.6" />
        </svg>
      );
    case 'Daemon':
      return (
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <circle cx="5" cy="5" r="3.5" fill="none" stroke={color} strokeWidth="1" />
          <path d="M5 2.5v5M3 5h4" stroke={color} strokeWidth="0.7" />
        </svg>
      );
    case 'Gear':
      return (
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <polygon points="5,0.5 9.5,5 5,9.5 0.5,5" fill="none" stroke={color} strokeWidth="1" />
        </svg>
      );
    default:
      return null;
  }
}

/* ═══════════════════════════════════════════════════════
   HEAT ZONE HELPERS
   ═══════════════════════════════════════════════════════ */

function getHeatColor(heat: number): string {
  if (heat >= 90) return 'var(--heat-crash)';
  if (heat >= 70) return 'var(--heat-redline)';
  if (heat >= 40) return 'var(--heat-overclocked)';
  return 'var(--heat-safe)';
}

function getHeatZoneLabel(heat: number): string {
  if (heat >= 90) return 'CRASH';
  if (heat >= 70) return 'REDLINE';
  if (heat >= 40) return 'OVERCLOCK';
  return 'SAFE';
}

/* ═══════════════════════════════════════════════════════
   INTEGRITY + FIREWALL BAR (shared component)
   Firewall fills AFTER integrity, computed as effective HP
   ═══════════════════════════════════════════════════════ */

function IntegrityBar({
  integrity,
  maxIntegrity,
  firewall,
  size = 'normal',
}: {
  integrity: number;
  maxIntegrity: number;
  firewall: number;
  size?: 'normal' | 'small';
}) {
  const effectiveMax = maxIntegrity + firewall;
  const integrityPercent = (integrity / effectiveMax) * 100;
  const firewallPercent = (firewall / effectiveMax) * 100;
  const integrityColor =
    integrity / maxIntegrity > 0.6
      ? 'var(--neon-green)'
      : integrity / maxIntegrity > 0.3
        ? 'var(--neon-yellow)'
        : 'var(--neon-red)';
  const isSmall = size === 'small';

  return (
    <div className={`integrity-bar-track ${isSmall ? 'integrity-bar-track--sm' : ''}`}>
      <div
        className="integrity-bar-hp"
        style={{
          width: `${integrityPercent}%`,
          background: integrityColor,
          boxShadow: `0 0 6px ${integrityColor}`,
        }}
      />
      {firewall > 0 && (
        <div
          className="integrity-bar-fw"
          style={{
            left: `${integrityPercent}%`,
            width: `${firewallPercent}%`,
          }}
        />
      )}
      <span className="integrity-bar-text">
        {integrity}/{maxIntegrity}
        {firewall > 0 && (
          <span className="integrity-bar-fw-badge">
            <IconFirewallSmall />
            <span>{firewall}</span>
          </span>
        )}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════ */

/* ─── Top Bar ─── */

function CombatTopBar() {
  return (
    <header className="combat-top-bar">
      <div className="combat-turn-counter">
        <span className="turn-label">TURN</span>
        <span className="turn-number">03</span>
      </div>
      <div className="combat-top-piles">
        <span className="pile-indicator">
          <IconDrawPile />
          <span className="pile-count">18</span>
        </span>
        <span className="pile-indicator">
          <IconDiscard />
          <span className="pile-count">4</span>
        </span>
      </div>
      <button className="combat-end-turn-btn">
        <IconEndTurn />
        <span>END TURN</span>
      </button>
    </header>
  );
}

/* ─── Enemy Display ─── */

function IntentIcon({ type }: { type: string }) {
  switch (type) {
    case 'attack': return <IconAttack />;
    case 'drain': return <IconDrain />;
    case 'firewall': return <IconFirewallIntent />;
    default: return <IconAttack />;
  }
}

function EnemyCard({ enemy }: { enemy: MockEnemy }) {
  const enemyHeatColor = getHeatColor(enemy.heat);

  return (
    <div className="enemy-card">
      {/* Intent badge — floats top-right */}
      <div className="enemy-intent">
        <IntentIcon type={enemy.intent.type} />
        <span className="intent-value">{enemy.intent.value}</span>
        {enemy.intent.label && <span className="intent-label">{enemy.intent.label}</span>}
      </div>

      {/* Threat tier — top-left */}
      <div className="enemy-threat">
        <IconThreatTier tier={enemy.threatTier} />
      </div>

      {/* Sprite container — holographic projection */}
      <div className="enemy-sprite-frame">
        <div className="enemy-sprite-scanlines" aria-hidden="true" />
        <img
          src={enemy.sprite}
          alt={enemy.name}
          className="enemy-sprite"
          draggable={false}
        />
        <div className="enemy-sprite-vignette" aria-hidden="true" />
        <div className="enemy-sprite-glow" aria-hidden="true" />
      </div>

      {/* Enemy info panel */}
      <div className="enemy-info">
        <span className="enemy-name">{enemy.name}</span>

        {/* Integrity + firewall bar */}
        <IntegrityBar
          integrity={enemy.integrity}
          maxIntegrity={enemy.maxIntegrity}
          firewall={enemy.firewall}
          size="small"
        />

        {/* Enemy resources row */}
        <div className="enemy-resources">
          <div className="enemy-ram-pips">
            {Array.from({ length: enemy.maxRam }).map((_, i) => (
              <IconRamPipSmall key={i} filled={i < enemy.ram} />
            ))}
          </div>
          <div className="enemy-heat-mini" style={{ color: enemyHeatColor }}>
            <IconHeat />
            <span>{enemy.heat}</span>
          </div>
        </div>

        {/* Status effects */}
        {enemy.statusEffects.length > 0 && (
          <div className="enemy-statuses">
            {enemy.statusEffects.map((s, i) => (
              <span key={i} className="status-badge" style={{ borderColor: s.color, color: s.color }}>
                {s.name} {s.stacks}
              </span>
            ))}
          </div>
        )}

        {/* Uploaded daemons */}
        {enemy.uploadedDaemons.length > 0 && (
          <div className="enemy-daemons">
            {enemy.uploadedDaemons.map((d, i) => (
              <span key={i} className="daemon-badge">
                <IconDaemon />
                <span className="daemon-badge-name">{d.name}</span>
                <span className="daemon-badge-ticks">{d.ticksLeft}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EnemyArea() {
  return (
    <section className="combat-enemy-area">
      {/* Data stream background effect */}
      <div className="arena-data-streams" aria-hidden="true">
        <div className="data-stream data-stream--1" />
        <div className="data-stream data-stream--2" />
        <div className="data-stream data-stream--3" />
      </div>

      <div className="enemy-grid">
        {MOCK_ENEMIES.map((enemy) => (
          <EnemyCard key={enemy.id} enemy={enemy} />
        ))}
      </div>
    </section>
  );
}

/* ─── Combat Log Terminal ─── */

function CombatLog() {
  return (
    <div className="combat-log">
      <div className="combat-log-header">
        <span className="combat-log-label">SYS.LOG</span>
        <span className="combat-log-blink" />
      </div>
      <div className="combat-log-entries">
        {MOCK_COMBAT_LOG.map((entry) => (
          <span key={entry.id} className="combat-log-line" style={{ color: entry.color }}>
            {entry.text}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Player HUD ─── */

function PlayerHUD() {
  const { integrity, maxIntegrity, ram, maxRam, heat, firewall } = MOCK_PLAYER;
  const heatColor = getHeatColor(heat);
  const heatZone = getHeatZoneLabel(heat);

  return (
    <section className="combat-player-hud">
      {/* Player avatar */}
      <div className="player-avatar-frame">
        <img
          src="/assets/Sprites/NYX_PlayerIcon.png"
          alt="Player"
          className="player-avatar"
          draggable={false}
        />
        <div className="player-avatar-vignette" aria-hidden="true" />
      </div>

      {/* Stats column */}
      <div className="player-stats">
        {/* Integrity + Firewall bar */}
        <div className="player-stat-row">
          <div className="stat-header">
            <IconIntegrity />
            <span className="stat-name">INTEGRITY</span>
            <span className="stat-numbers">{integrity}/{maxIntegrity}</span>
          </div>
          <IntegrityBar
            integrity={integrity}
            maxIntegrity={maxIntegrity}
            firewall={firewall}
          />
        </div>

        {/* Heat Gauge */}
        <div className="player-stat-row">
          <div className="stat-header">
            <span className="heat-icon-wrapper" style={{ color: heatColor }}>
              <IconHeat />
            </span>
            <span className="stat-name">HEAT</span>
            <span className="heat-zone-label" style={{ color: heatColor }}>{heatZone}</span>
            <span className="stat-numbers">{heat}</span>
          </div>
          <div className="heat-gauge">
            <div className="heat-zone heat-zone--safe" />
            <div className="heat-zone heat-zone--overclocked" />
            <div className="heat-zone heat-zone--redline" />
            <div className="heat-zone heat-zone--crash" />
            <div
              className="heat-marker"
              style={{ left: `${heat}%`, borderColor: heatColor }}
            />
            <div className="heat-tick" style={{ left: '40%' }} />
            <div className="heat-tick" style={{ left: '70%' }} />
            <div className="heat-tick" style={{ left: '90%' }} />
          </div>
        </div>

        {/* RAM */}
        <div className="player-resource-row">
          <div className="ram-display">
            <span className="resource-label">RAM</span>
            <div className="ram-pips">
              {Array.from({ length: maxRam }).map((_, i) => (
                <IconRamPip key={i} filled={i < ram} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Active Programs Tray ─── */

function ActiveTray() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section className="combat-active-tray">
      <div className="tray-header">
        <span className="tray-label">ACTIVE</span>
        <span className="tray-count">{MOCK_ACTIVE_PROGRAMS.length}</span>
      </div>
      <div className="tray-items">
        {MOCK_ACTIVE_PROGRAMS.map((prog) => (
          <button
            key={prog.id}
            className={`tray-item ${expanded === prog.id ? 'tray-item--expanded' : ''}`}
            onClick={() => setExpanded(expanded === prog.id ? null : prog.id)}
            style={{ '--tray-accent': CARD_TYPE_COLOR[prog.type] } as React.CSSProperties}
          >
            <IconProgram />
            <span className="tray-item-name">{prog.shortName}</span>
            <div className="tray-tooltip">
              <span className="tray-tooltip-title">{prog.name}</span>
              <span className="tray-tooltip-effect">{prog.effect}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ─── Card Component ─── */

function HandCard({ card, onSelect }: { card: MockCard; onSelect: (card: MockCard) => void }) {
  const accent = CARD_TYPE_COLOR[card.type];
  const glow = CARD_TYPE_GLOW[card.type];

  return (
    <button
      className="hand-card"
      onClick={() => onSelect(card)}
      style={{
        '--card-accent': accent,
        '--card-glow': glow,
      } as React.CSSProperties}
    >
      <div className="card-corner card-corner--tl" aria-hidden="true" />
      <div className="card-corner card-corner--tr" aria-hidden="true" />
      <div className="card-corner card-corner--bl" aria-hidden="true" />
      <div className="card-corner card-corner--br" aria-hidden="true" />

      <div className="card-ram-badge">
        <svg width="22" height="24" viewBox="0 0 22 24" aria-hidden="true">
          <polygon points="11,0 22,6 22,18 11,24 0,18 0,6" fill="var(--bg-dark)" stroke={accent} strokeWidth="1" />
        </svg>
        <span className="card-ram-value">{card.ramCost}</span>
      </div>

      {card.heatGenerated > 0 && (
        <div className="card-heat-badge">
          <IconHeat />
          <span>{card.heatGenerated}</span>
        </div>
      )}

      <div className="card-type-tag">
        <CardTypeIcon type={card.type} />
        <span>{card.type.toUpperCase()}</span>
      </div>

      <div className="card-art-frame">
        <img src={card.sprite} alt="" className="card-art" draggable={false} />
        <div className="card-art-overlay" aria-hidden="true" />
      </div>

      <span className="card-name">{card.name}</span>
      <span className="card-effect">{card.effect}</span>
      {card.meta && <span className="card-meta">{card.meta}</span>}
    </button>
  );
}

/* ─── Card Detail Modal ─── */

function CardDetailModal({ card, onClose }: { card: MockCard; onClose: () => void }) {
  const accent = CARD_TYPE_COLOR[card.type];
  const glow = CARD_TYPE_GLOW[card.type];

  return (
    <div className="card-modal-backdrop" onClick={onClose}>
      <div
        className="card-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          '--card-accent': accent,
          '--card-glow': glow,
        } as React.CSSProperties}
      >
        <button className="card-modal-close" onClick={onClose}>
          <IconClose />
        </button>

        <div className="card-corner card-corner--tl" aria-hidden="true" />
        <div className="card-corner card-corner--tr" aria-hidden="true" />
        <div className="card-corner card-corner--bl" aria-hidden="true" />
        <div className="card-corner card-corner--br" aria-hidden="true" />

        <div className="card-modal-header">
          <div className="card-modal-ram">
            <svg width="28" height="30" viewBox="0 0 22 24" aria-hidden="true">
              <polygon points="11,0 22,6 22,18 11,24 0,18 0,6" fill="var(--bg-dark)" stroke={accent} strokeWidth="1" />
            </svg>
            <span className="card-modal-ram-value">{card.ramCost}</span>
          </div>
          <div className="card-modal-title-group">
            <span className="card-modal-name">{card.name}</span>
            <span className="card-modal-type" style={{ color: accent }}>
              <CardTypeIcon type={card.type} />
              {card.type.toUpperCase()}
            </span>
          </div>
          {card.heatGenerated > 0 && (
            <div className="card-modal-heat">
              <IconHeat />
              <span>{card.heatGenerated}</span>
            </div>
          )}
        </div>

        <div className="card-modal-art-frame">
          <img src={card.sprite} alt="" className="card-modal-art" draggable={false} />
          <div className="card-art-overlay" aria-hidden="true" />
        </div>

        <div className="card-modal-divider" />
        <p className="card-modal-effect">{card.effect}</p>
        {card.meta && <span className="card-modal-meta">{card.meta}</span>}
        <p className="card-modal-flavor">{card.flavorText}</p>
      </div>
    </div>
  );
}

/* ─── Hand Area ─── */

function HandArea() {
  const [selectedCard, setSelectedCard] = useState<MockCard | null>(null);

  return (
    <section className="combat-hand-area">
      <div className="hand-row">
        {MOCK_HAND.map((card) => (
          <HandCard key={card.id} card={card} onSelect={setSelectedCard} />
        ))}
      </div>
      {selectedCard && (
        <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </section>
  );
}

/* ─── Bottom Bar ─── */

function CombatBottomBar() {
  const setScreen = useUIStore((s) => s.setScreen);

  return (
    <footer className="combat-bottom-bar">
      <button className="bottom-bar-btn" onClick={() => setScreen(Screen.Map)}>
        <IconMap />
        <span>MAP</span>
      </button>
      <div className="bottom-bar-piles">
        <span className="bottom-pile">
          <IconDrawPile />
          <span>18</span>
        </span>
        <span className="bottom-pile">
          <IconDiscard />
          <span>4</span>
        </span>
        <span className="bottom-pile">
          <IconExhaust />
          <span>1</span>
        </span>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMBAT SCREEN
   ═══════════════════════════════════════════════════════ */

export function CombatScreen() {
  return (
    <div className="screen combat-screen">
      {/* Background layers */}
      <div className="combat-grid-bg" aria-hidden="true" />
      <div className="combat-scanline" aria-hidden="true" />
      <div className="combat-vignette" aria-hidden="true" />

      {/* Content */}
      <div className="combat-layout">
        <CombatTopBar />
        <EnemyArea />
        <CombatLog />
        <PlayerHUD />
        <ActiveTray />
        <HandArea />
        <CombatBottomBar />
      </div>
    </div>
  );
}
