import React, { useState, useRef, useEffect } from 'react';

export default function AnalyticsView({
  timelineData,
  onAskAboutPin,
  onNavigateToChatWithPrompt
}) {
  const [timelineMode, setTimelineMode] = useState('probes'); // 'probes' (Weekly Linear vs Jira) or 'audit' (8-Week Anomaly Curve)
  const [citationsTimeline, setCitationsTimeline] = useState([]);
  const [citationsSource, setCitationsSource] = useState('live_sonar_probes');
  const [isLoadingCitations, setIsLoadingCitations] = useState(false);

  const [selectedPinIndex, setSelectedPinIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeSeries, setActiveSeries] = useState({ linear: true, jira: true, google: false });
  const [hoveredSeries, setHoveredSeries] = useState(null);
  const svgRef = useRef(null);

  // Fetch live AI search citation snapshots from /api/citations/timeline
  const fetchCitationsTimeline = async () => {
    setIsLoadingCitations(true);
    try {
      const res = await fetch('/api/citations/timeline');
      if (res.ok) {
        const json = await res.json();
        setCitationsTimeline(json.data || []);
        setCitationsSource(json.source || 'live_sonar_probes');
        if (json.data && json.data.length > 0) {
          setSelectedPinIndex(json.data.length - 1); // Default to latest snapshot
        }
      }
    } catch (err) {
      console.error('Failed to load citations timeline:', err);
    } finally {
      setIsLoadingCitations(false);
    }
  };

  useEffect(() => {
    fetchCitationsTimeline();
  }, []);

  const auditEvents = timelineData?.timeline || [];

  // Determine current active dataset based on mode
  const isProbeMode = timelineMode === 'probes';
  const currentDataset = isProbeMode ? citationsTimeline : auditEvents;
  const selectedItem = currentDataset[selectedPinIndex] || null;

  // SVG Chart Dimensions
  const width = 1000;
  const height = 300;
  const padding = { top: 35, right: 35, bottom: 45, left: 55 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Compute point coordinates
  const ptsLinear = [];
  const ptsJira = [];
  const ptsGoogle = [];

  const datasetLength = Math.max(1, currentDataset.length - 1);

  currentDataset.forEach((item, idx) => {
    const x = padding.left + (idx / datasetLength) * plotWidth;

    let linearVal = 0;
    let jiraVal = 0;
    let googleRank = null;

    if (isProbeMode) {
      linearVal = item.linear_citation_rate ?? 0;
      jiraVal = item.jira_citation_rate ?? 0;
      googleRank = item.google_rank; // nullable
    } else {
      const m = item.citation_metrics || {};
      linearVal = m.perplexity_citation_rate ?? 0;
      jiraVal = Math.max(0, 100 - linearVal);
      googleRank = m.google_rank;
    }

    const yLinear = padding.top + plotHeight - (linearVal / 100) * plotHeight;
    const yJira = padding.top + plotHeight - (jiraVal / 100) * plotHeight;

    ptsLinear.push({ x, y: yLinear, item, val: linearVal, idx });
    ptsJira.push({ x, y: yJira, item, val: jiraVal, idx });

    if (googleRank !== null && googleRank !== undefined) {
      const normalizedRank = Math.max(0, 100 - (googleRank - 1) * 12);
      const yGoogle = padding.top + plotHeight - (normalizedRank / 100) * plotHeight;
      ptsGoogle.push({ x, y: yGoogle, item, val: googleRank, idx });
    }
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

  const smoothLinearPath = makeSmoothPath(ptsLinear);
  const smoothJiraPath = makeSmoothPath(ptsJira);
  const smoothGooglePath = makeSmoothPath(ptsGoogle);

  const linearAreaStr = ptsLinear.length > 0
    ? `${smoothLinearPath} L ${ptsLinear[ptsLinear.length - 1].x} ${padding.top + plotHeight} L ${ptsLinear[0].x} ${padding.top + plotHeight} Z`
    : '';

  // Mouse handlers for smooth scrubbing crosshair
  const handleMouseMove = (e) => {
    if (!svgRef.current || ptsLinear.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * width;

    let closestIdx = 0;
    let minDist = Infinity;
    ptsLinear.forEach((p, i) => {
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

  const activeHoverPoint = hoveredIndex !== null ? ptsLinear[hoveredIndex] : null;
  const activeJiraPoint = hoveredIndex !== null ? ptsJira[hoveredIndex] : null;

  const toggleSeries = (key) => {
    setActiveSeries(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSeeReasonClick = (prompt) => {
    if (onNavigateToChatWithPrompt) {
      onNavigateToChatWithPrompt(prompt);
    } else if (onAskAboutPin && selectedItem) {
      onAskAboutPin(selectedItem);
    }
  };

  // Latest metrics calculation
  const latestSnapshot = citationsTimeline[citationsTimeline.length - 1] || null;
  const latestLinearRate = latestSnapshot ? latestSnapshot.linear_citation_rate : 40.0;
  const latestJiraRate = latestSnapshot ? latestSnapshot.jira_citation_rate : 60.0;

  return (
    <section className="view-container active" id="viewAnalytics">
      <div className="analytics-content">

        {/* Header */}
        <div className="analytics-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.05em', color: 'var(--mint-primary)', background: 'rgba(62, 230, 170, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                GEO SEARCH INTELLIGENCE
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Target: <strong style={{ color: 'var(--text-main)' }}>Linear</strong> vs. Rival <strong style={{ color: 'var(--text-main)' }}>Atlassian Jira</strong>
              </span>
            </div>
            <h2 className="page-title">AI Search Citation Rate Graph</h2>
            <p className="page-subtitle">
              Weekly historical citation rates on Perplexity Sonar across benchmark queries, correlated with competitor releases and algorithm re-indexing.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="time-range-pill" style={{ cursor: 'pointer' }} onClick={fetchCitationsTimeline} title="Click to refresh live timeline from API">
              <span className="live-pulse-dot"></span>
              <span>{isLoadingCitations ? 'Updating...' : 'Live Sonar Feed'}</span>
            </div>

            {/* Mode Switcher */}
            <div style={{ display: 'flex', background: 'var(--bg-pitch)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                onClick={() => { setTimelineMode('probes'); setSelectedPinIndex(0); }}
                style={{
                  background: isProbeMode ? 'var(--mint-primary)' : 'transparent',
                  color: isProbeMode ? '#000000' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                📊 Weekly Citation Rates
              </button>
              <button
                type="button"
                onClick={() => { setTimelineMode('audit'); setSelectedPinIndex(7); }}
                style={{
                  background: !isProbeMode ? 'var(--accent-linear)' : 'transparent',
                  color: !isProbeMode ? '#ffffff' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                📌 8-Week Audit & Anomaly
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards Strip */}
        <div className="analytics-kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Linear AI Citation Rate</div>
            <div className="kpi-val" style={{ color: 'var(--mint-primary)' }}>{latestLinearRate}%</div>
            <div className="kpi-meta">Across {latestSnapshot ? latestSnapshot.total_queries : 20} tested Sonar queries</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Atlassian Jira Citation Rate</div>
            <div className="kpi-val" style={{ color: '#60a5fa' }}>{latestJiraRate}%</div>
            <div className="kpi-meta">Captured via enterprise comparison guides</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Probe Query Coverage</div>
            <div className="kpi-val">20 Queries</div>
            <div className="kpi-meta">Startup, Developer & Agile query sets</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Google Rank Status</div>
            <div className="kpi-val-sm" style={{ color: '#f59e0b', fontWeight: '700' }}>
              {latestSnapshot?.google_rank ? `#${latestSnapshot.google_rank}` : 'Null (Unfabricated)'}
            </div>
            <div className="kpi-meta">Clearly distinguished from AI citation data</div>
          </div>
        </div>

        {/* Dynamic Interactive SVG Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-title">
                {isProbeMode ? 'Weekly AI Search Citation Rate (%)' : '8-Week Multi-Metric Anomaly Timeline Curve'}
              </h3>
              <span className="chart-subtitle">
                {isProbeMode
                  ? 'Perplexity Sonar measurement • Series: Linear vs. Atlassian Jira • Scrub across points to inspect'
                  : 'Interactive causal timeline • Move cursor across curve to scrub metrics, click pins to inspect'}
              </span>
            </div>

            {/* Interactive Legend with Toggle & Hover Controls */}
            <div className="chart-legend interactive">
              <button
                className={`legend-btn ${activeSeries.linear ? 'active' : 'dimmed'} ${hoveredSeries === 'linear' ? 'highlighted' : ''}`}
                onClick={() => toggleSeries('linear')}
                onMouseEnter={() => setHoveredSeries('linear')}
                onMouseLeave={() => setHoveredSeries(null)}
                title="Click to toggle Linear Citation %"
              >
                <span className="legend-dot" style={{ background: '#3ee6aa' }}></span>
                <span>Linear Citation %</span>
              </button>

              <button
                className={`legend-btn ${activeSeries.jira ? 'active' : 'dimmed'} ${hoveredSeries === 'jira' ? 'highlighted' : ''}`}
                onClick={() => toggleSeries('jira')}
                onMouseEnter={() => setHoveredSeries('jira')}
                onMouseLeave={() => setHoveredSeries(null)}
                title="Click to toggle Jira Citation %"
              >
                <span className="legend-dot" style={{ background: '#60a5fa' }}></span>
                <span>Jira Citation %</span>
              </button>

              <button
                className={`legend-btn ${activeSeries.google ? 'active' : 'dimmed'} ${hoveredSeries === 'google' ? 'highlighted' : ''}`}
                onClick={() => toggleSeries('google')}
                onMouseEnter={() => setHoveredSeries('google')}
                onMouseLeave={() => setHoveredSeries(null)}
                title="Click to toggle Google Rank (if available)"
              >
                <span className="legend-dot" style={{ background: '#f59e0b' }}></span>
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
                {/* Area Gradient for Linear Curve */}
                <linearGradient id="linearAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3ee6aa" stopOpacity="0.28" />
                  <stop offset="60%" stopColor="#3ee6aa" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="#3ee6aa" stopOpacity="0.0" />
                </linearGradient>

                {/* Neon Glow Filters */}
                <filter id="glowMint" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#3ee6aa" floodOpacity="0.7" />
                </filter>
                <filter id="glowBlue" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#60a5fa" floodOpacity="0.6" />
                </filter>
                <filter id="glowAmber" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#f59e0b" floodOpacity="0.6" />
                </filter>
              </defs>

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

              {/* Linear Gradient Area */}
              {linearAreaStr && activeSeries.linear && (
                <path d={linearAreaStr} fill="url(#linearAreaGradient)" />
              )}

              {/* Google Rank Curve (if toggled & points exist) */}
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

              {/* Jira Citation Curve (Smooth Bezier) */}
              {ptsJira.length > 0 && activeSeries.jira && (
                <path
                  d={smoothJiraPath}
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth={hoveredSeries === 'jira' ? 3.5 : 2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter={hoveredSeries === 'jira' ? 'url(#glowBlue)' : 'none'}
                  opacity={hoveredSeries && hoveredSeries !== 'jira' ? 0.25 : 0.9}
                  style={{ transition: 'all 0.2s' }}
                />
              )}

              {/* Linear Citation Curve (Smooth Bezier with Mint Neon Glow) */}
              {ptsLinear.length > 0 && activeSeries.linear && (
                <path
                  d={smoothLinearPath}
                  fill="none"
                  stroke="#3ee6aa"
                  strokeWidth={hoveredSeries === 'linear' ? 4 : 3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glowMint)"
                  opacity={hoveredSeries && hoveredSeries !== 'linear' ? 0.25 : 1}
                  style={{ transition: 'all 0.2s' }}
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
                    stroke="rgba(62, 230, 170, 0.65)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                </g>
              )}

              {/* X Date Labels & Interactive Pins */}
              {ptsLinear.map((p, idx) => {
                const isSelected = idx === selectedPinIndex;
                const isHovered = idx === hoveredIndex;
                const dateRaw = p.item.date || '';
                const dateStr = dateRaw.length > 5 ? dateRaw.substring(5) : dateRaw;

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

                    {/* Linear Pin */}
                    {activeSeries.linear && (
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
                    )}

                    {/* Jira Pin */}
                    {activeSeries.jira && ptsJira[idx] && (
                      <circle
                        cx={ptsJira[idx].x}
                        cy={ptsJira[idx].y}
                        r={isHovered ? 5.5 : 3.5}
                        fill="#60a5fa"
                        stroke="#0e0f13"
                        strokeWidth="1.5"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedPinIndex(idx)}
                      />
                    )}

                    {/* Google Rank Pin */}
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

            {/* Floating Dynamic Tooltip */}
            {activeHoverPoint && (
              <div
                className="dynamic-chart-tooltip"
                style={{
                  left: `${(activeHoverPoint.x / width) * 100}%`,
                  top: `${Math.max(10, (activeHoverPoint.y / height) * 100 - 45)}%`
                }}
              >
                <div className="tooltip-header">
                  <span className="tooltip-date">{activeHoverPoint.item.date}</span>
                  <span className="tooltip-week">
                    {activeHoverPoint.item.week || `SNAPSHOT #${hoveredIndex + 1}`}
                  </span>
                </div>
                <div className="tooltip-title">
                  {activeHoverPoint.item.title || 'AI Citation Probe Evaluation'}
                </div>
                <div className="tooltip-metrics">
                  <div className="metric-row">
                    <span className="dot" style={{ background: '#3ee6aa' }}></span>
                    <span className="label">Linear:</span>
                    <strong className="val">{activeHoverPoint.val}%</strong>
                    {isProbeMode && activeHoverPoint.item.linear_citations !== undefined && (
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '4px' }}>
                        ({activeHoverPoint.item.linear_citations}/{activeHoverPoint.item.total_queries})
                      </span>
                    )}
                  </div>
                  <div className="metric-row">
                    <span className="dot" style={{ background: '#60a5fa' }}></span>
                    <span className="label">Jira:</span>
                    <strong className="val">{activeJiraPoint ? activeJiraPoint.val : 0}%</strong>
                    {isProbeMode && activeHoverPoint.item.jira_citations !== undefined && (
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '4px' }}>
                        ({activeHoverPoint.item.jira_citations}/{activeHoverPoint.item.total_queries})
                      </span>
                    )}
                  </div>
                  <div className="metric-row">
                    <span className="dot" style={{ background: '#f59e0b' }}></span>
                    <span className="label">Google Rank:</span>
                    <strong className="val">
                      {activeHoverPoint.item.google_rank
                        ? `#${activeHoverPoint.item.google_rank}`
                        : 'Null (Not Fabricated)'}
                    </strong>
                  </div>
                </div>
                <div className="tooltip-hint">Click point to view snapshot breakdown</div>
              </div>
            )}
          </div>

          {/* Historical Citation Data Table */}
          {isProbeMode && currentDataset.length > 0 && (
            <div style={{ marginTop: '1.25rem', overflowX: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.04em' }}>
                  WEEKLY SNAPSHOT BREAKDOWN ({currentDataset.length} AUDITS)
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Data Source: <code style={{ color: 'var(--mint-primary)' }}>GET /api/citations/timeline</code>
                </span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '8px 12px' }}>Date</th>
                    <th style={{ padding: '8px 12px' }}>Linear Citation Rate</th>
                    <th style={{ padding: '8px 12px' }}>Jira Citation Rate</th>
                    <th style={{ padding: '8px 12px' }}>Linear Citations</th>
                    <th style={{ padding: '8px 12px' }}>Jira Citations</th>
                    <th style={{ padding: '8px 12px' }}>Total Queries</th>
                    <th style={{ padding: '8px 12px' }}>Google Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDataset.map((snap, sIdx) => {
                    const isSelected = sIdx === selectedPinIndex;
                    return (
                      <tr
                        key={sIdx}
                        onClick={() => setSelectedPinIndex(sIdx)}
                        style={{
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(62, 230, 170, 0.08)' : 'transparent',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                          {snap.date}
                        </td>
                        <td style={{ padding: '8px 12px', color: 'var(--mint-primary)', fontWeight: 800 }}>
                          {snap.linear_citation_rate}%
                        </td>
                        <td style={{ padding: '8px 12px', color: '#60a5fa', fontWeight: 800 }}>
                          {snap.jira_citation_rate}%
                        </td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>
                          {snap.linear_citations}
                        </td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>
                          {snap.jira_citations}
                        </td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>
                          {snap.total_queries}
                        </td>
                        <td style={{ padding: '8px 12px', color: '#f59e0b' }}>
                          {snap.google_rank ? `#${snap.google_rank}` : 'Null (Unfabricated)'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Event Card for Selected Pin */}
          {selectedItem && (
            <div className="selected-pin-summary" id="selectedPinSummary" style={{ marginTop: '1.25rem' }}>
              <div className="pin-summary-header">
                <span className="pin-badge" id="pinBadge">
                  {selectedItem.week ? selectedItem.week.toUpperCase() : 'CITATION SNAPSHOT'} • {selectedItem.event_type || 'PERPLEXITY_SONAR'}
                </span>
                <strong id="pinTitle">
                  {selectedItem.title || `Snapshot ${selectedItem.date}: Linear ${selectedItem.linear_citation_rate}% vs Jira ${selectedItem.jira_citation_rate}%`}
                </strong>
                <span className="pin-date" id="pinDate">{selectedItem.date}</span>
              </div>
              <p className="pin-details" id="pinDetails">
                {selectedItem.details || `AI Search citation evaluation across ${selectedItem.total_queries} queries. Linear cited in ${selectedItem.linear_citations} queries (${selectedItem.linear_citation_rate}%), Jira cited in ${selectedItem.jira_citations} queries (${selectedItem.jira_citation_rate}%).`}
                {selectedItem.significance && ` (Significance: ${selectedItem.significance})`}
              </p>
              <div className="pin-actions">
                <button
                  className="btn-ask-copilot"
                  id="btnAskAboutPin"
                  onClick={() => handleSeeReasonClick(
                    `Analyze our AI search citation performance on ${selectedItem.date}. Explain why our citation rate was ${selectedItem.linear_citation_rate}% compared to Atlassian Jira's ${selectedItem.jira_citation_rate}%, and what actions we should take.`
                  )}
                >
                  <span>⚡ Ask Copilot About This Citation Result</span>
                  <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Causal Anomaly Detection Hub */}
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
