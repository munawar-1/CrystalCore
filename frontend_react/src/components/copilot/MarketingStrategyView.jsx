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
        if (showToast) showToast("Live AI Citation Probe completed!", "success");
      }
    } catch (err) {
      if (showToast) showToast("Probe failed: " + err.message, "error");
    } finally {
      setIsProbing(false);
    }
  };

  return (
    <div className="marketing-strategy-view">
      <div className="marketing-strategy-container">

        {/* Section 1: Header */}
        <header className="marketing-header">
          <div className="marketing-header-top">
            <div className="marketing-header-info">
              <div className="marketing-rival-label">Rival tracked: Atlassian Jira</div>
              <h1 className="marketing-title">GEO Citations & Competitive Strategy Studio</h1>
              <p className="marketing-desc">
                Monitor citation shifts, rival moves, and deploy winning GEO strategies.
              </p>
            </div>

            <button
              type="button"
              className="btn-primary-action"
              onClick={() => onNavigateToChatWithPrompt && onNavigateToChatWithPrompt(
                "Synthesize an executive summary of all Jira competitive moves over the last 60 days and our recommended counter-measures."
              )}
            >
              Generate Executive Briefing
            </button>
          </div>

          {/* Section 2: Navigation Underlined Tab Bar */}
          <nav className="marketing-tab-bar" role="tablist" aria-label="Strategy Studio views">
            <button
              type="button"
              role="tab"
              id="tab-citations"
              aria-selected={activeTab === 'citations'}
              aria-controls="panel-citations"
              tabIndex={0}
              className={`marketing-tab-btn ${activeTab === 'citations' ? 'active' : ''}`}
              onClick={() => setActiveTab('citations')}
            >
              8-Week Multi-Metric Citation Graph
            </button>
            <button
              type="button"
              role="tab"
              id="tab-probe"
              aria-selected={activeTab === 'probe'}
              aria-controls="panel-probe"
              tabIndex={0}
              className={`marketing-tab-btn ${activeTab === 'probe' ? 'active' : ''}`}
              onClick={() => setActiveTab('probe')}
            >
              Live AI Citation Probe (Perplexity & SearchGPT)
            </button>
            <button
              type="button"
              role="tab"
              id="tab-coder-bridge"
              aria-selected={activeTab === 'coder-bridge'}
              aria-controls="panel-coder-bridge"
              tabIndex={0}
              className={`marketing-tab-btn ${activeTab === 'coder-bridge' ? 'active' : ''}`}
              onClick={() => setActiveTab('coder-bridge')}
            >
              Features Shipped by Coders ({coderFeatures.length})
            </button>
          </nav>
        </header>

        {/* TAB 1: CITATIONS GRAPH */}
        {activeTab === 'citations' && (
          <div id="panel-citations" role="tabpanel" aria-labelledby="tab-citations">
            <AnalyticsView
              timelineData={timelineData}
              onAskAboutPin={onAskAboutPin}
              onNavigateToChatWithPrompt={onNavigateToChatWithPrompt}
            />
          </div>
        )}

        {/* TAB 2: AI CITATION PROBE */}
        {activeTab === 'probe' && (
          <div id="panel-probe" role="tabpanel" aria-labelledby="tab-probe" className="clean-card probe-container">
            <div className="card-header-block">
              <h2 className="section-heading">Live AI Citation Evaluator Probe</h2>
              <p className="section-subtitle">
                Test simulated AI search engine answers (Perplexity, SearchGPT) to see if Linear or Jira gets cited.
              </p>
            </div>

            <form onSubmit={handleRunProbe} className="probe-form">
              <div className="probe-input-row">
                <input
                  type="text"
                  className="form-input clean-input"
                  value={probeQuery}
                  onChange={(e) => setProbeQuery(e.target.value)}
                  placeholder="Enter query to probe (e.g. Which tool is faster: Linear or Jira?)"
                />
                <button
                  type="submit"
                  className="btn-primary-action"
                  disabled={isProbing}
                >
                  {isProbing ? 'Probing LLM Engines...' : 'Run Live Probe'}
                </button>
              </div>
            </form>

            {probeResult ? (
              <div className="probe-result-box">
                <div className="probe-result-meta">
                  <span className="probe-result-tag">Probe Response & Citation Sources</span>
                  <span className="probe-result-model">Model: LLaMA 3.3 70B (Simulating Perplexity)</span>
                </div>
                <div className="probe-result-content">
                  {probeResult.simulated_response || probeResult.answer || JSON.stringify(probeResult, null, 2)}
                </div>
              </div>
            ) : (
              <div className="probe-empty-state">
                Enter a query and select "Run Live Probe" to simulate an AI search engine response and inspect source citations.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CODER FEATURES BRIDGE */}
        {activeTab === 'coder-bridge' && (
          <div id="panel-coder-bridge" role="tabpanel" aria-labelledby="tab-coder-bridge" className="clean-card coder-bridge-container">
            <div className="card-header-block">
              <h2 className="section-heading">Features Committed by the Coder Team</h2>
              <p className="section-subtitle">
                These code releases and performance upgrades have been committed to Hindsight memory by the Coders. Use them to craft high-converting GEO landing pages and counter-attack Jira.
              </p>
            </div>

            <div className="coder-features-grid">
              {coderFeatures.length > 0 ? (
                coderFeatures.map((feat) => (
                  <div key={feat.id || feat.title} className="clean-feature-card">
                    <div className="feature-card-body">
                      <div className="feature-card-meta">
                        <span className="feature-pr-label">{feat.pr_number || 'PR MERGED'}</span>
                        <span className="feature-status-tag">In Memory</span>
                      </div>
                      <h3 className="feature-card-title">{feat.title}</h3>
                      <p className="feature-card-details">{feat.details}</p>
                      {feat.geo_impact_hypothesis && (
                        <div className="feature-geo-box">
                          <strong>GEO Strategy:</strong> {feat.geo_impact_hypothesis}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className="btn-secondary-outline"
                      onClick={() => onNavigateToChatWithPrompt && onNavigateToChatWithPrompt(
                        `Draft a GEO-optimized marketing comparison section leveraging the newly shipped feature "${feat.title}" against Jira.`
                      )}
                    >
                      Draft Marketing Page for this Feature
                    </button>
                  </div>
                ))
              ) : (
                <div className="probe-empty-state">
                  No features loaded yet from Hindsight memory bank.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
