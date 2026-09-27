import React from 'react';

export default function Sidebar({
  isCollapsed,
  onToggleCollapse,
  activeView,
  onSwitchView,
  chatSessions,
  currentChatId,
  onSelectChat,
  onNewChat,
  onNavigateLanding,
  showToast
}) {
  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} id="sidebar">
      {/* Top Brand Row: Logo + Brand + Return Link */}
      <div className="sidebar-header">
        <button
          onClick={onNavigateLanding}
          className="brand-item"
          title="Return to Landing Page"
          style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <div className="brand-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="brand-title">CrystalCore</span>
        </button>

        <div className="sidebar-header-actions">
          <button
            className="sidebar-icon-btn"
            id="btnNavSearch"
            title="Search Investigations"
            onClick={() => showToast("🔍 Search investigations across Hindsight memory bank", "info")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
          <button
            className="sidebar-icon-btn with-badge"
            id="btnNavNotif"
            title="Hindsight Notifications"
            onClick={() => showToast("🔔 3 new GEO citation shift events tracked this week", "info")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className="notif-dot"></span>
          </button>
        </div>
      </div>

      {/* New Chat Action */}
      <div className="sidebar-primary-action">
        <button className="sidebar-new-chat-btn" id="btnNewChat" onClick={onNewChat}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>New Chat</span>
        </button>
      </div>

      {/* Core Navigation: Chat & Analysis */}
      <nav className="sidebar-menu">
        <button
          className={`sidebar-nav-item ${activeView === 'chat' ? 'active' : ''}`}
          id="tabNavChat"
          onClick={() => onSwitchView('chat')}
        >
          <svg className="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span>Chat</span>
        </button>

        <button
          className={`sidebar-nav-item ${activeView === 'analytics' ? 'active' : ''}`}
          id="tabNavAnalytics"
          onClick={() => onSwitchView('analytics')}
        >
          <svg className="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          <span>Analysis</span>
        </button>
      </nav>

      {/* Historical Chats Section */}
      <div className="sidebar-history-section">
        <div className="history-section-header">
          <span className="history-section-title">Historical Chats</span>
        </div>
        <div className="sidebar-history-list" id="chatHistoryList">
          {Object.entries(chatSessions).map(([id, session]) => (
            <button
              key={id}
              className={`history-item ${currentChatId === id ? 'active' : ''}`}
              data-chat-id={id}
              onClick={() => onSelectChat(id)}
            >
              <svg className="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span className="history-title">{session.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sidebar Spacer */}
      <div className="sidebar-spacer"></div>

      {/* Bottom Profile */}
      <div className="sidebar-bottom">
        <div className="sidebar-profile-card">
          <img src="/avatar.jpg" alt="Profile" className="profile-avatar" />
          <div className="profile-info">
            <div className="profile-name-row">
              <span className="profile-name">Linear Growth Team</span>
              <svg className="verified-icon" viewBox="0 0 24 24" fill="#3b82f6">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="8 12 11 15 16 9" stroke="#ffffff" strokeWidth="2.5" fill="none"/>
              </svg>
            </div>
            <span className="profile-plan">Enterprise GEO Copilot</span>
          </div>
          <button
            className="btn-panel-toggle"
            id="btnPanelToggle"
            title="Toggle Sidebar"
            onClick={onToggleCollapse}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
          </button>
        </div>

        {/* Engineered by Hisenbugs */}
        <div className="sidebar-engineered-credit">
          <span className="green-status-dot"></span>
          <span className="signature-text">engineered by <span className="hisenbugs-name">Hisenbugs.</span></span>
        </div>
      </div>
    </aside>
  );
}
