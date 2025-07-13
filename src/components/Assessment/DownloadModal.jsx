import React from "react";
import "./Assessment.css";

export default function DownloadModal({ open, onClose, onDownload, includeMCQ, setIncludeMCQ, includeShort, setIncludeShort }) {
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content modern-modal">
        <h2 style={{ marginBottom: 16, textAlign: 'center' }}>Download Assessment</h2>
        <div className="modal-options" style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start', marginBottom: 24 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={includeMCQ} onChange={e => setIncludeMCQ(e.target.checked)} />
            <span>Include MCQs</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={includeShort} onChange={e => setIncludeShort(e.target.checked)} />
            <span>Include Short Questions</span>
          </label>
        </div>
        <div className="modal-actions" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button className="generate-btn" style={{ width: '100%' }} onClick={onDownload}>Download PDF</button>
          <button className="generate-btn secondary" style={{ width: '100%' }} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

