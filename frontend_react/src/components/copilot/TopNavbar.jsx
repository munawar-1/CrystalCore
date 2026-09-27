import React from 'react';

export default function TopNavbar({
  onNavigateLanding,
  onOpenConfig,
  onToggleSidebar,
  onShare
}) {
  return (
    <header className="top-navbar">
      <div className="navbar-left">
        {/* Return to Landing Page */}
        <button
          onClick={onNavigateLanding}
          className="nav-pill-btn"
          id="btnBackToLanding"
          title="Return to Landing Page"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
        >
          <svg className="pill-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          <span>Landing Page</span>
        </button>

        {/* Configuration Pill */}
        <button
          className="nav-pill-btn"
          id="btnConfig"
          title="Configure Memory & Features"
          onClick={onOpenConfig}
        >
          <svg className="pill-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <span>Configuration</span>
        </button>
      </div>

      <div className="navbar-right">
        {/* Chat History Toggle */}
        <button
          className="nav-pill-btn"
          id="btnToggleHistory"
          title="Toggle Chat History"
          onClick={onToggleSidebar}
        >
          <svg className="pill-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>Chat History</span>
        </button>

        {/* Share Button */}
        <button
          className="nav-pill-btn"
          id="btnShareChat"
          title="Share Session"
          onClick={onShare}
        >
          <svg className="pill-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <polyline points="16 6 12 2 8 6"/>
            <line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
          <span>Share</span>
        </button>

        <div className="subject-badge">
          <span className="subject-target">Linear</span>
          <span className="subject-vs">vs</span>
          <span className="subject-rival">Jira</span>
        </div>
      </div>
    </header>
  );
}
