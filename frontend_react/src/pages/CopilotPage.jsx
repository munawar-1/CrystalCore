import React, { useState, useEffect } from 'react';
import Sidebar from '../components/copilot/Sidebar';
import TopNavbar from '../components/copilot/TopNavbar';
import ChatView from '../components/copilot/ChatView';
import AnalyticsView from '../components/copilot/AnalyticsView';
import FeatureModal from '../components/copilot/FeatureModal';
import '../styles/copilot.css';

const INITIAL_SESSIONS = {
  "chat-1": {
    title: "Feb Citation Drop Root Cause",
    messages: []
  },
  "chat-2": {
    title: "Jira Comparison Table Attack",
    messages: [
      {
        role: "user",
        content: "What should we do to beat Jira after their 25% enterprise price hike?"
      },
      {
        role: "assistant",
        content: `### 🎯 Competitive Strategy: Countering Jira's 25% Price Hike\n\nBased on Vectorize Hindsight memories (**Week 4** & **Week 7**):\n\n| Attack Vector | Recommended Tactic | Expected AI Citation Lift |\n|---|---|---|\n| **Interactive Pricing Matrix** | Direct cost calculator for 50-500 seats comparing Linear ($12/user) vs Jira ($15/user + add-ons) | **+24%** on ChatGPT Search |\n| **Markdown Feature Matrix** | Clear breakdown of built-in roadmap, cycles, and SLA without plugins | **+31%** on Perplexity AI |\n| **Migration Automation** | Highlighting Linear 1-click Jira importer with zero data loss | **+18%** on Gemini Search |\n\n> 💡 **Hindsight Finding:** Algorithmic search models cite structured pricing comparison tables 3.8x more frequently than narrative blog posts.`,
        recalled_memories: [
          {
            event_type: "competitor_move",
            week_label: "Week 7 (Feb 23)",
            description: "Atlassian enacted a 25% price increase across Jira Cloud Enterprise tiers, sparking migration queries."
          },
          {
            event_type: "site_edit",
            week_label: "Week 4 (Feb 02)",
            description: "Published /switch-from-jira comparison table targeting migration keywords."
          }
        ]
      }
    ]
  },
  "chat-3": {
    title: "Linear Asks SEO Rollout",
    messages: [
      {
        role: "user",
        content: "How should we update /switch-from-jira to leverage the new Linear Asks AI feature?"
      },
      {
        role: "assistant",
        content: `### 🚀 Product SEO Rollout: Leveraging Linear Asks\n\nAccording to Hindsight bank \`linear-seo-intelligence\`:\n\n1. **Target Query Cluster**: Position *Linear Asks* against Jira Service Management (JSM).\n2. **GEO Schema Optimization**: Embed \`SoftwareApplication\` schema and structured Q&A tables explaining how Linear Asks uses workplace AI without requiring $30/mo Jira Atlassian Intelligence add-ons.\n3. **Benchmark Proof**: Include sub-second triage speed comparisons to boost ChatGPT Search citation authority.\n\n> 🔍 **Citation Impact:** Linear Asks mentions increased organic developer citations by **+19%** within 10 days of the Week 2 release announcement.`,
        recalled_memories: [
          {
            event_type: "site_edit",
            week_label: "Week 2 (Jan 19)",
            description: "Launched Linear Asks (AI workplace assistant) with dedicated product documentation."
          }
        ]
      }
    ]
  }
};

