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

  // SVG Chart Dimensions (16:6 aspect ratio: 1000 x 375)
  const width = 1000;
  const height = 375;
  const padding = { top: 35, right: 35, bottom: 45, left: 55 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Compute point coordinates
  const ptsPerp = [];
  const ptsGpt = [];
  const ptsGoogle = [];
  const googleColors = ['#4285f4', '#ea4335', '#fbbc05', '#34a853'];

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

  // Smooth Cubic Bezier curve generator
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

  // Show only 5 to 6 date labels instead of all points
  const shouldShowDateLabel = (idx, total) => {
    if (total <= 6) return true;
    // Exactly 5 evenly spaced milestone indices for 10 data points: [0, 2, 4, 7, 9]
    const milestoneSet = new Set([0, Math.floor(total * 0.25), 4, 7, total - 1]);
    return milestoneSet.has(idx);
  };

  const renderImpactContent = (evt) => {
    if (!evt?.significance) return null;
    const sig = evt.significance;
    if (sig.includes('78%') && sig.includes('81%')) {
      return (
        <span>
          Catastrophic <strong>78% citation drop</strong> and <strong>81% referral drop</strong> in weekly AI referral signups.
        </span>
      );
    }
    const parts = sig.split(/(\d+%(?:\s+[\w-]+)?)/g);
    return (
      <span>
        {parts.map((p, i) => /^\d+%/.test(p) ? <strong key={i}>{p}</strong> : p)}
      </span>
    );
  };

  return (
    <div className="analytics-section-wrapper" id="viewAnalytics">
      <div className="analytics-content">

        {/* Section 3: Heading Area (One heading, one short subtitle, pill removed) */}
        <div className="analytics-header">
          <div>
            <h2 className="section-heading">Competitive Citation Analytics</h2>
            <p className="section-subtitle">
              Historical correlation of on-page modifications, competitor releases, and AI answer engine visibility. Last 8 weeks.
            </p>
          </div>
        </div>

        {/* Section 4: KPI Cards (Equal width/height CSS grid, no glowing outlines, strict hierarchy) */}
        <div className="analytics-kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Perplexity Citation Share</div>
            <div className="kpi-val">18.4%</div>
            <div className="kpi-delta">
              <span className="delta-neg">-70%</span> <span className="delta-text">from 88% peak (Feb 14)</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Atlassian Jira Lead</div>
            <div className="kpi-val">74.2%</div>
            <div className="kpi-delta">
              <span className="delta-pos">+56%</span> <span className="delta-text">captured comparison queries</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Weekly AI Referrals</div>
            <div className="kpi-val">310 / wk</div>
            <div className="kpi-delta">
              <span className="delta-neg">-81%</span> <span className="delta-text">dropped from 1,650/wk</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Primary Root Vulnerability</div>
            <div className="kpi-val kpi-val-text">Diagnostic Alert</div>
            <div className="kpi-delta">
              <span className="delta-text">Requires AI Causal Diagnosis</span>
            </div>
          </div>
        </div>

        {/* Section 5: Chart Card (Single container, legend row with line swatches, faint area fill, 12px axis font) */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">8-Week Multi-Metric Timeline Curve</h3>
              <p className="chart-subtitle">
                Interactive causal timeline • Move cursor across curve to scrub metrics, click pins to inspect
              </p>
            </div>

            {/* Plain Legend Row with Line Swatches */}
            <div className="chart-legend-row" role="group" aria-label="Toggle Chart Series">
              <button
                type="button"
                className={`legend-item ${activeSeries.perp ? 'active' : 'dimmed'}`}
                onClick={() => toggleSeries('perp')}
                onMouseEnter={() => setHoveredSeries('perp')}
                onMouseLeave={() => setHoveredSeries(null)}
                aria-pressed={activeSeries.perp}
                title="Toggle Perplexity Citation %"
              >
                <span className="legend-swatch swatch-perp"></span>
                <span className="legend-text">Perplexity Citation %</span>
              </button>

              <button
                type="button"
                className={`legend-item ${activeSeries.gpt ? 'active' : 'dimmed'}`}
                onClick={() => toggleSeries('gpt')}
                onMouseEnter={() => setHoveredSeries('gpt')}
                onMouseLeave={() => setHoveredSeries(null)}
                aria-pressed={activeSeries.gpt}
                title="Toggle ChatGPT Search %"
              >
                <span className="legend-swatch swatch-gpt"></span>
                <span className="legend-text">ChatGPT Search %</span>
              </button>

              <button
                type="button"
                className={`legend-item ${activeSeries.google ? 'active' : 'dimmed'}`}
                onClick={() => toggleSeries('google')}
                onMouseEnter={() => setHoveredSeries('google')}
                onMouseLeave={() => setHoveredSeries(null)}
                aria-pressed={activeSeries.google}
                title="Toggle Gemini / Google Rank"
              >
                <span className="legend-swatch swatch-google"></span>
                <span className="legend-text">Gemini / Google Rank</span>
              </button>
            </div>
          </div>

          <div
            className="svg-chart-container"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <svg
              ref={svgRef}
              id="analyticsSvgChart"
              viewBox={`0 0 ${width} ${height}`}
              preserveAspectRatio="none"
              style={{ width: '100%', height: '100%', display: 'block' }}
            >
              <defs>
                {/* Very faint gradient under Perplexity curve */}
                <linearGradient id="perpAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                </linearGradient>

                {/* Gemini (Google Colors) Gradient */}
                <linearGradient id="googleGeminiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4285f4" />
                  <stop offset="28%" stopColor="#9b72cf" />
                  <stop offset="55%" stopColor="#ea4335" />
                  <stop offset="78%" stopColor="#fbbc05" />
                  <stop offset="100%" stopColor="#34a853" />
                </linearGradient>
              </defs>

              {/* Causal Anomaly Detection Zone Band */}
              {anomalyXStart && anomalyXEnd && (
                <g className="anomaly-zone-group">
                  <rect
                    x={anomalyXStart}
                    y={padding.top}
                    width={anomalyXEnd - anomalyXStart}
                    height={plotHeight}
                    fill="rgba(62, 230, 170, 0.05)"
                  />
                  <line
                    x1={anomalyXStart}
                    y1={padding.top}
                    x2={anomalyXStart}
                    y2={padding.top + plotHeight}
                    stroke="rgba(62, 230, 170, 0.35)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={anomalyXStart + 12}
                    y={padding.top + 20}
                    fill="#3ee6aa"
                    fontSize="12"
                    fontWeight="600"
                    fontFamily="var(--font-sans)"
                  >
                    Causal Anomaly Window (-70% Drop)
                  </text>
                </g>
              )}

              {/* Horizontal Grid lines (5 ticks: 0, 25, 50, 75, 100%) */}
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
                      strokeDasharray="3 3"
                    />
                    <text
                      x={padding.left - 12}
                      y={y + 4}
                      fill="#a1a1aa"
                      fontSize="12"
                      fontFamily="var(--font-sans)"
                      textAnchor="end"
                    >
                      {yVal}%
                    </text>
                  </g>
                );
              })}

              {/* Faint Area fill under Perplexity curve */}
              {areaStr && activeSeries.perp && (
                <path d={areaStr} fill="url(#perpAreaGradient)" />
              )}

              {/* Gemini / Google Rank Curve (Google Signature Colors) */}
              {ptsGoogle.length > 0 && activeSeries.google && (
                <path
                  d={smoothGooglePath}
                  fill="none"
                  stroke="url(#googleGeminiGradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="4 3"
                  opacity={hoveredSeries && hoveredSeries !== 'google' ? 0.25 : 0.95}
                  style={{ transition: 'opacity 0.2s' }}
                />
              )}

              {/* ChatGPT Search Curve (Crisp White #ffffff, Dashed) */}
              {ptsGpt.length > 0 && activeSeries.gpt && (
                <path
                  d={smoothGptPath}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="5 3"
                  opacity={hoveredSeries && hoveredSeries !== 'gpt' ? 0.25 : 0.95}
                  style={{ transition: 'opacity 0.2s' }}
                />
              )}

              {/* Perplexity Curve (Electric Blue #38bdf8, Solid) */}
              {ptsPerp.length > 0 && activeSeries.perp && (
                <path
                  d={smoothPerpPath}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={hoveredSeries && hoveredSeries !== 'perp' ? 0.25 : 1}
                  style={{ transition: 'opacity 0.2s' }}
                />
              )}

              {/* Vertical Scrubber Crosshair Line on Hover */}
              {activeHoverPoint && (
                <g className="scrubber-crosshair">
                  <line
                    x1={activeHoverPoint.x}
                    y1={padding.top}
                    x2={activeHoverPoint.x}
                    y2={padding.top + plotHeight}
                    stroke="rgba(255, 255, 255, 0.25)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                </g>
              )}

              {/* X Date Labels (5 to 6 labels) & Interactive Pins (All points) */}
              {ptsPerp.map((p, idx) => {
                const isSelected = idx === selectedPinIndex;
                const isHovered = idx === hoveredIndex;
                const dateStr = p.evt.date ? p.evt.date.substring(5) : '';
                const showLabel = shouldShowDateLabel(idx, ptsPerp.length);

                return (
                  <g key={idx} className="chart-point-group">
                    {/* Date label: only 5-6 points, 12px high contrast font */}
                    {showLabel && (
                      <text
                        x={p.x}
                        y={height - 14}
                        fill={isSelected || isHovered ? '#f4f4f5' : '#a1a1aa'}
                        fontSize="12"
                        fontWeight={isSelected || isHovered ? '600' : '400'}
                        fontFamily="var(--font-sans)"
                        textAnchor="middle"
                      >
                        {dateStr}
                      </text>
                    )}

                    {/* Secondary Series Points: ChatGPT (White) */}
                    {activeSeries.gpt && ptsGpt[idx] && (
                      <circle
                        cx={ptsGpt[idx].x}
                        cy={ptsGpt[idx].y}
                        r={isHovered ? 4 : 2.5}
                        fill="#ffffff"
                        stroke="#08090c"
                        strokeWidth="1"
                      />
                    )}

                    {/* Secondary Series Points: Gemini / Google (Signature Google Colors) */}
                    {activeSeries.google && ptsGoogle[idx] && (
                      <circle
                        cx={ptsGoogle[idx].x}
                        cy={ptsGoogle[idx].y}
                        r={isHovered ? 4 : 2.5}
                        fill={googleColors[idx % googleColors.length]}
                        stroke="#08090c"
                        strokeWidth="1"
                      />
                    )}

                    {/* Primary Interactive Pin: Perplexity (Blue) */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isSelected ? 6 : isHovered ? 5 : 3.5}
                      fill={isSelected ? '#ffffff' : '#38bdf8'}
                      stroke={isSelected ? '#38bdf8' : '#08090c'}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                      tabIndex={0}
                      role="button"
                      aria-label={`Select event ${p.evt.week || ''} (${p.evt.date}): ${p.evt.title}`}
                      style={{ cursor: 'pointer', outline: 'none' }}
                      onClick={() => setSelectedPinIndex(idx)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedPinIndex(idx);
                        }
                      }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Clean Tooltip Card tracking the Hovered Point */}
            {activeHoverPoint && (
              <div
                className="dynamic-chart-tooltip"
                style={{
                  left: `${(activeHoverPoint.x / width) * 100}%`,
                  top: `${Math.max(8, (activeHoverPoint.y / height) * 100 - 45)}%`
                }}
              >
                <div className="tooltip-header">
                  <span className="tooltip-date">{activeHoverPoint.evt.date}</span>
                  <span className="tooltip-week">{activeHoverPoint.evt.week || 'WEEK'}</span>
                </div>
                <div className="tooltip-title">{activeHoverPoint.evt.title}</div>
                <div className="tooltip-metrics">
                  <div className="metric-row">
                    <span className="tooltip-swatch swatch-perp"></span>
                    <span className="label">Perplexity:</span>
                    <span className="val">{activeHoverPoint.evt.citation_metrics?.perplexity_citation_rate}%</span>
                  </div>
                  <div className="metric-row">
                    <span className="tooltip-swatch swatch-gpt"></span>
                    <span className="label">ChatGPT Search:</span>
                    <span className="val">{activeHoverPoint.evt.citation_metrics?.chatgpt_search_visibility}%</span>
                  </div>
                  <div className="metric-row">
                    <span className="tooltip-swatch swatch-google"></span>
                    <span className="label">Gemini / Google:</span>
                    <span className="val">#{activeHoverPoint.evt.citation_metrics?.google_rank}</span>
                  </div>
                </div>
                <div className="tooltip-hint">Click point to view event details</div>
              </div>
            )}
          </div>

          {/* Section 6: Event Detail Card */}
          {selectedEvent && (
            <div className="event-detail-card" id="selectedPinSummary">
              <div className="event-meta-row">
                <span className="event-week-label">{selectedEvent.week || 'Week 6'}</span>
                <span className="event-date" id="pinDate">{selectedEvent.date}</span>
              </div>
              <h4 className="event-title" id="pinTitle">{selectedEvent.title}</h4>
              <p className="event-summary-text" id="pinDetails">
                {selectedEvent.details}
              </p>
              {selectedEvent.significance && (
                <div className="event-impact-line">
                  <span className="impact-label">Impact: </span>
                  {renderImpactContent(selectedEvent)}
                </div>
              )}
              <div className="event-actions">
                <button
                  type="button"
                  className="btn-secondary-outline"
                  id="btnAskAboutPin"
                  onClick={() => handleSeeReasonClick(
                    `Explain why the event on ${selectedEvent.date} ('${selectedEvent.title}') impacted our AI search citations and how it compared against Jira.`
                  )}
                >
                  See Reason for This Event in Chat
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section 7: Causal Anomaly Action Hub */}
        <div className="anomaly-action-card">
          <div className="anomaly-card-left">
            <span className="anomaly-meta-label">Causal Anomaly Diagnostic</span>
            <h3 className="anomaly-title">Mid-February AI Citation Collapse (-70%)</h3>
            <p className="anomaly-desc">
              Between Jan 26 and Feb 14, Linear's Perplexity citations dropped from 88% down to 18%, while Atlassian Jira surged to 74%. Memory bank <code>linear-seo-intelligence</code> has retained the exact code commits, competitor moves, and algorithmic re-indexing logs explaining why this happened.
            </p>
          </div>
          <div className="anomaly-card-right">
            <button
              type="button"
              className="btn-secondary-outline"
              id="btnSeeReasonInChat"
              onClick={() => handleSeeReasonClick(
                "Diagnose the mid-February citation collapse: Why did our Perplexity citation rate drop from 88% to 18.4%, and what exact content difference caused Atlassian Jira to capture our search traffic?"
              )}
            >
              See Reason in AI Agent
            </button>
            <span className="btn-subtext">Navigates to Copilot with pre-configured causal query</span>
          </div>
        </div>

      </div>
    </div>
  );
}
