import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

const CATEGORY_LABELS = {
  CODE_RELEASE: 'Code release',
  PERF_OPTIMIZATION: 'Performance optimization',
  SCHEMA_UPDATE: 'Schema table',
  BENCHMARK_RELEASE: 'Benchmark release',
  AI_FEATURE: 'AI feature'
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

const COPILOT_QUERIES = [
  {
    label: "How did PR merges impact Perplexity citation rate?",
    prompt: "How did the latest PR merges (Linear Asks and SQLite sync) impact our Perplexity citation rate?"
  },
  {
    label: "What factors in markdown tables caused AI to cite Linear?",
    prompt: "What content factors in our markdown comparison table caused AI search engines to prefer Linear over Jira?"
  },
  {
    label: "Synthesize technical release note from Hindsight memory",
    prompt: "Synthesize a technical release note based on our committed Hindsight memories."
  }
];

export default function CoderMemoryView({ onNavigateToChatWithPrompt, showToast }) {
  const { user } = useAuth();
  const [features, setFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isHighlighted, setIsHighlighted] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [prNumber, setPrNumber] = useState('');
  const [commitHash, setCommitHash] = useState('');
  const [category, setCategory] = useState('CODE_RELEASE');
  const [page, setPage] = useState('linear.app/features/ai-sync');
  const [details, setDetails] = useState('');
  const [geoImpact, setGeoImpact] = useState('');
  const [activeTab, setActiveTab] = useState('ingest'); // 'ingest' | 'memory-stream'

  // Validation State
  const [touched, setTouched] = useState({ title: false, details: false });

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

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const applyPreset = (preset) => {
    setTitle(preset.title);
    setPrNumber(preset.pr);
    setCommitHash(preset.commit);
    setCategory(preset.category);
    setPage(preset.page);
    setDetails(preset.details);
    setGeoImpact(preset.impact);
    setTouched({ title: false, details: false });
    setSuccessMessage('');

    // Highlight form fields briefly
    setIsHighlighted(true);
    setTimeout(() => setIsHighlighted(false), 250);

    if (showToast) showToast(`Loaded template: ${preset.pr}`, 'info');
  };

  const handleClearForm = () => {
    setTitle('');
    setPrNumber('');
    setCommitHash('');
    setCategory('CODE_RELEASE');
    setPage('linear.app/features/ai-sync');
    setDetails('');
    setGeoImpact('');
    setTouched({ title: false, details: false });
    setSuccessMessage('');
  };

  const isFormValid = title.trim().length > 0 && details.trim().length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ title: true, details: true });
    if (!isFormValid) return;

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      const payload = {
        title: title.trim(),
        pr_number: prNumber.trim() || `PR #${Math.floor(1000 + Math.random() * 900)}`,
        commit_hash: commitHash.trim() || Math.random().toString(16).substring(2, 9),
        category,
        page: page.trim(),
        details: details.trim(),
        geo_impact_hypothesis: geoImpact.trim() || "Expands technical citation footprint across AI search engines.",
        coder_name: user?.name || "Alex Chen",
        date: new Date().toISOString().split('T')[0]
      };

      const res = await fetch('/api/coder/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Feature memory ingestion failed');
      const data = await res.json();

      if (data.feature) {
        setFeatures((prev) => [data.feature, ...prev]);
      } else {
        fetchFeatures();
      }

      setSuccessMessage(`Feature "${title.trim()}" committed to Hindsight memory bank.`);
      if (showToast) showToast(`Feature committed to Hindsight memory bank`, 'success');

      // Clear fields
      setTitle('');
      setPrNumber('');
      setCommitHash('');
      setDetails('');
      setGeoImpact('');
      setTouched({ title: false, details: false });
    } catch (err) {
      if (showToast) showToast('Error updating memory: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tab arrow key navigation
  const handleTabKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      setActiveTab((prev) => (prev === 'ingest' ? 'memory-stream' : 'ingest'));
    }
  };

  return (
    <div className="coder-memory-view">
      <div className="coder-memory-container">

        {/* 1. Header Section: Matches GEO page header pattern */}
        <header className="hub-page-header">
          <div className="hub-header-meta">
            <span className="hub-bank-label">Bank: linear-seo-intelligence</span>
          </div>
          <h1 className="hub-page-title">Engineering Feature &amp; Memory Ingestion Hub</h1>
          <p className="hub-page-desc">
            Log engineering changes so AI search and the Marketing team reflect them.
          </p>

          {/* 2. Underlined Tab Bar: Same as GEO page */}
          <div
            className="tab-bar-container"
            role="tablist"
            aria-label="Memory Hub Sections"
            onKeyDown={handleTabKeyDown}
          >
            <button
              type="button"
              role="tab"
              id="tab-ingest"
              aria-controls="panel-ingest"
              aria-selected={activeTab === 'ingest'}
              className={`studio-tab-btn ${activeTab === 'ingest' ? 'active' : ''}`}
              onClick={() => setActiveTab('ingest')}
            >
              Update Memory with New Feature
            </button>
            <button
              type="button"
              role="tab"
              id="tab-stream"
              aria-controls="panel-stream"
              aria-selected={activeTab === 'memory-stream'}
              className={`studio-tab-btn ${activeTab === 'memory-stream' ? 'active' : ''}`}
              onClick={() => setActiveTab('memory-stream')}
            >
              Live Hindsight Memory Stream ({features.length})
            </button>
          </div>
        </header>

        {/* TAB 1: INGESTION FORM & RIGHT RAIL */}
        {activeTab === 'ingest' && (
          <div
            id="panel-ingest"
            role="tabpanel"
            aria-labelledby="tab-ingest"
            className="coder-hub-grid"
          >
            {/* Form Card (2/3 width) */}
            <div className={`hub-card form-card ${isHighlighted ? 'preset-highlight' : ''}`}>
              <div className="card-header-block">
                <h2 className="card-section-title">Log Feature into Hindsight Bank</h2>
                <p className="card-section-desc">
                  Ingest merged PRs, optimizations, and schema updates into the persistent Vectorize Hindsight memory bank.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                {/* Title */}
                <div className="hub-form-group">
                  <label htmlFor="feature-title" className="hub-form-label">
                    Feature or enhancement title <span className="field-required">*</span>
                  </label>
                  <input
                    id="feature-title"
                    type="text"
                    className={`hub-form-input ${touched.title && !title.trim() ? 'input-error' : ''}`}
                    placeholder="Sub-40ms SQLite Optimistic Sync Engine"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => handleBlur('title')}
                    aria-required="true"
                    aria-invalid={touched.title && !title.trim()}
                    aria-describedby={touched.title && !title.trim() ? 'title-error' : undefined}
                  />
                  {touched.title && !title.trim() && (
                    <span id="title-error" className="hub-field-error">
                      Feature title is required.
                    </span>
                  )}
                </div>

                {/* Pull Request & Commit Hash */}
                <div className="hub-form-row">
                  <div className="hub-form-group">
                    <label htmlFor="feature-pr" className="hub-form-label">
                      Pull request #
                    </label>
                    <input
                      id="feature-pr"
                      type="text"
                      className="hub-form-input font-code"
                      placeholder="PR #1042"
                      value={prNumber}
                      onChange={(e) => setPrNumber(e.target.value)}
                    />
                  </div>

                  <div className="hub-form-group">
                    <label htmlFor="feature-commit" className="hub-form-label">
                      Commit hash
                    </label>
                    <input
                      id="feature-commit"
                      type="text"
                      className="hub-form-input font-code"
                      placeholder="7b8e19a"
                      value={commitHash}
                      onChange={(e) => setCommitHash(e.target.value)}
                    />
                  </div>
                </div>

                {/* Category & Documentation Route */}
                <div className="hub-form-row">
                  <div className="hub-form-group">
                    <label htmlFor="feature-category" className="hub-form-label">
                      Category
                    </label>
                    <div className="select-wrapper">
                      <select
                        id="feature-category"
                        className="hub-form-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="CODE_RELEASE">Code release</option>
                        <option value="PERF_OPTIMIZATION">Performance optimization</option>
                        <option value="SCHEMA_UPDATE">Schema table</option>
                        <option value="BENCHMARK_RELEASE">Benchmark release</option>
                        <option value="AI_FEATURE">AI feature</option>
                      </select>
                      <svg className="select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>

                  <div className="hub-form-group">
                    <label htmlFor="feature-route" className="hub-form-label">
                      Documentation route
                    </label>
                    <input
                      id="feature-route"
                      type="text"
                      className="hub-form-input font-code"
                      placeholder="linear.app/features/ai-sync"
                      value={page}
                      onChange={(e) => setPage(e.target.value)}
                    />
                  </div>
                </div>

                {/* Technical Details */}
                <div className="hub-form-group">
                  <label htmlFor="feature-details" className="hub-form-label">
                    Technical details &amp; implementation <span className="field-required">*</span>
                  </label>
                  <textarea
                    id="feature-details"
                    className={`hub-form-textarea ${touched.details && !details.trim() ? 'input-error' : ''}`}
                    placeholder="Detail the architecture, API contracts, latency improvements, or sub-systems shipped..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    onBlur={() => handleBlur('details')}
                    rows={4}
                    aria-required="true"
                    aria-invalid={touched.details && !details.trim()}
                    aria-describedby={touched.details && !details.trim() ? 'details-error' : undefined}
                  />
                  {touched.details && !details.trim() && (
                    <span id="details-error" className="hub-field-error">
                      Technical details are required.
                    </span>
                  )}
                </div>

                {/* GEO Hypothesis */}
                <div className="hub-form-group">
                  <label htmlFor="feature-geo" className="hub-form-label">
                    GEO hypothesis <span className="label-helper-text">— How does this help beat Jira?</span>
                  </label>
                  <textarea
                    id="feature-geo"
                    className="hub-form-textarea-short"
                    placeholder="e.g. Forces Perplexity to cite sub-second sync over Jira's legacy server architecture"
                    value={geoImpact}
                    onChange={(e) => setGeoImpact(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Success Banner */}
                {successMessage && (
                  <div className="hub-inline-success" role="status" aria-live="polite">
                    <svg className="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="hub-form-actions">
                  <button
                    type="button"
                    className="btn-secondary-quiet"
                    onClick={handleClearForm}
                  >
                    Clear form
                  </button>
                  <button
                    type="submit"
                    className="btn-primary-studio"
                    disabled={!isFormValid || isSubmitting}
                  >
                    {isSubmitting ? 'Committing to memory...' : 'Commit to Hindsight memory bank'}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Rail (1/3 width) */}
            <div className="hub-right-rail">
              {/* Card 1: Quick presets */}
              <div className="hub-card rail-card">
                <div className="rail-card-header">
                  <h3 className="rail-title">Quick presets</h3>
                  <p className="rail-desc">
                    Load verified engineering templates to populate the ingestion form.
                  </p>
                </div>

                <div className="preset-list" role="list" aria-label="Quick presets">
                  {PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      role="listitem"
                      className="preset-item-row"
                      onClick={() => applyPreset(p)}
                      title={p.details}
                      aria-label={`Load preset ${p.pr}: ${p.title}`}
                    >
                      <div className="preset-title">{p.title}</div>
                      <div className="preset-meta-line">
                        <span className="font-code">{p.pr}</span>
                        <span className="meta-dot">·</span>
                        <span>{CATEGORY_LABELS[p.category] || p.category}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Card 2: Ask the Copilot */}
              <div className="hub-card rail-card">
                <div className="rail-card-header">
                  <h3 className="rail-title">Ask the Copilot</h3>
                  <p className="rail-desc">
                    Prompt the agent to trace how code modifications correlate with citation authority.
                  </p>
                </div>

                <div className="copilot-query-list" role="list" aria-label="Copilot queries">
                  {COPILOT_QUERIES.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      role="listitem"
                      className="copilot-query-row"
                      onClick={() => onNavigateToChatWithPrompt(q.prompt)}
                      aria-label={`Ask copilot: ${q.label}`}
                    >
                      <span className="query-text">{q.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE MEMORY STREAM */}
        {activeTab === 'memory-stream' && (
          <div
            id="panel-stream"
            role="tabpanel"
            aria-labelledby="tab-stream"
            className="hub-card stream-card"
          >
            <div className="stream-header-row">
              <div>
                <h2 className="card-section-title">Committed Features in Hindsight Memory Bank</h2>
                <p className="card-section-desc">
                  All feature deployments, optimizations, and PRs ingested into <code>linear-seo-intelligence</code>
                </p>
              </div>
              <button
                type="button"
                className="btn-secondary-outline stream-refresh-btn"
                onClick={fetchFeatures}
              >
                Refresh memory stream
              </button>
            </div>

            {isLoading ? (
              <div className="stream-empty-state">
                Loading Hindsight memories...
              </div>
            ) : features.length === 0 ? (
              <div className="stream-empty-state">
                No features committed to memory yet. Switch to "Update Memory with New Feature" to ingest code releases.
              </div>
            ) : (
              <div className="stream-feature-list" role="list" aria-label="Committed features">
                {features.map((feat) => (
                  <div key={feat.id || Math.random()} className="stream-feature-item" role="listitem">
                    <div className="feature-item-header">
                      <div className="feature-badges-cluster">
                        <span className="feature-pr-pill font-code">
                          {feat.pr_number || 'PR #MERGED'}
                        </span>
                        {feat.commit_hash && (
                          <span className="feature-commit-text font-code">
                            commit {feat.commit_hash}
                          </span>
                        )}
                        <span className="feature-category-tag">
                          {CATEGORY_LABELS[feat.category] || feat.category}
                        </span>
                      </div>

                      <div className="feature-meta-cluster">
                        <span className="feature-status-tag">In Hindsight bank</span>
                        <span className="feature-date">{feat.date}</span>
                      </div>
                    </div>

                    <h3 className="feature-item-title">{feat.title}</h3>
                    <p className="feature-item-details">{feat.details}</p>

                    {feat.geo_impact_hypothesis && (
                      <div className="feature-hypothesis-box">
                        <span className="hypothesis-label">GEO hypothesis:</span>{' '}
                        <span className="hypothesis-text">{feat.geo_impact_hypothesis}</span>
                      </div>
                    )}

                    <div className="feature-item-footer">
                      <div className="footer-meta-left">
                        <span>Author: <strong>{feat.coder_name || 'Alex Chen'}</strong></span>
                        <span className="meta-dot">·</span>
                        <span>Route: <code className="font-code">{feat.page}</code></span>
                      </div>
                      <button
                        type="button"
                        className="btn-quiet-action"
                        onClick={() => onNavigateToChatWithPrompt(`Analyze the impact of feature "${feat.title}" (${feat.pr_number}) on our AI search citations.`)}
                      >
                        Ask AI about this feature
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
