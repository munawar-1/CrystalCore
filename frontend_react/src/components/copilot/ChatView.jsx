import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';

const PROMPT_SETS = [
  [
    {
      query: "Why did our Perplexity citation rate and referral signups drop in mid-February?",
      display: "/Why did our Perplexity citation rate drop in mid-February?",
      tag: "Root Cause Diagnosis"
    },
    {
      query: "What should we do to beat Jira after their 25% enterprise price hike?",
      display: "/What should we do to beat Jira after their 25% price hike?",
      tag: "Competitive Strategy"
    },
    {
      query: "How should we update /switch-from-jira to leverage the new Linear Asks AI feature?",
      display: "/How should we leverage the new Linear Asks AI feature?",
      tag: "Product SEO Rollout"
    }
  ],
  [
    {
      query: "Analyze ChatGPT Search and Perplexity citation sources for 'fastest issue tracking tool'",
      display: "/Analyze ChatGPT Search sources for 'issue tracking tool'",
      tag: "AI Citation Audit"
    },
    {
      query: "Compare markdown comparison tables vs video embeds for Perplexity citations",
      display: "/Compare markdown tables vs video embeds for GEO citation rate",
      tag: "Hindsight Reflection"
    },
    {
      query: "What PR deployment caused the sudden 18% citation surge in mid-January?",
      display: "/What PR deployment caused the sudden 18% citation surge?",
      tag: "Retained Event Trace"
    }
  ],
  [
    {
      query: "Synthesize an executive summary of all Jira competitive moves over the last 60 days",
      display: "/Recall all competitor moves by Jira in the last 60 days",
      tag: "Competitive Intel"
    },
    {
      query: "Simulate releasing a SOC2 and HIPAA enterprise comparison page against Jira",
      display: "/Simulate releasing SOC2 & HIPAA page vs Jira Enterprise",
      tag: "Simulation Hub"
    },
    {
      query: "Draft a GEO-optimized technical landing page targeting Jira Cloud migration queries",
      display: "/Draft GEO-optimized landing page for Jira migrations",
      tag: "Content Synthesis"
    }
  ]
];

function ClaudeStarburst() {
  return (
    <svg 
      className="claude-starburst" 
      viewBox="0 0 32 32" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="19.5" y1="16" x2="28.5" y2="16" />
      <line x1="19.15" y1="17.52" x2="27.26" y2="21.42" />
      <line x1="18.18" y1="18.74" x2="23.79" y2="25.78" />
      <line x1="16.78" y1="19.41" x2="18.78" y2="28.19" />
      <line x1="15.22" y1="19.41" x2="13.22" y2="28.19" />
      <line x1="13.82" y1="18.74" x2="8.21" y2="25.78" />
      <line x1="12.85" y1="17.52" x2="4.74" y2="21.42" />
      <line x1="12.5" y1="16" x2="3.5" y2="16" />
      <line x1="12.85" y1="14.48" x2="4.74" y2="10.58" />
      <line x1="13.82" y1="13.26" x2="8.21" y2="6.22" />
      <line x1="15.22" y1="12.59" x2="13.22" y2="3.81" />
      <line x1="16.78" y1="12.59" x2="18.78" y2="3.81" />
      <line x1="18.18" y1="13.26" x2="23.79" y2="6.22" />
      <line x1="19.15" y1="14.48" x2="27.26" y2="10.58" />
    </svg>
  );
}

