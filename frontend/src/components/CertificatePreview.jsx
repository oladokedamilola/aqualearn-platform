import React, { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CertificatePreview = ({ certificate, onDownload, onShare }) => {
  const { user } = useAuth();
  const certificateRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // ✅ Download as PDF using html2canvas
  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    
    setIsCapturing(true);
    try {
      // Capture the certificate as an image
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // High quality
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      
      // ✅ Generate filename: course_name_user_name
      const courseName = certificate.course_title || 'Certificate';
      const userName = user?.get_full_name?.() || user?.first_name || 'User';
      const fileName = `${courseName.replace(/\s+/g, '_')}_${userName.replace(/\s+/g, '_')}.pdf`;
      
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to server download
      if (onDownload) {
        onDownload();
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const handlePrint = () => {
    const printContent = certificateRef.current;
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>Certificate - ${certificate.certificate_id}</title>
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh;
              background: #f0f7f4;
            }
            .certificate-container {
              max-width: 1000px;
              width: 100%;
            }
            @media print {
              body { background: white; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="certificate-container">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = function() { window.print(); }
          <\/script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const courseName = certificate.course_title || 'Course';
  const userName = user?.get_full_name?.() || user?.first_name || 'User';

  return (
    <div>
      {/* Certificate Design */}
      <div
        ref={certificateRef}
        className="bg-white rounded-brand-lg shadow-card p-8 max-w-4xl mx-auto"
      >
        <div className="border-4 border-deep-ocean rounded-brand-lg p-6">
          {/* Inner Border */}
          <div className="border-2 border-deep-ocean rounded-brand-lg p-8">
            {/* Header */}
            <div className="text-center border-b-2 border-deep-ocean pb-6 mb-6">
              <div className="text-4xl mb-2">🐟</div>
              <h1 className="text-3xl font-bold text-deep-ocean">AquaLearn</h1>
              <p className="text-clear-teal font-medium">Certificate of Completion</p>
            </div>

            {/* Body */}
            <div className="text-center py-8">
              <p className="text-lg text-dark-navy/70 mb-2">This certifies that</p>
              <h2 className="text-4xl font-bold text-deep-ocean mb-4">
                {userName}
              </h2>
              <p className="text-lg text-dark-navy/70 mb-2">has successfully completed</p>
              <h3 className="text-2xl font-semibold text-deep-ocean mb-6">
                {courseName}
              </h3>

              {/* Details Grid */}
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto text-sm">
                <div>
                  <p className="text-dark-navy/40">Date Issued</p>
                  <p className="font-medium text-deep-ocean">
                    {certificate.issued_at ? new Date(certificate.issued_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-dark-navy/40">Certificate ID</p>
                  <p className="font-medium text-deep-ocean">{certificate.certificate_id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-dark-navy/40">Verification Code</p>
                  <p className="font-medium text-deep-ocean text-xs break-all">
                    {certificate.verification_code || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-deep-ocean pt-6 mt-6">
              <div className="flex justify-between items-center">
                <div className="text-center">
                  <div className="h-12 w-32 border-b-2 border-deep-ocean mx-auto"></div>
                  <p className="text-sm text-dark-navy/60 mt-2">Course Instructor</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">📜</div>
                  <p className="text-sm text-dark-navy/60">AquaLearn</p>
                </div>
                <div className="text-center">
                  <div className="h-12 w-32 border-b-2 border-deep-ocean mx-auto"></div>
                  <p className="text-sm text-dark-navy/60 mt-2">Authorized Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mt-6 justify-center">
        <button
          onClick={handleDownloadPDF}
          disabled={isCapturing}
          className="bg-deep-ocean text-white px-6 py-2 rounded-brand font-medium hover:bg-deep-ocean/90 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isCapturing ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Generating...
            </>
          ) : (
            '📥 Download Certificate'
          )}
        </button>
        <button
          onClick={handlePrint}
          className="bg-clear-teal text-white px-6 py-2 rounded-brand font-medium hover:bg-clear-teal/90 transition-all duration-300 hover:scale-105"
        >
          🖨️ Print
        </button>
        {onShare && (
          <button
            onClick={onShare}
            className="bg-coral-orange text-white px-6 py-2 rounded-brand font-medium hover:bg-coral-orange/90 transition-all duration-300 hover:scale-105"
          >
            📤 Share
          </button>
        )}
      </div>
    </div>
  );
};

export default CertificatePreview;