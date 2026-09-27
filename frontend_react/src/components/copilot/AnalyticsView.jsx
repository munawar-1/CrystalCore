import React, { useState, useEffect } from 'react';

export default function AnalyticsView({
  timelineData,
  onAskAboutPin
}) {
  const [selectedPinIndex, setSelectedPinIndex] = useState(2); // Default to Week 3

  const events = timelineData?.timeline || [];
  const selectedEvent = events[selectedPinIndex] || null;

  // SVG Chart Dimensions
  const width = 1000;
  const height = 280;
  const padding = { top: 25, right: 30, bottom: 35, left: 50 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Compute point coordinates
  const ptsPerp = [];
  const ptsGpt = [];
  const ptsGoogle = [];

  events.forEach((evt, idx) => {
    const x = padding.left + (idx / Math.max(1, events.length - 1)) * plotWidth;
    const m = evt.citation_metrics || {};

    const perpVal = m.perplexity_citation_rate ?? 0;
    const gptVal = m.chatgpt_search_visibility ?? 0;
    const googleRank = m.google_rank ?? 1;
    const normalizedRank = Math.max(0, 100 - (googleRank - 1) * 12);

    const yPerp = padding.top + plotHeight - (perpVal / 100) * plotHeight;
    const yGpt = padding.top + plotHeight - (gptVal / 100) * plotHeight;
    const yGoogle = padding.top + plotHeight - (normalizedRank / 100) * plotHeight;

    ptsPerp.push({ x, y: yPerp, evt, val: perpVal });
    ptsGpt.push({ x, y: yGpt, evt, val: gptVal });
    ptsGoogle.push({ x, y: yGoogle, evt, val: googleRank });
  });

  const makePath = (pts) =>
    pts.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');

  const areaStr = ptsPerp.length > 0
    ? `${makePath(ptsPerp)} L ${ptsPerp[ptsPerp.length - 1].x} ${padding.top + plotHeight} L ${ptsPerp[0].x} ${padding.top + plotHeight} Z`
    : '';

  return (
    <section className="view-container active" id="viewAnalytics">
      <div className="analytics-content">
        
        {/* Header */}
        <div className="analytics-header">
          <div>
            <h2 className="page-title">Competitive Citation Analytics</h2>
            <p className="page-subtitle">
              Historical correlation of on-page modifications, competitor releases, and AI answer engine visibility.
            </p>
          </div>
          <div className="time-range-pill">8-Week Audit Window</div>
        </div>

        {/* KPI Cards Strip */}
        <div className="analytics-kpi-grid">
          <div className="kpi-card alert">
            <div className="kpi-label">Perplexity Citation Share</div>
            <div className="kpi-val">18.4%</div>
            <div className="kpi-meta"><span className="trend-negative">-70%</span> from 88% peak (Feb 14)</div>
          </div>

          <div className="kpi-card competitor">
            <div className="kpi-label">Atlassian Jira Lead</div>
            <div className="kpi-val">74.2%</div>
            <div className="kpi-meta"><span className="trend-positive">+56%</span> captured comparison queries</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Weekly AI Referrals</div>
            <div className="kpi-val">310 / wk</div>
            <div className="kpi-meta"><span className="trend-negative">-81%</span> dropped from 1,650/wk</div>
          </div>

          <div className="kpi-card highlight">
            <div className="kpi-label">Primary Root Vulnerability</div>
            <div className="kpi-val-sm">Video Replaced Markdown</div>
            <div className="kpi-meta">Jan 26 commit severed crawler parsing</div>
          </div>
        </div>

        {/* Multi-Metric Interactive SVG Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">8-Week Multi-Metric Timeline Curve</h3>
              <span className="chart-subtitle">Click on any event pin to view historical cause-and-effect</span>
            </div>
            <div className="chart-legend">
              <span className="legend-dot perp" style={{ background: '#3ee6aa' }}></span><span>Perplexity Citation %</span>
              <span className="legend-dot gpt" style={{ background: '#60a5fa' }}></span><span>ChatGPT Search %</span>
              <span className="legend-dot google" style={{ background: '#f59e0b' }}></span><span>Google Rank</span>
            </div>
          </div>

          <div className="svg-chart-container">
            <svg id="analyticsSvgChart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
              {/* Horizontal Grid lines */}
              {[0, 25, 50, 75, 100].map((yVal) => {
                const y = padding.top + plotHeight - (yVal / 100) * plotHeight;
                return (
                  <g key={yVal}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      stroke="rgba(255, 255, 255, 0.06)"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padding.left - 10}
                      y={y + 4}
                      fill="#6b6a67"
                      fontSize="10"
                      textAnchor="end"
                    >
                      {yVal}%
                    </text>
                  </g>
                );
              })}

              {/* Area under Perplexity curve */}
              {areaStr && (
                <path d={areaStr} fill="rgba(62, 230, 170, 0.12)" />
              )}

              {/* Curve Lines */}
              {ptsGoogle.length > 0 && (
                <path
                  d={makePath(ptsGoogle)}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {ptsGpt.length > 0 && (
                <path
                  d={makePath(ptsGpt)}
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {ptsPerp.length > 0 && (
                <path
                  d={makePath(ptsPerp)}
                  fill="none"
                  stroke="#3ee6aa"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* X Date Labels & Pins */}
              {ptsPerp.map((p, idx) => {
                const isSelected = idx === selectedPinIndex;
                const dateStr = p.evt.date ? p.evt.date.substring(5) : '';

                return (
                  <g key={idx}>
                    {/* Date label */}
                    <text
                      x={p.x}
                      y={height - 10}
                      fill="#9c9b98"
                      fontSize="10"
                      textAnchor="middle"
                    >
                      {dateStr}
                    </text>

                    {/* Circular Interactive Pin */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isSelected ? 7 : 4.5}
                      fill={isSelected ? '#3ee6aa' : '#10b981'}
                      stroke="#060709"
                      strokeWidth="2.5"
                      style={{ cursor: 'pointer', transition: 'all 0.2s', filter: isSelected ? 'drop-shadow(0 0 8px rgba(62, 230, 170, 0.6))' : 'none' }}
                      onClick={() => setSelectedPinIndex(idx)}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Event Card for Selected Pin */}
          {selectedEvent && (
            <div className="selected-pin-summary" id="selectedPinSummary">
              <div className="pin-summary-header">
                <span className="pin-badge" id="pinBadge">
                  {selectedEvent.week ? selectedEvent.week.toUpperCase() : 'EVENT'} • {selectedEvent.event_type}
                </span>
                <strong id="pinTitle">{selectedEvent.title}</strong>
                <span className="pin-date" id="pinDate">{selectedEvent.date}</span>
              </div>
              <p className="pin-details" id="pinDetails">
                {selectedEvent.details} (Significance: {selectedEvent.significance})
              </p>
              <div className="pin-actions">
                <button
                  className="btn-ask-copilot"
                  id="btnAskAboutPin"
                  onClick={() => onAskAboutPin(selectedEvent)}
                >
                  💬 Ask Copilot to Diagnose This in Chat
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content Strategy Audit: Linear vs Jira */}
        <div className="strategy-matrix-card">
          <h3 className="chart-title">Content Structure Audit (Why Jira Won Citations)</h3>
          <div className="matrix-grid">
            <div className="matrix-col linear">
              <div className="matrix-col-header">
                <strong>Linear.app</strong>
                <span className="badge-status error">Current Vulnerability</span>
              </div>
              <ul className="matrix-list">
                <li>✕ <strong>Format:</strong> 90s video embed (Invisible to LLM search crawlers).</li>
                <li>✕ <strong>Metrics:</strong> Marketing copy ("blazing fast") rather than raw specs.</li>
                <li>✕ <strong>Enterprise Proof:</strong> SOC-2 and HIPAA tables omitted from migration page.</li>
                <li>⚠️ <strong>AI Features:</strong> Shipped "Linear Asks" (PR #942), but page not yet updated.</li>
              </ul>
            </div>

            <div className="matrix-col jira">
              <div className="matrix-col-header">
                <strong>Atlassian Jira</strong>
                <span className="badge-status success">Current Citation Leader</span>
              </div>
              <ul className="matrix-list">
                <li>✓ <strong>Format:</strong> Structured Markdown Tables with explicit column headers.</li>
                <li>✓ <strong>Metrics:</strong> Documented compliance guarantees and enterprise governance.</li>
                <li>✓ <strong>Enterprise Defense:</strong> 4,500-word SEO guide targeting startup migration.</li>
                <li>✓ <strong>AI Features:</strong> Promotes paid 'Atlassian Intelligence' add-on prominently.</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
