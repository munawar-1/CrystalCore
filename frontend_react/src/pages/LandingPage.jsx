import React from 'react';
import TypewriterText from '../components/TypewriterText';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import '../styles/landing.css';

export default function LandingPage({ onNavigate }) {
  const { switchRole } = useAuth();
  const { isLight } = useTheme();

  const handleLaunch = (e) => {
    e.preventDefault();
    if (onNavigate) onNavigate('/app');
    else window.location.href = '/app';
  };

  const handleLaunchAsCoder = (e) => {
    e.preventDefault();
    switchRole('coder');
    if (onNavigate) onNavigate('/app?view=coder_memory');
    else window.location.href = '/app?view=coder_memory';
  };

  const handleLaunchAsMarketing = (e) => {
    e.preventDefault();
    switchRole('marketing');
    if (onNavigate) onNavigate('/app?view=marketing_strategy');
    else window.location.href = '/app?view=marketing_strategy';
  };

  const handleExplore = (e) => {
    e.preventDefault();
    if (onNavigate) onNavigate('/app?view=analytics');
    else window.location.href = '/app?view=analytics';
  };

  return (
    <div className={`landing-wrapper ${isLight ? 'theme-light' : 'theme-dark'}`}>

      {/* TOP NAVIGATION BAR */}
      <header className="landing-header">
        <nav className="nav-left">
          <a href="/" className="nav-link active" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('/'); }}>
            <span className="dot-indicator">▸</span> Home
          </a>
          <a href="/app" className="nav-link" onClick={handleLaunch}>Platform</a>
          <a href="#framework" className="nav-link">Architecture</a>
          <a href="/app?view=analytics" className="nav-link" onClick={handleExplore}>Labs</a>
        </nav>

        <div className="nav-center-mark" title="CrystalCore AI System">
          <div className="minimal-logo-box">
            <div className="minimal-logo-inner"></div>
          </div>
        </div>

        <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={handleLaunch} className="btn-launch-pill" id="btnTopLaunch">
            <span>LAUNCH AGENT</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="arrow-up-right">
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </button>
        </div>
      </header>

      {/* MAIN HERO CARD CONTAINER */}
      <main className="hero-container">
        <section className="hero-card">

          {/* Left Content Area */}
          <div className="hero-content">

            {/* Big Grotesque Headline with Typewriter Animation for CrystalCore. */}
            <div className="hero-title-group">
              <h1 className="hero-title">
                <span className="title-line">AUTONOMOUS GEO</span>
                <span className="title-line">INTELLIGENCE AGENT</span>
                <TypewriterText text="CrystalCore." />
              </h1>
            </div>

            {/* 1 to 2 line description about agent below agent name following exact font style */}
            <div className="hero-subtext-block">
              <p className="agent-description">
                Synthetically trained. Memory-powered.<br />
                Autonomous citation intelligence agent with <strong>Role-Based Workspaces</strong>: Coders update long-term memory with new features and PRs; Marketing tracks citations and counters Jira attacks.
              </p>

              {/* Dual Role Launchers + Standard CTA */}
              <div className="hero-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                <button onClick={handleLaunchAsCoder} className="btn-cta-primary" id="btnLaunchCoder" style={{ background: 'var(--mint-primary)', color: '#060709', fontWeight: 800 }}>
                  <span>&lt;/&gt; LAUNCH AS CODER</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </button>
                <button onClick={handleLaunchAsMarketing} className="btn-cta-secondary" id="btnLaunchMarketing" style={{ borderColor: '#6366f1', color: 'var(--text-white)' }}>
                  <span>📢 LAUNCH AS MARKETING</span>
                </button>
                <button onClick={handleExplore} className="btn-cta-secondary" id="btnHeroExploreEngine">
                  <span>EXPLORE MEMORY BANK</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Halftone Visual Area */}
          <div className="hero-visual">
            <div className="halftone-art-wrapper">
              <img src="/assets/halftone-dither.png" alt="CrystalCore Neural Halftone Art" className="halftone-image" />
              <div className="halftone-gradient-fade"></div>
              <div className="halftone-ambient-glow"></div>
            </div>
          </div>

        </section>
      </main>

      {/* TRUST / PARTNERS STRIP */}
      <section className="trust-section">
        <p className="trust-label">Integrated with frontier search engines & enterprise memory architectures</p>
        <div className="trust-grid">
          <div className="trust-pill"><span>Perplexity AI</span></div>
          <div className="trust-pill"><span>ChatGPT Search</span></div>
          <div className="trust-pill"><span>Vectorize Hindsight</span></div>
          <div className="trust-pill"><span>Linear</span></div>
          <div className="trust-pill"><span>Atlassian Jira</span></div>
          <div className="trust-pill"><span>Google Gemini</span></div>
          <div className="trust-pill"><span>Groq LLaMA 3.3</span></div>
        </div>
      </section>

      {/* THE TECHNOLOGY FRAMEWORK / ARCHITECTURE */}
      <section className="framework-section" id="framework">
        <div className="framework-header">
          <div className="architecture-eyebrow">
            <span className="dot-indicator">▸</span> ARCHITECTURE & MEMORY ENGINE
          </div>
          <h2 className="framework-title">The memory architecture<br />behind citation-winning AI</h2>
          <p className="framework-subtitle">
            CrystalCore's modular Hindsight engine allows agents to reason through 8+ weeks of causal history, diagnose drops, and synthesize unbeatable GEO landing pages.
          </p>
        </div>

        <div className="framework-grid">
          <div className="framework-card">
            <div className="card-metric">&lt;/&gt; Coder</div>
            <h3 className="card-title">Updates Memory with Features</h3>
            <p className="card-desc">Ingests PR merges, latency benchmarks, and schema enhancements directly into persistent Hindsight memory.</p>
          </div>
          <div className="framework-card">
            <div className="card-metric">📢 Marketing</div>
            <h3 className="card-title">GEO Citations & Strategy</h3>
            <p className="card-desc">Monitors citation drops, tracks Jira price hikes, and leverages coder-retained memories to defeat competitors in AI search.</p>
          </div>
          <div className="framework-card highlight">
            <div className="card-metric">🧠 Hindsight Engine</div>
            <h3 className="card-title">Causal GEO Memory</h3>
            <p className="card-desc">Remembers 8+ weeks of algorithmic re-indexing, competitor releases, and causal citation shifts using Retain, Recall, and Reflect.</p>
          </div>
        </div>
      </section>

      {/* BOTTOM FOOTER */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand-side">
            <span className="footer-brand-title">CrystalCore.</span>
            <span className="footer-brand-sub">Autonomous AI Citation Intelligence Agent</span>
          </div>

          <div className="footer-center-signature">
            <div className="engineered-badge">
              <span className="green-status-dot"></span>
              <span className="signature-text">engineered by <span className="hisenbugs-name">Hisenbugs.</span></span>
            </div>
          </div>

          <div className="footer-action-side">
            <button onClick={handleLaunch} className="footer-nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              Launch Workspace ↗
            </button>
            <span className="footer-copy">© 2026 Hisenbugs. All rights reserved.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
