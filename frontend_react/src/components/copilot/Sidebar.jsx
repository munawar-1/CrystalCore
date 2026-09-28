import React from 'react';
import { useAuth } from '../../context/AuthContext';

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
  showToast,
  onOpenAuth
}) {
  const { user, isCoder, isMarketing } = useAuth();

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

      {/* Role Indicator Banner */}
      <div
        className="sidebar-role-indicator"
        onClick={onOpenAuth}
        title="Click to switch role"
        style={{
          margin: '0.5rem 0.85rem 0.75rem',
          padding: '0.45rem 0.75rem',
          borderRadius: 'var(--radius-sm)',
          background: isCoder ? 'rgba(62, 230, 170, 0.08)' : 'rgba(94, 106, 210, 0.08)',
          border: isCoder ? '1px solid rgba(62, 230, 170, 0.25)' : '1px solid rgba(94, 106, 210, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{ fontSize: '12px' }}>{isCoder ? '</>' : '📢'}</span>
          <span style={{ fontSize: '11px', fontWeight: 800, color: isCoder ? 'var(--mint-primary)' : 'var(--accent-linear)' }}>
            {user.roleName}
          </span>
        </div>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>change ▾</span>
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

      {/* Dynamic Role Navigation */}
      <nav className="sidebar-menu">
        {/* If Coder: Show Feature Memory Hub at top */}
        {isCoder ? (
          <>
            <button
              className={`sidebar-nav-item ${activeView === 'coder_memory' ? 'active' : ''}`}
              id="tabNavCoderMemory"
              onClick={() => onSwitchView('coder_memory')}
            >
              <svg className="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              <span>Update Memory (Features)</span>
            </button>

            <button
              className={`sidebar-nav-item ${activeView === 'chat' ? 'active' : ''}`}
              id="tabNavChat"
              onClick={() => onSwitchView('chat')}
            >
              <svg className="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>Dev Copilot Chat</span>
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
              <span>Citation Impacts</span>
            </button>
          </>
        ) : (
          /* If Marketing Team: Show Citation Analytics & Strategy at top */
          <>
            <button
              className={`sidebar-nav-item ${activeView === 'marketing_strategy' || activeView === 'analytics' ? 'active' : ''}`}
              id="tabNavMarketingStrategy"
              onClick={() => onSwitchView('marketing_strategy')}
            >
              <svg className="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              <span>GEO Citations & Strategy</span>
            </button>

            <button
              className={`sidebar-nav-item ${activeView === 'chat' ? 'active' : ''}`}
              id="tabNavChat"
              onClick={() => onSwitchView('chat')}
            >
              <svg className="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>Marketing Copilot Chat</span>
            </button>

            <button
              className={`sidebar-nav-item ${activeView === 'coder_memory' ? 'active' : ''}`}
              id="tabNavCoderMemoryViewOnly"
              onClick={() => onSwitchView('coder_memory')}
            >
              <svg className="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              <span>Features in Memory</span>
            </button>
          </>
        )}
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
        <div
          className="sidebar-profile-card"
          onClick={onOpenAuth}
          style={{ cursor: 'pointer' }}
          title="Click to view/switch user profile"
        >
          <div
            className="profile-avatar"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: isCoder ? 'var(--mint-primary)' : 'var(--accent-linear)',
              color: isCoder ? '#060709' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '12px'
            }}
          >
            {user.avatarText || 'U'}
          </div>
          <div className="profile-info">
            <div className="profile-name-row">
              <span className="profile-name">{user.name}</span>
              <svg className="verified-icon" viewBox="0 0 24 24" fill="#3b82f6">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="8 12 11 15 16 9" stroke="#ffffff" strokeWidth="2.5" fill="none"/>
              </svg>
            </div>
            <span className="profile-plan" style={{ color: isCoder ? 'var(--mint-primary)' : 'var(--accent-linear)', fontWeight: 600 }}>
              {user.title}
            </span>
          </div>
          <button
            className="btn-panel-toggle"
            id="btnPanelToggle"
            title="Toggle Sidebar"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse();
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="2" x2="9" y2="21"/>
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
