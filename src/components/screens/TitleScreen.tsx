import { useState, useEffect } from 'react';
import { useUIStore, Screen } from '../../stores/uiStore';
import './TitleScreen.css';

export function TitleScreen() {
  const setScreen = useUIStore((s) => s.setScreen);
  const [booted, setBooted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const bootTimer = setTimeout(() => setBooted(true), 600);
    const menuTimer = setTimeout(() => setShowMenu(true), 1800);
    return () => {
      clearTimeout(bootTimer);
      clearTimeout(menuTimer);
    };
  }, []);

  return (
    <div className="screen title-screen">
      {/* Animated grid background */}
      <div className="title-grid" aria-hidden="true" />
      <div className="title-scanline" aria-hidden="true" />
      <div className="title-vignette" aria-hidden="true" />

      <div className={`title-content ${booted ? 'title-content--booted' : ''}`}>
        {/* Boot sequence text */}
        <div className="title-boot-log">
          <span className="boot-line boot-line--1">VANTA_DYNAMICS // FIRMWARE v4.7.1</span>
          <span className="boot-line boot-line--2">LOADING CYBERDECK KERNEL...</span>
          <span className="boot-line boot-line--3">WARNING: SAFETY PROTOCOLS DISABLED</span>
        </div>

        {/* Main title */}
        <div className="title-block">
          <h1 className="title-main" data-text="PROTOCOL">
            <span className="title-protocol">PROTOCOL</span>
            <span className="title-colon">://</span>
            <span className="title-redline">REDLINE</span>
          </h1>
          <div className="title-rule" aria-hidden="true" />
          <p className="title-tagline">
            When your heat hits 90, the system stops protecting you.
          </p>
        </div>

        {/* Menu */}
        <nav className={`title-menu ${showMenu ? 'title-menu--visible' : ''}`}>
          <button
            className="title-menu-btn title-menu-btn--jack-in"
            onClick={() => setScreen(Screen.LoreIntro)}
          >
            <svg className="menu-btn-icon" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3 8h7M8 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="square" />
            </svg>
            JACK IN
          </button>
          <button className="title-menu-btn title-menu-btn--disabled" disabled>
            <svg className="menu-btn-icon" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <rect x="3" y="3" width="10" height="10" stroke="currentColor" strokeWidth="1" fill="none" />
              <line x1="6" y1="6" x2="6" y2="10" stroke="currentColor" strokeWidth="1.5" />
              <line x1="10" y1="6" x2="10" y2="10" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            CONTINUE
          </button>
          <button className="title-menu-btn title-menu-btn--disabled" disabled>
            <svg className="menu-btn-icon" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1" fill="none" />
              <circle cx="8" cy="8" r="1.5" fill="currentColor" />
            </svg>
            SETTINGS
          </button>
        </nav>
      </div>

      {/* Version footer */}
      <footer className={`title-footer ${showMenu ? 'title-footer--visible' : ''}`}>
        <span>v0.1.0</span>
        <span className="footer-sep">//</span>
        <span>VANTA DYNAMICS</span>
      </footer>
    </div>
  );
}
