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

export default function ChatView({
  messages,
  isThinking,
  onSendMessage,
  onOpenModal,
  showToast
}) {
  const [inputText, setInputText] = useState("");
  const [promptSetIndex, setPromptSetIndex] = useState(0);
  const [openDrawers, setOpenDrawers] = useState({});
  const chatScrollRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  // Compute greeting dynamically
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleRotatePrompts = () => {
    setPromptSetIndex((prev) => (prev + 1) % PROMPT_SETS.length);
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

  return (
    <section className="view-container active" id="viewChat">
      {/* Chat Scroll Area */}
      <div className="chat-scroll-area" id="chatScrollArea" ref={chatScrollRef}>
        
        {/* Empty State Welcome Card */}
        {isWelcomeVisible && (
          <div className="welcome-container" id="welcomeContainer">
            <div className="welcome-status-pill">
              <span className="green-status-dot"></span>
              <span>AUTONOMOUS GEO INTELLIGENCE • HINDSIGHT ENGINE</span>
            </div>
            <div className="welcome-hero-text">
              <h1 className="hero-greeting" id="heroGreeting">
                {getGreeting()}, <span className="mint-gradient-text">Linear Marketing Team</span>
              </h1>
              <h2 className="hero-question">What would you like to investigate?</h2>
            </div>
            <p className="welcome-instruction">
              Select a causal investigation vector below or ask any question to recall from 8+ weeks of Hindsight memory
            </p>

            <div className="prompt-cards-grid" id="promptCardsGrid">
              {PROMPT_SETS[promptSetIndex].map((item, idx) => (
                <button
                  key={idx}
                  className="prompt-card"
                  onClick={() => handlePromptCardClick(item.query)}
                >
                  <div className="card-prompt-header">
                    <span className="prompt-text">{item.display}</span>
                    <svg className="corner-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="7" y1="17" x2="17" y2="7"/>
                      <polyline points="7 7 17 7 17 17"/>
                    </svg>
                  </div>
                  <span className="prompt-tag">{item.tag}</span>
                </button>
              ))}
            </div>

            <button className="btn-refresh-prompt" id="btnRefreshPrompts" onClick={handleRotatePrompts}>
              <svg className="refresh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6"/>
                <path d="M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              <span>Refresh Prompt</span>
            </button>
          </div>
        )}

        {/* Chat Messages */}
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
                <div className="message-avatar">🧠</div>
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
              <div className="message-avatar">🧠</div>
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

      {/* Chat Input Bar (Floating Studio Design) */}
      <div className="chat-input-wrapper">
        <div className="composer-container">
          <textarea
            ref={textareaRef}
            id="chatInputText"
            className="composer-textarea"
            rows="1"
            placeholder="Ask AI Anything.."
            value={inputText}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
          />

          <div className="composer-toolbar">
            <div className="toolbar-left">
              <button
                className="composer-btn-icon"
                id="btnComposerAdd"
                title="Log Feature / Event"
                onClick={onOpenModal}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
              <button
                className="composer-pill-btn"
                id="btnThinkBigger"
                title="Hindsight Deep Memory Synthesis"
                onClick={handleReflect}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                <span>Hindsight Reflect</span>
              </button>
              <button
                className="composer-pill-btn"
                id="btnMoreOptions"
                title="Quick Simulation Actions"
                onClick={() => showToast("⚡ Active Mode: GEO Strategy Agent with Linear vs Jira memory context", "info")}
              >
                <span>••• More</span>
              </button>
            </div>

            <div className="toolbar-right">
              <button
                className="btn-send-pill"
                id="btnSendMessage"
                aria-label="Send message"
                onClick={handleSend}
                disabled={isThinking || !inputText.trim()}
              >
                <svg className="arrow-up" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="19" x2="12" y2="5"/>
                  <polyline points="5 12 12 5 19 12"/>
                </svg>
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>

        <div className="input-disclaimer">
          Powered by <strong>Vectorize Hindsight</strong> memory bank <code>linear-seo-intelligence</code> • Groq Free Tier
        </div>
      </div>
    </section>
  );
}