export default function CopilotPage({ onNavigate, initialView = 'chat' }) {
  const [activeView, setActiveView] = useState(initialView);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentChatId, setCurrentChatId] = useState('chat-1');
  const [chatSessions, setChatSessions] = useState(INITIAL_SESSIONS);
  const [isThinking, setIsThinking] = useState(false);
  const [timelineData, setTimelineData] = useState(null);
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast manager
  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Fetch timeline on mount
  useEffect(() => {
    async function loadTimeline() {
      try {
        const res = await fetch('/api/timeline');
        if (res.ok) {
          const data = await res.json();
          setTimelineData(data);
        }
      } catch (err) {
        console.error('Failed to load timeline:', err);
      }
    }
    loadTimeline();
  }, []);

  // Update view if initialView changes
  useEffect(() => {
    if (initialView) {
      setActiveView(initialView);
    }
  }, [initialView]);

  const handleToggleCollapse = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const handleSwitchView = (view) => {
    setActiveView(view);
  };

  const handleSelectChat = (id) => {
    setCurrentChatId(id);
    setActiveView('chat');
  };

  const handleNewChat = () => {
    const newId = `chat-${Date.now()}`;
    setChatSessions((prev) => ({
      ...prev,
      [newId]: {
        title: "New Investigation",
        messages: []
      }
    }));
    setCurrentChatId(newId);
    setActiveView('chat');
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    // Update session title if needed
    setChatSessions((prev) => {
      const current = prev[currentChatId];
      if (!current) return prev;
      const updatedMessages = [...current.messages, { role: 'user', content: text }];
      let newTitle = current.title;
      if (newTitle === 'New Investigation' || newTitle.includes('Feb Citation')) {
        newTitle = text.length > 28 ? `${text.substring(0, 28)}...` : text;
      }
      return {
        ...prev,
        [currentChatId]: {
          ...current,
          title: newTitle,
          messages: updatedMessages
        }
      };
    });

    setIsThinking(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      if (!res.ok) throw new Error('Chat API returned error');
      const data = await res.json();

      setChatSessions((prev) => {
        const current = prev[currentChatId];
        if (!current) return prev;
        return {
          ...prev,
          [currentChatId]: {
            ...current,
            messages: [
              ...current.messages,
              {
                role: 'assistant',
                content: data.reply,
                recalled_memories: data.recalled_memories
              }
            ]
          }
        };
      });

      if (data.auto_retained) {
        showToast("✅ Ingested update into Hindsight memory bank!", "success");
      }
    } catch (e) {
      setChatSessions((prev) => {
        const current = prev[currentChatId];
        if (!current) return prev;
        return {
          ...prev,
          [currentChatId]: {
            ...current,
            messages: [
              ...current.messages,
              {
                role: 'assistant',
                content: `I encountered an issue querying Hindsight: ${e.message}`
              }
            ]
          }
        };
      });
    } finally {
      setIsThinking(false);
    }
  };

  const handleRetainMemory = async (payload) => {
    try {
      const res = await fetch('/api/memory/retain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Memory retain failed');
      const data = await res.json();

      showToast(`✅ Ingested into Hindsight Bank: "${payload.title}"`, "success");

      // Post confirmation into active chat
      setActiveView('chat');
      setChatSessions((prev) => {
        const current = prev[currentChatId] || { title: "New Investigation", messages: [] };
        return {
          ...prev,
          [currentChatId]: {
            ...current,
            messages: [
              ...current.messages,
              {
                role: 'assistant',
                content: `**✅ New Event Retained into Long-Term Memory:**\n- **Title:** ${payload.title}\n- **Category:** \`${payload.event_type}\`\n- **Page:** ${payload.page}\n- **Details:** ${payload.details}\n\nI have committed this to bank \`linear-seo-intelligence\`. When drafting our next comparison matrix, I will factor this capability against Jira.`
              }
            ]
          }
        };
      });
    } catch (err) {
      showToast("Error retaining memory: " + err.message, "error");
    }
  };

  const handleAskAboutPin = (event) => {
    setActiveView('chat');
    handleSendMessage(`Why did the event on ${event.date} ('${event.title}') impact our Perplexity citation rate and referral signups?`);
  };

  const handleNavigateToChatWithPrompt = (promptText) => {
    setActiveView('chat');
    handleSendMessage(promptText);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast("🔗 Session link copied to clipboard!", "success");
  };

  const currentMessages = chatSessions[currentChatId]?.messages || [];

  return (
    <div className="claude-theme">
      <div className="app-shell">
        {/* Left Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
          activeView={activeView}
          onSwitchView={handleSwitchView}
          chatSessions={chatSessions}
          currentChatId={currentChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onNavigateLanding={() => onNavigate ? onNavigate('/') : window.location.href = '/'}
          showToast={showToast}
        />

        {/* Main Application Area */}
        <div className="app-main">
          {/* Top Navbar */}
          <TopNavbar
            onNavigateLanding={() => onNavigate ? onNavigate('/') : window.location.href = '/'}
            onOpenConfig={() => setIsFeatureModalOpen(true)}
            onToggleSidebar={handleToggleCollapse}
            onShare={handleShare}
          />

          {/* Chat or Analytics View */}
          {activeView === 'chat' ? (
            <ChatView
              messages={currentMessages}
              isThinking={isThinking}
              onSendMessage={handleSendMessage}
              onOpenModal={() => setIsFeatureModalOpen(true)}
              showToast={showToast}
            />
          ) : (
            <AnalyticsView
              timelineData={timelineData}
              onAskAboutPin={handleAskAboutPin}
              onNavigateToChatWithPrompt={handleNavigateToChatWithPrompt}
            />
          )}
        </div>
      </div>

      {/* Feature Retain Modal */}
      <FeatureModal
        isOpen={isFeatureModalOpen}
        onClose={() => setIsFeatureModalOpen(false)}
        onSubmit={handleRetainMemory}
      />

      {/* Toast Notifications */}
      <div className="toast-container" id="toastContainer">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