export default function ChatView({
  messages,
  isThinking,
  onSendMessage,
  onOpenModal,
  showToast
}) {
  const [inputText, setInputText] = useState("");
  const [activeMode, setActiveMode] = useState("chat");
  const [openDrawers, setOpenDrawers] = useState({});
  const chatScrollRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  // Compute greeting dynamically matching Claude's time-sensitive elegance
  const getClaudeGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 5) return "It's a late-night jam session.";
    if (hour >= 5 && hour < 12) return "Good morning, Linear.";
    if (hour >= 12 && hour < 17) return "Good afternoon, Linear.";
    return "Good evening, Linear.";
  };

  const handlePromptCardClick = (query) => {
    onSendMessage(query);
  };

  const handleTextareaChange = (e) => {
    setInputText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const text = inputText.trim();
    if (!text || isThinking) return;
    setInputText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    onSendMessage(text);
  };

  const handleReflect = () => {
    const query = "Synthesize higher-order insights across all stored events: What specific content formats and PR deployments yielded the highest AI citations vs Jira?";
    onSendMessage(query);
  };

  const toggleDrawer = (index) => {
    setOpenDrawers((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const renderMarkdown = (text) => {
    if (!text) return "";
    let cleaned = text.replace(/\|\s*\|/g, "|\n|");
    cleaned = cleaned.replace(/\|\s*(\|-+)/g, "|\n$1");
    try {
      return marked.parse(cleaned, { gfm: true, breaks: true });
    } catch {
      return text;
    }
  };

  const isWelcomeVisible = messages.length === 0 && !isThinking;

  const renderComposer = () => (
    <div className="composer-container">
      <textarea
        ref={textareaRef}
        id="chatInputText"
        className="composer-textarea"
        rows="1"
        placeholder="How can I help you today?"
        value={inputText}
        onChange={handleTextareaChange}
        onKeyDown={handleKeyDown}
      />

      <div className="composer-toolbar">
        <div className="toolbar-left">
          <button
            className="claude-icon-btn"
            id="btnComposerAdd"
            title="Log Feature / Event to Hindsight"
            onClick={onOpenModal}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>

          <div className="claude-mode-group">
            <button
              className={`claude-mode-pill ${activeMode === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveMode('chat')}
            >
              Chat
            </button>
            <button
              className={`claude-mode-pill ${activeMode === 'reflect' ? 'active reflect' : ''}`}
              title="Hindsight Memory Reflection"
              onClick={() => {
                setActiveMode('reflect');
                handleReflect();
              }}
            >
              Reflect
            </button>
          </div>
        </div>

        <div className="toolbar-right">
          <button
            className="claude-model-pill"
            title="Groq LLaMA 3.3 Versatile • Bank linear-seo-intelligence"
            onClick={() => showToast("🧠 Bank: linear-seo-intelligence • LLaMA 3.3 70B", "info")}
          >
            <span>Hindsight 70B</span>
            <span className="claude-model-badge">High</span>
            <svg className="chevron-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          <button
            className="claude-icon-btn"
            title="Voice Input"
            onClick={() => showToast("🎙️ Voice input ready", "info")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </button>

          <button
            className={`claude-send-btn ${inputText.trim() ? 'active' : ''}`}
            id="btnSendMessage"
            aria-label="Send message"
            onClick={handleSend}
            disabled={isThinking || !inputText.trim()}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="19" x2="12" y2="5"/>
              <polyline points="5 12 12 5 19 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <section className={`view-container active ${isWelcomeVisible ? 'is-empty-state' : 'is-conversation'}`} id="viewChat">
      {isWelcomeVisible ? (
        /* Empty State: Claude Centered Hero & Composer */
        <div className="claude-empty-wrapper">
          <div className="claude-hero">
            <ClaudeStarburst />
            <h1 className="claude-greeting">{getClaudeGreeting()}</h1>
          </div>

          <div className="claude-composer-shell">
            {renderComposer()}

            {/* Subtle, Minimal Single-line Prompt Chips */}
            <div className="claude-chips-row">
              <button
                className="claude-chip"
                onClick={() => handlePromptCardClick("Why did our Perplexity citation rate and referral signups drop in mid-February?")}
              >
                <span className="claude-chip-dot"></span>
                <span>Why did Perplexity citations drop in mid-Feb?</span>
              </button>
              <button
                className="claude-chip"
                onClick={() => handlePromptCardClick("What should we do to beat Jira after their 25% enterprise price hike?")}
              >
                <span className="claude-chip-dot"></span>
                <span>How to counter Jira's 25% price hike</span>
              </button>
              <button
                className="claude-chip"
                onClick={() => handlePromptCardClick("How should we update /switch-from-jira to leverage the new Linear Asks AI feature?")}
              >
                <span className="claude-chip-dot"></span>
                <span>Linear Asks GEO positioning strategy</span>
              </button>
            </div>

            <div className="claude-disclaimer">
              Powered by <strong>Vectorize Hindsight</strong> memory bank <code>linear-seo-intelligence</code> • Groq Free Tier
            </div>
          </div>
        </div>
      ) : (
        /* Active Conversation Mode */
        <>
          <div className="chat-scroll-area" id="chatScrollArea" ref={chatScrollRef}>
            <div className="messages-container" id="messagesContainer">
              {messages.map((msg, index) => {
                if (msg.role === "user") {
                  return (
                    <div key={index} className="message-row user">
                      <div className="message-bubble">{msg.content}</div>
                    </div>
                  );
                }

                const memories = msg.recalled_memories || [];
                const isDrawerOpen = !!openDrawers[index];

                return (
                  <div key={index} className="message-row assistant">
                    <div className="message-avatar">
                      <ClaudeStarburst />
                    </div>
                    <div className="message-bubble">
                      {memories.length > 0 && (
                        <div className="memory-badge-wrapper">
                          <button
                            className="memory-pill-badge interactive"
                            onClick={() => toggleDrawer(index)}
                          >
                            <span>⚡ {memories.length} Memories Recalled from Hindsight</span>
                            <svg
                              className="chevron-icon"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              style={{
                                transform: isDrawerOpen ? 'rotate(180deg)' : 'none',
                                transition: 'transform 0.2s'
                              }}
                            >
                              <polyline points="6 9 12 15 18 9"/>
                            </svg>
                          </button>
                          {isDrawerOpen && (
                            <div className="memory-drawer open">
                              <div className="memory-drawer-title">Retrieved Hindsight Memory Units:</div>
                              {memories.map((m, mIdx) => (
                                <div key={mIdx} className="memory-drawer-item">
                                  {typeof m === 'object' ? `${m.week_label || ''} [${m.event_type || 'event'}]: ${m.description || ''}` : String(m)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div
                        className="markdown-content"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Thinking State */}
              {isThinking && (
                <div className="message-row assistant">
                  <div className="message-avatar">
                    <ClaudeStarburst />
                  </div>
                  <div className="message-bubble">
                    <span className="memory-pill-badge">Recalling from Bank: linear-seo-intelligence...</span>
                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.4rem' }}>
                      Reasoning across 8-week timeline and competitor moves...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="chat-input-wrapper fixed-composer">
            {renderComposer()}
            <div className="claude-disclaimer">
              Powered by <strong>Vectorize Hindsight</strong> memory bank <code>linear-seo-intelligence</code> • Groq Free Tier
            </div>
          </div>
        </>
      )}
    </section>
  );
}
