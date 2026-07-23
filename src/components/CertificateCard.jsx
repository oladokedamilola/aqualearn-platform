import React from 'react';

const CertificateCard = ({ certificate }) => {
  return (
    <div className="bg-white rounded-brand-lg shadow-card p-4 border-l-4 border-clear-teal">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📜</span>
          <div>
            <h4 className="font-semibold text-deep-ocean">
              {certificate.course_title}
            </h4>
            <p className="text-xs text-dark-navy/60">
              Completed {new Date(certificate.completed_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button
          className="text-clear-teal hover:text-clear-teal/80 font-medium text-sm"
          onClick={() => {
            // Will be implemented in Phase 5
            console.log('Download certificate:', certificate);
          }}
        >
          Download →
        </button>
      </div>
    </div>
  );
};

export default CertificateCard;