import React, { useState, useEffect } from 'react';
import AnalyticsView from './AnalyticsView';

export default function MarketingStrategyView({
  timelineData,
  onAskAboutPin,
  onNavigateToChatWithPrompt,
  showToast
}) {
  const [activeTab, setActiveTab] = useState('citations'); // 'citations' | 'probe' | 'coder-bridge'
  const [coderFeatures, setCoderFeatures] = useState([]);
  const [probeQuery, setProbeQuery] = useState('What is the best alternative to Jira Cloud for fast software teams in 2026?');
  const [probeResult, setProbeResult] = useState(null);
  const [isProbing, setIsProbing] = useState(false);

  useEffect(() => {
    async function loadCoderFeatures() {
      try {
        const res = await fetch('/api/coder/features');
        if (res.ok) {
          const data = await res.json();
          setCoderFeatures(data.features || []);
        }
      } catch (e) {
        console.error('Failed to load coder features for marketing:', e);
      }
    }
    loadCoderFeatures();
  }, []);

  const handleRunProbe = async (e) => {
    e.preventDefault();
    if (!probeQuery.trim()) return;
    setIsProbing(true);
    try {
      const res = await fetch('/api/probe/citation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: probeQuery })
      });
      if (res.ok) {
        const data = await res.json();
        setProbeResult(data);
        showToast("Live AI Citation Probe completed!", "success");
      }
    } catch (err) {
      showToast("Probe failed: " + err.message, "error");
    } finally {
      setIsProbing(false);
    }
  };

  return (
    <div className="marketing-strategy-container" style={{ padding: '1.5rem 2rem', maxWidth: '1240px', margin: '0 auto', overflowY: 'auto', height: 'calc(100vh - var(--navbar-height))' }}>

      {/* Marketing Header Banner */}
      <div className="marketing-header-banner" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #5e6ad2, #818cf8, #3ee6aa)' }}></div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span className="badge-marketing" style={{ background: 'rgba(94, 106, 210, 0.15)', color: 'var(--accent-linear)', border: '1px solid rgba(94, 106, 210, 0.3)', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.05em' }}>
                📢 MARKETING INTELLIGENCE HUB
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Rival Tracked: <strong style={{ color: 'var(--text-main)' }}>Atlassian Jira</strong>
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              GEO Citations & Competitive Strategy Studio
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.35rem', maxWidth: '820px', lineHeight: '1.5' }}>
              As the <strong>Marketing Team</strong>, you monitor citation movements, track Atlassian's counter-offensives, and synthesize winning Generative Engine Optimization (GEO) strategies powered by the features committed by your <strong>Coders</strong>.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              className="btn-launch-pill"
              onClick={() => onNavigateToChatWithPrompt("Synthesize an executive summary of all Jira competitive moves over the last 60 days and our recommended counter-measures.")}
              style={{
                background: 'var(--accent-linear)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '12px',
                padding: '0.6rem 1rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Generate Executive Briefing ↗
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`nav-pill-btn ${activeTab === 'citations' ? 'active-pill' : ''}`}
            onClick={() => setActiveTab('citations')}
            style={{
              background: activeTab === 'citations' ? 'var(--accent-linear)' : 'var(--bg-pitch)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '12px',
              padding: '6px 14px'
            }}
          >
            📊 8-Week Multi-Metric Citation Graph
          </button>
          <button
            type="button"
            className={`nav-pill-btn ${activeTab === 'probe' ? 'active-pill' : ''}`}
            onClick={() => setActiveTab('probe')}
            style={{
              background: activeTab === 'probe' ? 'var(--accent-linear)' : 'var(--bg-pitch)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '12px',
              padding: '6px 14px'
            }}
          >
            🎯 Live AI Citation Probe (Perplexity & SearchGPT)
          </button>
          <button
            type="button"
            className={`nav-pill-btn ${activeTab === 'coder-bridge' ? 'active-pill' : ''}`}
            onClick={() => setActiveTab('coder-bridge')}
            style={{
              background: activeTab === 'coder-bridge' ? 'var(--accent-linear)' : 'var(--bg-pitch)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '12px',
              padding: '6px 14px'
            }}
          >
            🚀 Features Shipped by Coders ({coderFeatures.length})
          </button>
        </div>
      </div>

      {/* TAB 1: CITATIONS GRAPH */}
      {activeTab === 'citations' && (
        <AnalyticsView
          timelineData={timelineData}
          onAskAboutPin={onAskAboutPin}
          onNavigateToChatWithPrompt={onNavigateToChatWithPrompt}
        />
      )}

      {/* TAB 2: AI CITATION PROBE */}
      {activeTab === 'probe' && (
        <div className="ds-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              Live AI Citation Evaluator Probe
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Test simulated AI search engine answers (Perplexity, SearchGPT) to see if Linear or Jira gets cited.
            </p>
          </div>

          <form onSubmit={handleRunProbe} style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="form-input"
                style={{ flex: 1, minWidth: '280px', padding: '0.75rem 1rem', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', borderRadius: 'var(--radius-sm)' }}
                value={probeQuery}
                onChange={(e) => setProbeQuery(e.target.value)}
                placeholder="Enter query to probe (e.g. Which tool is faster: Linear or Jira?)"
              />
              <button
                type="submit"
                className="btn-launch-pill"
                disabled={isProbing}
                style={{
                  background: 'var(--accent-linear)',
                  color: '#ffffff',
                  fontWeight: 800,
                  padding: '0.75rem 1.5rem',
                  cursor: isProbing ? 'not-allowed' : 'pointer'
                }}
              >
                {isProbing ? 'Probing LLM Engines...' : 'Run Live Probe →'}
              </button>
            </div>
          </form>

          {probeResult ? (
            <div style={{ background: 'var(--bg-pitch)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--mint-primary)' }}>
                  PROBE RESPONSE & CITATION SOURCES
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Model: LLaMA 3.3 70B (Simulating Perplexity)
                </span>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>
                {probeResult.simulated_response || probeResult.answer || JSON.stringify(probeResult, null, 2)}
              </div>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
              Click <strong>"Run Live Probe"</strong> to simulate an AI search engine response and inspect source citations.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CODER FEATURES BRIDGE */}
      {activeTab === 'coder-bridge' && (
        <div className="ds-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              Features Committed by the Coder Team
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              These code releases and performance upgrades have been committed to Hindsight memory by the Coders. Use them to craft high-converting GEO landing pages and counter-attack Jira.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {coderFeatures.map((feat) => (
              <div
                key={feat.id}
                style={{
                  background: 'var(--bg-pitch)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--mint-primary)', fontFamily: 'var(--font-mono)' }}>
                      {feat.pr_number || 'PR MERGED'}
                    </span>
                    <span style={{ fontSize: '10px', background: 'rgba(94, 106, 210, 0.15)', color: 'var(--accent-linear)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      IN MEMORY
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, margin: '0 0 0.4rem 0', color: 'var(--text-main)' }}>
                    {feat.title}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.45', marginBottom: '0.75rem' }}>
                    {feat.details}
                  </p>
                  {feat.geo_impact_hypothesis && (
                    <div style={{ background: 'var(--bg-surface)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-main)', borderLeft: '3px solid var(--mint-primary)', marginBottom: '0.85rem' }}>
                      <strong>GEO Strategy:</strong> {feat.geo_impact_hypothesis}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="quick-action-btn"
                  onClick={() => onNavigateToChatWithPrompt(`Draft a GEO-optimized marketing comparison section leveraging the newly shipped feature "${feat.title}" against Jira.`)}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '0.5rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  Draft Marketing Page for this Feature →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
