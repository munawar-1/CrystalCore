import React, { useState, useRef } from 'react';

export default function AnalyticsView({
  timelineData,
  onAskAboutPin,
  onNavigateToChatWithPrompt
}) {
  const [selectedPinIndex, setSelectedPinIndex] = useState(7); // Default to Week 6 Feb 14 collapse point
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeSeries, setActiveSeries] = useState({ perp: true, gpt: true, google: true });
  const [hoveredSeries, setHoveredSeries] = useState(null);
  const svgRef = useRef(null);

  const events = timelineData?.timeline || [];
  const selectedEvent = events[selectedPinIndex] || null;

  // SVG Chart Dimensions
  const width = 1000;
  const height = 300;
  const padding = { top: 35, right: 35, bottom: 45, left: 55 };
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

    ptsPerp.push({ x, y: yPerp, evt, val: perpVal, idx });
    ptsGpt.push({ x, y: yGpt, evt, val: gptVal, idx });
    ptsGoogle.push({ x, y: yGoogle, evt, val: googleRank, idx });
  });

  // Smooth Catmull-Rom / Cubic Bezier curve generator
  const makeSmoothPath = (pts) => {
    if (!pts || pts.length === 0) return "";
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return path;
  };

  const smoothPerpPath = makeSmoothPath(ptsPerp);
  const smoothGptPath = makeSmoothPath(ptsGpt);
  const smoothGooglePath = makeSmoothPath(ptsGoogle);

  const areaStr = ptsPerp.length > 0
    ? `${smoothPerpPath} L ${ptsPerp[ptsPerp.length - 1].x} ${padding.top + plotHeight} L ${ptsPerp[0].x} ${padding.top + plotHeight} Z`
    : '';

  // Interactive mouse handlers for smooth scrubbing crosshair
  const handleMouseMove = (e) => {
    if (!svgRef.current || ptsPerp.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * width;

    // Find nearest point
    let closestIdx = 0;
    let minDist = Infinity;
    ptsPerp.forEach((p, i) => {
      const dist = Math.abs(p.x - svgX);
      if (dist < minDist) {
        minDist = dist;
        closestIdx = i;
      }
    });

    setHoveredIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const activeHoverPoint = hoveredIndex !== null ? ptsPerp[hoveredIndex] : null;

  const toggleSeries = (key) => {
    setActiveSeries(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSeeReasonClick = (prompt) => {
    if (onNavigateToChatWithPrompt) {
      onNavigateToChatWithPrompt(prompt);
    } else if (onAskAboutPin && selectedEvent) {
      onAskAboutPin(selectedEvent);
    }
  };

  // Anomaly zone bounds: Jan 26 (idx 4) to Feb 24 (idx 9)
  const anomalyXStart = ptsPerp[4]?.x ?? padding.left;
  const anomalyXEnd = ptsPerp[ptsPerp.length - 1]?.x ?? (width - padding.right);

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
          <div className="time-range-pill">
            <span className="live-pulse-dot"></span>
            <span>8-Week Audit Window</span>
          </div>
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

        {/* Multi-Metric Dynamic Interactive SVG Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">8-Week Multi-Metric Timeline Curve</h3>
              <span className="chart-subtitle">
                Interactive causal timeline • Move cursor across curve to scrub metrics, click pins to inspect
              </span>
            </div>
            
            {/* Interactive Legend with Toggle & Hover Controls */}
            <div className="chart-legend interactive">
              <button
                className={`legend-btn ${activeSeries.perp ? 'active' : 'dimmed'} ${hoveredSeries === 'perp' ? 'highlighted' : ''}`}
                onClick={() => toggleSeries('perp')}
                onMouseEnter={() => setHoveredSeries('perp')}
                onMouseLeave={() => setHoveredSeries(null)}
                title="Click to toggle Perplexity Citation %"
              >
                <span className="legend-dot perp" style={{ background: '#3ee6aa' }}></span>
                <span>Perplexity Citation %</span>
              </button>

              <button
                className={`legend-btn ${activeSeries.gpt ? 'active' : 'dimmed'} ${hoveredSeries === 'gpt' ? 'highlighted' : ''}`}
                onClick={() => toggleSeries('gpt')}
                onMouseEnter={() => setHoveredSeries('gpt')}
                onMouseLeave={() => setHoveredSeries(null)}
                title="Click to toggle ChatGPT Search %"
              >
                <span className="legend-dot gpt" style={{ background: '#60a5fa' }}></span>
                <span>ChatGPT Search %</span>
              </button>

              <button
                className={`legend-btn ${activeSeries.google ? 'active' : 'dimmed'} ${hoveredSeries === 'google' ? 'highlighted' : ''}`}
                onClick={() => toggleSeries('google')}
                onMouseEnter={() => setHoveredSeries('google')}
                onMouseLeave={() => setHoveredSeries(null)}
                title="Click to toggle Google Rank"
              >
                <span className="legend-dot google" style={{ background: '#f59e0b' }}></span>
                <span>Google Rank</span>
              </button>
            </div>
          </div>

          <div 
            className="svg-chart-container dynamic-chart"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <svg 
              ref={svgRef}
              id="analyticsSvgChart" 
              viewBox={`0 0 ${width} ${height}`} 
              preserveAspectRatio="none"
            >
              <defs>
                {/* Area Gradient for Perplexity Curve */}
                <linearGradient id="perpAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3ee6aa" stopOpacity="0.32" />
                  <stop offset="60%" stopColor="#3ee6aa" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#3ee6aa" stopOpacity="0.0" />
                </linearGradient>

                {/* Anomaly Highlight Zone Gradient */}
                <linearGradient id="anomalyZoneGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.04" />
                  <stop offset="50%" stopColor="#f43f5e" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.06" />
                </linearGradient>

                {/* Neon Glow Filters */}
                <filter id="glowMint" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#3ee6aa" floodOpacity="0.7"/>
                </filter>
                <filter id="glowBlue" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#60a5fa" floodOpacity="0.6"/>
                </filter>
                <filter id="glowAmber" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#f59e0b" floodOpacity="0.6"/>
                </filter>
              </defs>

              {/* Anomaly Detection Zone Band */}
              {anomalyXStart && anomalyXEnd && (
                <g className="anomaly-zone-group">
                  <rect
                    x={anomalyXStart}
                    y={padding.top}
                    width={anomalyXEnd - anomalyXStart}
                    height={plotHeight}
                    fill="url(#anomalyZoneGradient)"
                    rx="6"
                  />
                  <line
                    x1={anomalyXStart}
                    y1={padding.top}
                    x2={anomalyXStart}
                    y2={padding.top + plotHeight}
                    stroke="#f43f5e"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    strokeOpacity="0.6"
                  />
                  <text
                    x={anomalyXStart + 10}
                    y={padding.top + 16}
                    fill="#f43f5e"
                    fontSize="10"
                    fontWeight="700"
                    letterSpacing="0.04em"
                  >
                    ⚠️ Causal Anomaly Window (-70% Drop)
                  </text>
                </g>
              )}

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
                      x={padding.left - 12}
                      y={y + 4}
                      fill="#71717a"
                      fontSize="10"
                      fontFamily="var(--font-mono)"
                      textAnchor="end"
                    >
                      {yVal}%
                    </text>
                  </g>
                );
              })}

              {/* Glowing Gradient Area under Perplexity curve */}
              {areaStr && activeSeries.perp && (
                <path d={areaStr} fill="url(#perpAreaGradient)" />
              )}

              {/* Google Rank Curve (Smooth Bezier) */}
              {ptsGoogle.length > 0 && activeSeries.google && (
                <path
                  d={smoothGooglePath}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth={hoveredSeries === 'google' ? 3.5 : 2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter={hoveredSeries === 'google' ? 'url(#glowAmber)' : 'none'}
                  opacity={hoveredSeries && hoveredSeries !== 'google' ? 0.25 : 0.85}
                  style={{ transition: 'all 0.2s' }}
                />
              )}

              {/* ChatGPT Search Curve (Smooth Bezier) */}
              {ptsGpt.length > 0 && activeSeries.gpt && (
                <path
                  d={smoothGptPath}
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth={hoveredSeries === 'gpt' ? 3.5 : 2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter={hoveredSeries === 'gpt' ? 'url(#glowBlue)' : 'none'}
                  opacity={hoveredSeries && hoveredSeries !== 'gpt' ? 0.25 : 0.9}
                  style={{ transition: 'all 0.2s' }}
                />
              )}

              {/* Perplexity Curve (Smooth Bezier with Mint Neon Glow) */}
              {ptsPerp.length > 0 && activeSeries.perp && (
                <path
                  d={smoothPerpPath}
                  fill="none"
                  stroke="#3ee6aa"
                  strokeWidth={hoveredSeries === 'perp' ? 4 : 3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glowMint)"
                  opacity={hoveredSeries && hoveredSeries !== 'perp' ? 0.25 : 1}
                  style={{ transition: 'all 0.2s' }}
                />
              )}

              {/* Animated Pulse Rings on Key Milestone Events */}
              {ptsPerp.map((p, idx) => {
                // Key inflection points: Jan 26 (idx 4 video embed) and Feb 14 (idx 7 collapse)
                const isMilestone = idx === 4 || idx === 7;
                if (!isMilestone || !activeSeries.perp) return null;

                return (
                  <g key={`pulse-${idx}`}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="12"
                      fill="none"
                      stroke={idx === 7 ? "#f43f5e" : "#3ee6aa"}
                      className="chart-pulse-ring"
                    />
                  </g>
                );
              })}

              {/* Vertical Scrubber Crosshair Line on Hover */}
              {activeHoverPoint && (
                <g className="scrubber-crosshair">
                  <line
                    x1={activeHoverPoint.x}
                    y1={padding.top}
                    x2={activeHoverPoint.x}
                    y2={padding.top + plotHeight}
                    stroke="rgba(62, 230, 170, 0.65)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                </g>
              )}

              {/* X Date Labels & Interactive Pins */}
              {ptsPerp.map((p, idx) => {
                const isSelected = idx === selectedPinIndex;
                const isHovered = idx === hoveredIndex;
                const dateStr = p.evt.date ? p.evt.date.substring(5) : '';

                return (
                  <g key={idx} className="chart-point-group">
                    {/* Date label */}
                    <text
                      x={p.x}
                      y={height - 12}
                      fill={isSelected || isHovered ? '#3ee6aa' : '#a1a1aa'}
                      fontSize="10"
                      fontWeight={isSelected || isHovered ? '700' : '400'}
                      fontFamily="var(--font-mono)"
                      textAnchor="middle"
                    >
                      {dateStr}
                    </text>

                    {/* Circular Interactive Pin */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isSelected ? 8 : isHovered ? 6.5 : 4.5}
                      fill={isSelected ? '#ffffff' : isHovered ? '#3ee6aa' : '#10b981'}
                      stroke={isSelected ? '#3ee6aa' : '#0e0f13'}
                      strokeWidth={isSelected ? '3' : '2'}
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        filter: isSelected
                          ? 'drop-shadow(0 0 10px rgba(62, 230, 170, 0.9))'
                          : isHovered
                          ? 'drop-shadow(0 0 8px rgba(62, 230, 170, 0.6))'
                          : 'none'
                      }}
                      onClick={() => setSelectedPinIndex(idx)}
                    />

                    {/* Secondary Series Points */}
                    {activeSeries.gpt && ptsGpt[idx] && (
                      <circle
                        cx={ptsGpt[idx].x}
                        cy={ptsGpt[idx].y}
                        r={isHovered ? 5 : 3}
                        fill="#60a5fa"
                        stroke="#0e0f13"
                        strokeWidth="1.5"
                      />
                    )}

                    {activeSeries.google && ptsGoogle[idx] && (
                      <circle
                        cx={ptsGoogle[idx].x}
                        cy={ptsGoogle[idx].y}
                        r={isHovered ? 5 : 3}
                        fill="#f59e0b"
                        stroke="#0e0f13"
                        strokeWidth="1.5"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Floating Dynamic Tooltip tracking the Hovered Point */}
            {activeHoverPoint && (
              <div 
                className="dynamic-chart-tooltip"
                style={{
                  left: `${(activeHoverPoint.x / width) * 100}%`,
                  top: `${Math.max(10, (activeHoverPoint.y / height) * 100 - 45)}%`
                }}
              >
                <div className="tooltip-header">
                  <span className="tooltip-date">{activeHoverPoint.evt.date}</span>
                  <span className="tooltip-week">{activeHoverPoint.evt.week || 'WEEK'}</span>
                </div>
                <div className="tooltip-title">{activeHoverPoint.evt.title}</div>
                <div className="tooltip-metrics">
                  <div className="metric-row">
                    <span className="dot perp"></span>
                    <span className="label">Perplexity:</span>
                    <strong className="val">{activeHoverPoint.evt.citation_metrics?.perplexity_citation_rate}%</strong>
                  </div>
                  <div className="metric-row">
                    <span className="dot gpt"></span>
                    <span className="label">ChatGPT Search:</span>
                    <strong className="val">{activeHoverPoint.evt.citation_metrics?.chatgpt_search_visibility}%</strong>
                  </div>
                  <div className="metric-row">
                    <span className="dot google"></span>
                    <span className="label">Google Rank:</span>
                    <strong className="val">#{activeHoverPoint.evt.citation_metrics?.google_rank}</strong>
                  </div>
                </div>
                <div className="tooltip-hint">Click point to view event details</div>
              </div>
            )}
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
                  onClick={() => handleSeeReasonClick(
                    `Explain why the event on ${selectedEvent.date} ('${selectedEvent.title}') impacted our AI search citations and how it compared against Jira.`
                  )}
                >
                  <span>⚡ See Reason for This Event in Chat</span>
                  <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Causal Anomaly Detection Hub (No static reasoning text - directs to AI Agent) */}
        <div className="anomaly-action-card">
          <div className="anomaly-card-left">
            <div className="anomaly-badge">
              <span className="anomaly-pulse-dot"></span>
              <span>HINDSIGHT CAUSAL ANOMALY DETECTED</span>
            </div>
            <h3 className="anomaly-title">Mid-February AI Citation Collapse (-70%)</h3>
            <p className="anomaly-desc">
              Between Jan 26 and Feb 14, Linear's Perplexity citations dropped from 88% down to 18%, while Atlassian Jira surged to 74%. Memory bank <code>linear-seo-intelligence</code> has retained the exact code commits, competitor moves, and algorithmic re-indexing logs explaining why this happened.
            </p>
          </div>
          <div className="anomaly-card-right">
            <button
              className="btn-see-reason"
              id="btnSeeReasonInChat"
              onClick={() => handleSeeReasonClick(
                "Diagnose the mid-February citation collapse: Why did our Perplexity citation rate drop from 88% to 18.4%, and what exact content difference caused Atlassian Jira to capture our search traffic?"
              )}
            >
              <span className="btn-sparkle">✦</span>
              <span>See the Reason in AI Agent</span>
              <svg className="arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
            <span className="btn-subtext">Navigates to Copilot with pre-configured causal query</span>
          </div>
        </div>

      </div>
    </section>
  );
}
