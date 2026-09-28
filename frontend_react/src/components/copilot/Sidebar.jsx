import React, { useState, useRef, useEffect } from 'react';
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
  onRenameChat,
  onDeleteChat,
  onNavigateLanding,
  showToast,
  onOpenAuth
}) {
  const { user, isCoder } = useAuth();
  const isChatActive = activeView === 'chat';

  // Chat scroll position memory
  const chatScrollTopRef = useRef(0);
  const chatListRef = useRef(null);

  // Overflow menu & inline rename states
  const [openMenuChatId, setOpenMenuChatId] = useState(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [renameText, setRenameText] = useState('');

  // Restore scroll position when chat view becomes active
  useEffect(() => {
    if (isChatActive && chatListRef.current) {
      chatListRef.current.scrollTop = chatScrollTopRef.current;
    }
  }, [isChatActive]);

  // Close overflow menu when clicking outside
  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (!e.target.closest('.chat-row-actions')) {
        setOpenMenuChatId(null);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  const handleChatScroll = (e) => {
    chatScrollTopRef.current = e.target.scrollTop;
  };

  // Group chats by "Today", "Yesterday", "Previous 7 days"
  const getChatGroups = () => {
    const today = [];
    const yesterday = [];
    const previous = [];

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    Object.entries(chatSessions).forEach(([id, session]) => {
      const item = { id, ...session };
      const timestamp = session.updatedAt ? new Date(session.updatedAt).getTime() : (
        id === 'chat-1' ? now - 1000 * 60 * 30 :
        id === 'chat-2' ? now - oneDay - 1000 * 60 * 60 * 2 :
        now - oneDay * 3
      );

      const diff = now - timestamp;
      if (diff < oneDay && new Date(timestamp).getDate() === new Date(now).getDate()) {
        today.push(item);
      } else if (diff < oneDay * 2) {
        yesterday.push(item);
      } else {
        previous.push(item);
      }
    });

    const groups = [];
    if (today.length > 0) groups.push({ title: 'Today', chats: today });
    if (yesterday.length > 0) groups.push({ title: 'Yesterday', chats: yesterday });
    if (previous.length > 0) groups.push({ title: 'Previous 7 days', chats: previous });
    return groups;
  };

  const chatGroups = getChatGroups();
  const allChatIds = Object.keys(chatSessions);

  // Arrow key navigation inside chat list
  const handleChatKeyDown = (e, id) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectChat(id);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const currentIdx = allChatIds.indexOf(id);
      if (currentIdx < allChatIds.length - 1) {
        const nextId = allChatIds[currentIdx + 1];
        const nextEl = document.querySelector(`[data-chat-id="${nextId}"]`);
        if (nextEl) nextEl.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const currentIdx = allChatIds.indexOf(id);
      if (currentIdx > 0) {
        const prevId = allChatIds[currentIdx - 1];
        const prevEl = document.querySelector(`[data-chat-id="${prevId}"]`);
        if (prevEl) prevEl.focus();
      }
    }
  };

  const handleStartRename = (id, currentTitle) => {
    setEditingChatId(id);
    setRenameText(currentTitle);
  };

  const handleSaveRename = (id) => {
    if (onRenameChat && renameText.trim()) {
      onRenameChat(id, renameText.trim());
    }
    setEditingChatId(null);
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} id="sidebar">
      {/* 1. Brand Row: Logo + CrystalCore on left, Search/Notif/Collapse on right */}
      <div className="sidebar-header">
        <button
          type="button"
          onClick={onNavigateLanding}
          className="brand-item"
          title="Return to Landing Page"
        >
          <div className="brand-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="brand-title">CrystalCore</span>
        </button>

        <div className="sidebar-header-actions">
          <button
            type="button"
            className="sidebar-icon-btn"
            id="btnNavSearch"
            title="Search Investigations"
            aria-label="Search Investigations"
            onClick={() => showToast("Search investigations across Hindsight memory bank", "info")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <button
            type="button"
            className="sidebar-icon-btn with-badge"
            id="btnNavNotif"
            title="Notifications"
            aria-label="Notifications"
            onClick={() => showToast("3 new GEO citation shift events tracked this week", "info")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="notif-dot"></span>
          </button>
          <button
            type="button"
            className="sidebar-icon-btn"
            id="btnCollapseSidebar"
            title="Collapse Sidebar"
            aria-label="Collapse Sidebar"
            onClick={onToggleCollapse}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </button>
        </div>
      </div>

      {/* 2. Persona Block: Neutral dark surface, 1px border, white role, gray subrole, clean Change link */}
      <div
        className="sidebar-persona-card"
        onClick={onOpenAuth}
        role="button"
        tabIndex={0}
        title="Click to switch persona role"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenAuth();
          }
        }}
      >
        <div className="persona-info">
          <div className="persona-role">Marketing Team</div>
          <div className="persona-subrole">Growth Lead</div>
        </div>
        <button
          type="button"
          className="persona-change-btn"
          onClick={(e) => {
            e.stopPropagation();
            onOpenAuth();
          }}
        >
          Change
        </button>
      </div>

      {/* 3. Navigation List: 40px height, consistent padding, chevron on chat */}
      <div className="sidebar-nav-container">
        <nav className="sidebar-nav" aria-label="Main Navigation">
          {/* Nav Item 1: GEO Citations & Strategy */}
          <button
            type="button"
            className={`sidebar-nav-item ${activeView === 'marketing_strategy' || activeView === 'analytics' ? 'active' : ''}`}
            id="tabNavMarketingStrategy"
            onClick={() => onSwitchView('marketing_strategy')}
            aria-current={activeView === 'marketing_strategy' || activeView === 'analytics' ? 'page' : undefined}
          >
            <svg className="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span className="nav-item-text">GEO Citations &amp; Strategy</span>
          </button>

          {/* Nav Item 2: Marketing Copilot Chat */}
          <button
            type="button"
            className={`sidebar-nav-item ${isChatActive ? 'active' : ''}`}
            id="tabNavChat"
            onClick={() => onSwitchView('chat')}
            aria-current={isChatActive ? 'page' : undefined}
            aria-expanded={isChatActive}
            aria-controls="copilotExpandableSection"
          >
            <svg className="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="nav-item-text">Marketing Copilot Chat</span>
            <svg
              className={`nav-chevron ${isChatActive ? 'expanded' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* 4. Expanded Copilot Section: Directly beneath Marketing Copilot Chat */}
          <div
            id="copilotExpandableSection"
            className={`sidebar-copilot-section ${isChatActive ? 'expanded' : ''}`}
            aria-hidden={!isChatActive}
          >
            <div className="copilot-section-inner">
              {/* Outlined Secondary New Chat Button */}
              <button
                type="button"
                className="sidebar-new-chat-btn"
                id="btnNewChat"
                onClick={onNewChat}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>New Chat</span>
              </button>

              {/* Recent chats Label */}
              <div className="sidebar-recent-label">Recent chats</div>

              {/* Scrollable Chat History List (No per-row chat icons) */}
              <div
                className="sidebar-chat-scroll"
                ref={chatListRef}
                onScroll={handleChatScroll}
                role="list"
                aria-label="Recent chats"
              >
                {chatGroups.map((group) => (
                  <div key={group.title} className="chat-group">
                    <div className="chat-group-header">{group.title}</div>
                    {group.chats.map((session) => (
                      <div
                        key={session.id}
                        data-chat-id={session.id}
                        className={`sidebar-chat-item ${currentChatId === session.id ? 'active' : ''}`}
                        role="listitem"
                        tabIndex={0}
                        title={session.title}
                        aria-label={session.title}
                        onClick={() => onSelectChat(session.id)}
                        onKeyDown={(e) => handleChatKeyDown(e, session.id)}
                      >
                        {editingChatId === session.id ? (
                          <input
                            type="text"
                            className="chat-rename-input"
                            value={renameText}
                            onChange={(e) => setRenameText(e.target.value)}
                            onBlur={() => handleSaveRename(session.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(session.id);
                              if (e.key === 'Escape') setEditingChatId(null);
                            }}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="chat-title-text">{session.title}</span>
                        )}

                        {/* Overflow menu trigger & dropdown */}
                        <div className="chat-row-actions">
                          <button
                            type="button"
                            className="chat-action-btn"
                            title="Chat options"
                            aria-label="Chat options"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuChatId(openMenuChatId === session.id ? null : session.id);
                            }}
                          >
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <circle cx="12" cy="12" r="2" />
                              <circle cx="19" cy="12" r="2" />
                              <circle cx="5" cy="12" r="2" />
                            </svg>
                          </button>

                          {openMenuChatId === session.id && (
                            <div className="chat-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                className="chat-dropdown-item"
                                onClick={() => {
                                  setOpenMenuChatId(null);
                                  handleStartRename(session.id, session.title);
                                }}
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                  <path d="M12 20h9" />
                                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                </svg>
                                <span>Rename</span>
                              </button>
                              <button
                                type="button"
                                className="chat-dropdown-item delete"
                                onClick={() => {
                                  setOpenMenuChatId(null);
                                  if (onDeleteChat) onDeleteChat(session.id);
                                }}
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Nav Item 3: Features in Memory */}
          <button
            type="button"
            className={`sidebar-nav-item ${activeView === 'coder_memory' ? 'active' : ''}`}
            id="tabNavCoderMemoryViewOnly"
            onClick={() => onSwitchView('coder_memory')}
            aria-current={activeView === 'coder_memory' ? 'page' : undefined}
          >
            <svg className="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span className="nav-item-text">Features in Memory</span>
          </button>
        </nav>
      </div>

      {/* 5. Footer: Pinned to bottom, user profile with neutral dark avatar, verified check, clean sans credit */}
      <div className="sidebar-footer">
        <div
          className="sidebar-user-row"
          onClick={onOpenAuth}
          role="button"
          tabIndex={0}
          title="Click to view/switch user profile"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenAuth();
            }
          }}
        >
          <div className="user-avatar-circle">SJ</div>
          <div className="user-details">
            <div className="user-name-line">
              <span className="user-name">Sarah Jenkins</span>
              <svg className="verified-badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="user-role-text">Head of GEO &amp; Organic Growth</span>
          </div>
        </div>

        <div className="sidebar-credit-line">
          engineered by Hisenbugs.
        </div>
      </div>
    </aside>
  );
}
