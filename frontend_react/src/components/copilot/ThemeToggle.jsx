import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ className = '', style = {} }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      className={`theme-toggle-btn nav-pill-btn ${className}`}
      id="btnToggleTheme"
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        ...style
      }}
      aria-label="Toggle theme mode"
    >
      {isDark ? (
        <>
          {/* Sun icon for dark mode (click to switch to light) */}
          <svg
            className="pill-icon sun-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: '16px', height: '16px', filter: 'drop-shadow(0 0 4px rgba(245, 158, 11, 0.4))' }}
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          <span className="theme-label" style={{ fontSize: '12px', fontWeight: 600 }}>Light Theme</span>
        </>
      ) : (
        <>
          {/* Moon icon for light mode (click to switch to dark) */}
          <svg
            className="pill-icon moon-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6366f1"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: '16px', height: '16px' }}
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
          <span className="theme-label" style={{ fontSize: '12px', fontWeight: 600 }}>Dark Theme</span>
        </>
      )}
    </button>
  );
}
