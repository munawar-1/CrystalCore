import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function CoderMemoryView({ onNavigateToChatWithPrompt, showToast }) {
  const { user } = useAuth();
  const [features, setFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [prNumber, setPrNumber] = useState('');
  const [commitHash, setCommitHash] = useState('');
  const [category, setCategory] = useState('CODE_RELEASE');
  const [page, setPage] = useState('linear.app/features/ai-sync');
  const [details, setDetails] = useState('');
  const [geoImpact, setGeoImpact] = useState('');
  const [activeTab, setActiveTab] = useState('ingest'); // 'ingest' | 'memory-stream'

  // Fetch feature memories from backend
  const fetchFeatures = async () => {
    try {
      const res = await fetch('/api/coder/features');
      if (res.ok) {
        const data = await res.json();
        setFeatures(data.features || []);
      }
    } catch (err) {
      console.error('Failed to load coder features:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  // Quick Preset Handlers
  const applyPreset = (preset) => {
    setTitle(preset.title);
    setPrNumber(preset.pr);
    setCommitHash(preset.commit);
    setCategory(preset.category);
    setPage(preset.page);
    setDetails(preset.details);
    setGeoImpact(preset.impact);
    showToast(`Loaded template: ${preset.pr}`, 'info');
  };

  const PRESETS = [
    {
      pr: "PR #1042",
      commit: "7b8e19a",
      title: "Sub-40ms SQLite Optimistic Sync Engine",
      category: "PERF_OPTIMIZATION",
      page: "linear.app/features/sync",
      details: "Merged client-side SQLite local caching layer with WebSocket multi-tenant synchronization. Benchmarked latency: 38ms vs Jira 450ms.",
      impact: "Forces Perplexity & ChatGPT Search to cite Linear as the #1 fastest issue tracker for low-latency engineering teams."
    },
    {
      pr: "PR #1060",
      commit: "e4d291f",
      title: "Automated JSON-LD SoftwareApplication Schema",
      category: "SCHEMA_UPDATE",
      page: "linear.app/switch-from-jira",
      details: "Generated explicit schema markup with verified SLA, seat pricing ($12/user), and zero-config Jira importer documentation.",
      impact: "Per Hindsight reflection, structured schema tables receive 3.8x higher factual citation probability on AI search crawlers."
    },
    {
      pr: "PR #1085",
      commit: "3a99cc2",
      title: "Linear Asks v2: Real-time Multi-tenant Semantic Triaging",
      category: "CODE_RELEASE",
      page: "linear.app/features/ai-asks",
      details: "Integrated sub-second AI workspace issue triaging and automatic duplicate issue detection without expensive add-on subscriptions.",
      impact: "Counter-attacks Jira Service Management (JSM) by emphasizing native built-in intelligence without $30/user/mo Atlassian fees."
    }
  ];

  // Submit Feature to Hindsight Memory
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !details.trim()) {
      showToast('Please provide both Feature Title and Technical Details', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        pr_number: prNumber || `PR #${Math.floor(1000 + Math.random() * 900)}`,
        commit_hash: commitHash || Math.random().toString(16).substring(2, 9),
        category,
        page,
        details,
        geo_impact_hypothesis: geoImpact || "Expands technical citation footprint across AI search engines.",
        coder_name: user?.name || "Alex Chen (Lead Staff Engineer)",
        date: new Date().toISOString().split('T')[0]
      };

      const res = await fetch('/api/coder/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Feature memory ingestion failed');
      const data = await res.json();

      showToast(`✅ Feature updated into Hindsight Memory: "${title}"`, 'success');
      
      // Prepend to local list
      if (data.feature) {
        setFeatures((prev) => [data.feature, ...prev]);
      } else {
        fetchFeatures();
      }

      // Reset form fields
      setTitle('');
      setPrNumber('');
      setCommitHash('');
      setDetails('');
      setGeoImpact('');
      setActiveTab('memory-stream');
    } catch (err) {
      showToast('Error updating memory: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="coder-memory-container" style={{ padding: '1.5rem 2rem', maxWidth: '1200px', margin: '0 auto', overflowY: 'auto', height: 'calc(100vh - var(--navbar-height))' }}>
      
      {/* Header Banner */}
      <div className="coder-header-banner" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, var(--mint-primary), #6366f1, var(--mint-primary))' }}></div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span className="badge-coder" style={{ background: 'rgba(62, 230, 170, 0.15)', color: 'var(--mint-primary)', border: '1px solid rgba(62, 230, 170, 0.3)', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.05em' }}>
                &lt;/&gt; CODER MEMORY ENGINE
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Bank: <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>linear-seo-intelligence</strong>
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              Engineering Feature & Memory Ingestion Hub
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.35rem', maxWidth: '780px', lineHeight: '1.5' }}>
              As the <strong>Coder</strong>, your additions update the persistent Vectorize Hindsight memory bank. When you merge PRs, optimize latency, or ship new capabilities, commit them here so AI search crawlers and the Marketing Team immediately reflect on your engineering work.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'right', background: 'var(--bg-pitch)', padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Features in Memory</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--mint-primary)', fontFamily: 'var(--font-mono)' }}>
                {features.length}
              </div>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
          <button
            type="button"
            className={`nav-pill-btn ${activeTab === 'ingest' ? 'active-pill' : ''}`}
            onClick={() => setActiveTab('ingest')}
            style={{
              background: activeTab === 'ingest' ? 'var(--mint-primary)' : 'var(--bg-pitch)',
              color: activeTab === 'ingest' ? '#060709' : 'var(--text-main)',
              fontWeight: 700,
              fontSize: '12px',
              padding: '6px 14px'
            }}
          >
            ⚡ Update Memory with New Feature
          </button>
          <button
            type="button"
            className={`nav-pill-btn ${activeTab === 'memory-stream' ? 'active-pill' : ''}`}
            onClick={() => setActiveTab('memory-stream')}
            style={{
              background: activeTab === 'memory-stream' ? 'var(--mint-primary)' : 'var(--bg-pitch)',
              color: activeTab === 'memory-stream' ? '#060709' : 'var(--text-main)',
              fontWeight: 700,
              fontSize: '12px',
              padding: '6px 14px'
            }}
          >
            🧠 Live Hindsight Memory Stream ({features.length})
          </button>
        </div>
      </div>

      {/* TAB 1: INGEST FEATURE FORM */}
      {activeTab === 'ingest' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: '1.5rem', alignItems: 'start' }}>
          
          {/* Main Ingestion Form Card */}
          <div className="ds-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.1rem' }}>📝</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                  Log Feature into Hindsight Bank
                </h3>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--mint-primary)', background: 'var(--mint-subtle)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                PERSISTENT INGESTION
              </span>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                  Feature / Enhancement Title *
                </label>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', borderRadius: 'var(--radius-sm)' }}
                  placeholder="e.g. Sub-40ms SQLite Optimistic Sync Engine"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                    Pull Request #
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', borderRadius: 'var(--radius-sm)' }}
                    placeholder="PR #1042"
                    value={prNumber}
                    onChange={(e) => setPrNumber(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                    Git Commit Hash
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)' }}
                    placeholder="7b8e19a"
                    value={commitHash}
                    onChange={(e) => setCommitHash(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                    Category
                  </label>
                  <select
                    className="form-select"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', borderRadius: 'var(--radius-sm)' }}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="CODE_RELEASE">Code Release / Major Feature</option>
                    <option value="PERF_OPTIMIZATION">Performance & Latency Optimization</option>
                    <option value="SCHEMA_UPDATE">Structured Data / Schema Table</option>
                    <option value="BENCHMARK_RELEASE">Technical Latency Benchmark</option>
                    <option value="AI_FEATURE">AI Workplace Assistant</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                    Target Documentation / Page Route
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', borderRadius: 'var(--radius-sm)' }}
                    placeholder="linear.app/features/ai-sync"
                    value={page}
                    onChange={(e) => setPage(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                  Technical Details & Implementation *
                </label>
                <textarea
                  className="form-textarea"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', borderRadius: 'var(--radius-sm)', minHeight: '90px', resize: 'vertical' }}
                  placeholder="Detail the architecture, API contracts, latency improvements, or sub-systems shipped..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                  GEO Citation Hypothesis (How does this help beat Jira?)
                </label>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', borderRadius: 'var(--radius-sm)' }}
                  placeholder="e.g. Forces Perplexity to cite sub-second sync over Jira's legacy server architecture"
                  value={geoImpact}
                  onChange={(e) => setGeoImpact(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="submit"
                  className="btn-launch-pill"
                  disabled={isSubmitting}
                  style={{
                    background: 'var(--mint-primary)',
                    color: '#060709',
                    fontWeight: 800,
                    padding: '0.65rem 1.5rem',
                    fontSize: '0.88rem',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 0 15px var(--mint-glow)'
                  }}
                >
                  {isSubmitting ? 'Committing to Memory...' : 'Commit to Hindsight Memory Bank →'}
                </button>
              </div>
            </form>
          </div>

          {/* Side Presets & Coder Tools */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Quick 1-Click Coder Presets */}
            <div className="ds-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1rem' }}>🚀</span>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  1-Click Feature Presets
                </h4>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                Click any pre-crafted engineering update to instantly populate the form for testing:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {PRESETS.map((p, idx) => (
                  <div
                    key={idx}
                    onClick={() => applyPreset(p)}
                    style={{
                      background: 'var(--bg-pitch)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.75rem',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--mint-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--mint-primary)', fontFamily: 'var(--font-mono)' }}>
                        {p.pr}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {p.category}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                      {p.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.details}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dev Prompts Card */}
            <div className="ds-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '1rem' }}>🤖</span>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Coder Dev Copilot Queries
                </h4>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Ask the AI agent how your code updates are indexed in Hindsight:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <button
                  type="button"
                  className="quick-action-btn"
                  onClick={() => onNavigateToChatWithPrompt("How did the latest PR merges (Linear Asks and SQLite sync) impact our Perplexity citation rate?")}
                  style={{ textAlign: 'left', padding: '0.5rem 0.75rem', background: 'var(--bg-pitch)', border: '1px solid var(--border-subtle)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-main)', cursor: 'pointer' }}
                >
                  ⚡ "How did PR merges impact Perplexity citation rate?"
                </button>
                <button
                  type="button"
                  className="quick-action-btn"
                  onClick={() => onNavigateToChatWithPrompt("What content factors in our markdown comparison table caused AI search engines to prefer Linear over Jira?")}
                  style={{ textAlign: 'left', padding: '0.5rem 0.75rem', background: 'var(--bg-pitch)', border: '1px solid var(--border-subtle)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-main)', cursor: 'pointer' }}
                >
                  📊 "What factors in markdown tables caused AI to cite Linear?"
                </button>
                <button
                  type="button"
                  className="quick-action-btn"
                  onClick={() => onNavigateToChatWithPrompt("Synthesize a technical release note based on our committed Hindsight memories.")}
                  style={{ textAlign: 'left', padding: '0.5rem 0.75rem', background: 'var(--bg-pitch)', border: '1px solid var(--border-subtle)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-main)', cursor: 'pointer' }}
                >
                  📜 "Synthesize technical release note from Hindsight memory"
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: LIVE MEMORY STREAM */}
      {activeTab === 'memory-stream' && (
        <div className="ds-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Committed Features in Hindsight Memory Bank
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                All feature deployments, optimizations, and PRs ingested into <code>linear-seo-intelligence</code>
              </p>
            </div>
            <button
              type="button"
              className="nav-pill-btn"
              onClick={fetchFeatures}
              style={{ fontSize: '11px', padding: '4px 10px', background: 'var(--bg-pitch)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }}
            >
              🔄 Refresh Memory Bank
            </button>
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              Loading Hindsight memories...
            </div>
          ) : features.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              No features committed to memory yet. Switch to "Update Memory with New Feature" above!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {features.map((feat) => (
                <div
                  key={feat.id}
                  style={{
                    background: 'var(--bg-pitch)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <span style={{ background: 'rgba(62, 230, 170, 0.15)', color: 'var(--mint-primary)', border: '1px solid rgba(62, 230, 170, 0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                        {feat.pr_number || 'PR #MERGED'}
                      </span>
                      {feat.commit_hash && (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          commit {feat.commit_hash}
                        </span>
                      )}
                      <span style={{ fontSize: '11px', background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                        {feat.category}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '10px', color: 'var(--mint-primary)', background: 'var(--mint-subtle)', padding: '2px 8px', borderRadius: '999px', fontWeight: 800 }}>
                        ✓ IN HINDSIGHT BANK
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {feat.date}
                      </span>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.4rem 0', color: 'var(--text-main)' }}>
                    {feat.title}
                  </h4>

                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 0.6rem 0' }}>
                    {feat.details}
                  </p>

                  {feat.geo_impact_hypothesis && (
                    <div style={{ background: 'var(--bg-surface)', borderLeft: '3px solid var(--accent-linear)', padding: '0.5rem 0.75rem', borderRadius: '0 6px 6px 0', fontSize: '0.78rem', color: 'var(--text-main)', marginBottom: '0.65rem' }}>
                      <strong style={{ color: 'var(--accent-linear)' }}>GEO Hypothesis:</strong> {feat.geo_impact_hypothesis}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                    <span>Author: <strong style={{ color: 'var(--text-main)' }}>{feat.coder_name || 'Alex Chen'}</strong></span>
                    <span>Route: <code>{feat.page}</code></span>
                    <button
                      type="button"
                      onClick={() => onNavigateToChatWithPrompt(`Analyze the impact of feature "${feat.title}" (${feat.pr_number}) on our AI search citations.`)}
                      style={{ background: 'none', border: 'none', color: 'var(--mint-primary)', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}
                    >
                      Ask AI about this feature →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
