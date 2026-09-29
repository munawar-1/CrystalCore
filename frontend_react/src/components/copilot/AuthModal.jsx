import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({ isOpen, onClose, onRoleChanged }) {
  const { user, roles, switchRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState(user.role);

  useEffect(() => {
    if (user?.role) {
      setSelectedRole(user.role);
    }
  }, [isOpen, user?.role]);

  if (!isOpen) return null;

  const handleSelectRole = (roleKey) => {
    setSelectedRole(roleKey);
    const updated = switchRole(roleKey);
    if (onRoleChanged) onRoleChanged(updated);
    onClose();
  };

  return (
    <div
      className="modal-overlay auth-modal-overlay"
      id="authModal"
      style={{ display: 'flex' }}
      onClick={(e) => {
        if (e.target.classList.contains('modal-overlay')) onClose();
      }}
    >
      <div className="modal-card auth-modal-card" style={{ maxWidth: '640px', width: '92%' }}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              🛡️
            </span>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                Role-Based Authentication
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Select an identity to tailor the workspace and permissions
              </p>
            </div>
          </div>
          <button className="btn-close-modal" id="btnCloseAuthModal" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="auth-roles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>

          {/* CODER ROLE CARD */}
          <div
            className={`auth-role-card ${selectedRole === 'coder' ? 'active-role' : ''}`}
            onClick={() => handleSelectRole('coder')}
            style={{
              border: selectedRole === 'coder' ? '2px solid var(--mint-primary)' : '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              background: selectedRole === 'coder' ? 'var(--mint-subtle)' : 'var(--bg-surface)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              position: 'relative'
            }}
          >
            {selectedRole === 'coder' && (
              <span
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'var(--mint-primary)',
                  color: '#060709',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  letterSpacing: '0.05em'
                }}
              >
                ACTIVE ROLE
              </span>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(62, 230, 170, 0.15)',
                  border: '1px solid rgba(62, 230, 170, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  color: 'var(--mint-primary)'
                }}
              >
                &lt;/&gt;
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Coder
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--mint-primary)', fontWeight: 600 }}>
                  Engineering & Infrastructure
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '0.85rem' }}>
              <strong>Primary Mission:</strong> Updates Hindsight memory with what features, PR merges, code releases, and performance benchmarks are added.
            </p>

            <div className="role-permissions" style={{ borderTop: '1px dashed var(--border-subtle)', paddingTop: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', fontWeight: 700 }}>
                Granted Capabilities
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.75rem', color: 'var(--text-main)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--mint-primary)' }}>✓</span> Ingest PRs & features directly into memory
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--mint-primary)' }}>✓</span> Live Hindsight memory stream & logs
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--mint-primary)' }}>✓</span> Code release changelog & benchmarks
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: 'var(--mint-primary)' }}>✓</span> Dev Copilot tailored for engineers
                </li>
              </ul>
            </div>

            <button
              type="button"
              className="btn-launch-pill"
              style={{
                width: '100%',
                marginTop: '1rem',
                padding: '0.5rem',
                fontSize: '0.8rem',
                justifyContent: 'center',
                background: selectedRole === 'coder' ? 'var(--mint-primary)' : 'transparent',
                color: selectedRole === 'coder' ? '#060709' : 'var(--text-main)',
                border: '1px solid var(--mint-primary)'
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectRole('coder');
              }}
            >
              {selectedRole === 'coder' ? 'Operating as Coder' : 'Switch to Coder'}
            </button>
          </div>

          {/* MARKETING TEAM ROLE CARD */}
          <div
            className={`auth-role-card ${selectedRole === 'marketing' ? 'active-role' : ''}`}
            onClick={() => handleSelectRole('marketing')}
            style={{
              border: selectedRole === 'marketing' ? '2px solid var(--accent-linear)' : '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              background: selectedRole === 'marketing' ? 'rgba(94, 106, 210, 0.08)' : 'var(--bg-surface)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              position: 'relative'
            }}
          >
            {selectedRole === 'marketing' && (
              <span
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'var(--accent-linear)',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  letterSpacing: '0.05em'
                }}
              >
                ACTIVE ROLE
              </span>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(94, 106, 210, 0.15)',
                  border: '1px solid rgba(94, 106, 210, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  color: 'var(--accent-linear)'
                }}
              >
                📢
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Marketing Team
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-linear)', fontWeight: 600 }}>
                  Growth & Market Strategy
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '0.85rem' }}>
              <strong>Primary Mission:</strong> Monitors GEO citation shifts, tracks Jira competitor moves, and formulates campaigns powered by coder memories.
            </p>

            <div className="role-permissions" style={{ borderTop: '1px dashed var(--border-subtle)', paddingTop: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', fontWeight: 700 }}>
                Granted Capabilities
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.75rem', color: 'var(--text-main)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--accent-linear)' }}>✓</span> 8-Week Multi-metric citation graph
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--accent-linear)' }}>✓</span> Competitor moves radar (Jira vs Linear)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--accent-linear)' }}>✓</span> Live AI Citation Probe (Perplexity/GPT)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: 'var(--accent-linear)' }}>✓</span> Strategic Reflections & Battlecards
                </li>
              </ul>
            </div>

            <button
              type="button"
              className="btn-launch-pill"
              style={{
                width: '100%',
                marginTop: '1rem',
                padding: '0.5rem',
                fontSize: '0.8rem',
                justifyContent: 'center',
                background: selectedRole === 'marketing' ? 'var(--accent-linear)' : 'transparent',
                color: '#ffffff',
                border: '1px solid var(--accent-linear)'
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectRole('marketing');
              }}
            >
              {selectedRole === 'marketing' ? 'Operating as Marketing' : 'Switch to Marketing Team'}
            </button>
          </div>

        </div>

        <div className="modal-footer" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
          <button
            type="button"
            className="btn-modal-cancel"
            onClick={onClose}
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
