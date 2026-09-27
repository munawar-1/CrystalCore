import React, { useState, useEffect } from 'react';

export default function FeatureModal({
  isOpen,
  onClose,
  onSubmit
}) {
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('CODE_RELEASE');
  const [page, setPage] = useState('linear.app/features/ai');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePresetLinearAsks = () => {
    setTitle("Shipped 'Linear Asks' AI Issue Triaging");
    setEventType("CODE_RELEASE");
    setPage("linear.app/features/ai-asks");
    setDetails("Engineering merged PR #942: Sub-100ms automated issue triaging and summarization natively built-in at zero extra fee.");
  };

  const handlePresetJiraSOC2 = () => {
    setTitle("Jira Enterprise Defense: 4,500-word Guide");
    setEventType("COMPETITOR_MOVE");
    setPage("atlassian.com/software/jira/vs-linear");
    setDetails("Atlassian published a direct comparison guide with structured markdown tables for SOC-2, HIPAA, and compliance.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !details.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        event_type: eventType,
        page,
        details,
        date: "2026-03-01"
      });
      setTitle('');
      setDetails('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      id="featureModal"
      style={{ display: 'flex' }}
      onClick={(e) => {
        if (e.target.classList.contains('modal-overlay')) onClose();
      }}
    >
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-icon">✨</span>
            <h3>Log Feature or Competitor Update</h3>
          </div>
          <button className="btn-close-modal" id="btnCloseFeatureModal" onClick={onClose}>
            &times;
          </button>
        </div>

        <p className="modal-desc">
          Store a new product feature, engineering release, or competitor move directly into Hindsight long-term memory bank <code>linear-seo-intelligence</code>.
        </p>

        <form id="featureForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="formTitle">Update Title</label>
            <input
              type="text"
              id="formTitle"
              className="form-input"
              placeholder="e.g. Shipped 'Linear Asks' AI Issue Triaging"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="formType">Category</label>
              <select
                id="formType"
                className="form-select"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
                <option value="CODE_RELEASE">Code Release / Feature</option>
                <option value="PAGE_UPDATE">Page Redesign</option>
                <option value="COMPETITOR_MOVE">Competitor Move (Jira)</option>
                <option value="ALGORITHM_UPDATE">Search Engine Update</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="formPage">Target URL</label>
              <input
                type="text"
                id="formPage"
                className="form-input"
                value={page}
                onChange={(e) => setPage(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="formDetails">Details & Impact</label>
            <textarea
              id="formDetails"
              className="form-textarea"
              rows="3"
              placeholder="Describe the feature capabilities, speed benchmarks, or competitor changes..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
            />
          </div>

          {/* Quick 1-Click Simulation Buttons */}
          <div className="quick-presets">
            <span className="preset-label">Quick Presets:</span>
            <button
              type="button"
              className="btn-preset-chip"
              id="presetLinearAsks"
              onClick={handlePresetLinearAsks}
            >
              Simulate: Linear Asks AI
            </button>
            <button
              type="button"
              className="btn-preset-chip"
              id="presetJiraSOC2"
              onClick={handlePresetJiraSOC2}
            >
              Simulate: Jira Enterprise Attack
            </button>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-modal-cancel"
              id="btnCancelFeatureModal"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-modal-submit"
              id="btnSubmitFeature"
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? 'Retaining...' : 'Retain into Memory'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
