import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { certificateService } from '../services/certificate';
import CertificatePreview from '../components/CertificatePreview';
import PageTitle from '../components/UI/PageTitle';
import AnimatedSection from '../components/UI/AnimatedSection';
import { toast } from 'react-toastify';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  
  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCertificates, setTotalCertificates] = useState(0);
  const pageSize = 3;

  useEffect(() => {
    fetchCertificates(currentPage);
  }, [currentPage]);

  const fetchCertificates = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      console.log('📤 Fetching certificates...');
      const data = await certificateService.getCertificates(page, pageSize);
      console.log('📥 Certificates data:', data);
      
      // Handle paginated response
      let certificatesData = [];
      let total = 0;
      
      if (data && typeof data === 'object') {
        if (data.results) {
          certificatesData = data.results;
          total = data.count || 0;
        } else if (Array.isArray(data)) {
          certificatesData = data;
          total = data.length;
        } else {
          certificatesData = [];
        }
      }
      
      // Ensure it's an array
      if (!Array.isArray(certificatesData)) {
        console.warn('⚠️ Certificates data is not an array:', certificatesData);
        certificatesData = [];
      }
      
      setCertificates(certificatesData);
      setTotalCertificates(total);
      setTotalPages(Math.ceil(total / pageSize) || 1);
      
      // ✅ If no certificates, try to check for missing ones
      if (certificatesData.length === 0 && page === 1) {
        try {
          const missingData = await certificateService.checkMissingCertificates();
          if (missingData.missing_certificates && missingData.missing_certificates.length > 0) {
            console.log('📤 Found missing certificates, generating...');
            // Refresh the list
            const refreshedData = await certificateService.getCertificates(1, pageSize);
            if (refreshedData && refreshedData.results) {
              setCertificates(refreshedData.results);
              setTotalCertificates(refreshedData.count || 0);
              setTotalPages(Math.ceil((refreshedData.count || 0) / pageSize) || 1);
              toast.success(`🎉 Generated ${refreshedData.results.length} certificate(s)!`);
            }
          }
        } catch (missingError) {
          console.log('No missing certificates found:', missingError);
        }
      }
      
      if (certificatesData.length > 0 && !selectedCertificate) {
        setSelectedCertificate(certificatesData[0]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch certificates:', error);
      setError(error.response?.data?.error || error.message || 'Failed to load certificates');
      toast.error('Failed to load certificates');
    }
    setLoading(false);
  };

  // In the Certificate list, the download button now uses the new method
  const handleDownload = async (certificateId) => {
    // This is now a fallback - the CertificatePreview handles the main download
    try {
      const response = await certificateService.downloadCertificate(certificateId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const cert = certificates.find(c => c.id === certificateId);
      const fileName = cert ? 
        `${cert.course_title.replace(/\s+/g, '_')}_${user?.first_name || 'User'}.pdf` : 
        `certificate_${certificateId}.pdf`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('❌ Download error:', error);
      toast.error('Failed to download certificate');
    }
  };

  const handleShare = async (certificateId) => {
    try {
      const data = await certificateService.getShareLink(certificateId);
      if (navigator.share) {
        await navigator.share({
          title: 'AquaLearn Certificate',
          text: `Check out my AquaLearn certificate!`,
          url: data.share_url,
        });
      } else {
        await navigator.clipboard.writeText(data.share_url);
        toast.success('Certificate link copied to clipboard!');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('❌ Share error:', error);
        toast.error('Failed to share certificate');
      }
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      setSelectedCertificate(null);
    }
  };

  // ✅ Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-brand border border-gray-300 text-dark-navy hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          ←
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-3 py-1.5 rounded-brand border border-gray-300 text-dark-navy hover:bg-gray-50 transition"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2 text-dark-navy/40">…</span>}
          </>
        )}
        
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-1.5 rounded-brand border transition ${
              page === currentPage
                ? 'bg-deep-ocean text-white border-deep-ocean'
                : 'border-gray-300 text-dark-navy hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2 text-dark-navy/40">…</span>}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-3 py-1.5 rounded-brand border border-gray-300 text-dark-navy hover:bg-gray-50 transition"
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 rounded-brand border border-gray-300 text-dark-navy hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          →
        </button>
      </div>
    );
  };

  // Handle error state
  if (error) {
    return (
      <>
        <PageTitle title="Certificates" description="View and download your earned certificates." />
        <div className="min-h-screen bg-sea-foam p-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-brand-lg shadow-card p-12 text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-deep-ocean mb-2">
                Something went wrong
              </h3>
              <p className="text-dark-navy/70 mb-4">{error}</p>
              <button
                onClick={() => fetchCertificates(1)}
                className="bg-deep-ocean text-white px-6 py-2 rounded-brand font-medium hover:bg-deep-ocean/90 transition inline-block"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <PageTitle title="Certificates" description="View and download your earned certificates." />
        <div className="min-h-screen bg-sea-foam p-4">
          <div className="max-w-4xl mx-auto">
            <div className="h-12 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
            <div className="h-[400px] bg-gray-200 rounded-brand-lg animate-pulse"></div>
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-brand-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Certificates" description="View and download your earned AquaLearn certificates." />
      
      <div className="min-h-screen bg-sea-foam p-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection animation="fade-up">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
              <h1 className="text-3xl font-bold text-deep-ocean">📜 My Certificates</h1>
              {totalCertificates > 0 && (
                <span className="text-sm text-dark-navy/60 bg-white px-3 py-1 rounded-full shadow-card">
                  {totalCertificates} certificate{totalCertificates !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-dark-navy/70 mb-6">
              View and download certificates you've earned
            </p>
          </AnimatedSection>

          {certificates.length === 0 ? (
            <div className="bg-white rounded-brand-lg shadow-card p-12 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-deep-ocean mb-2">
                No Certificates Yet
              </h3>
              <p className="text-dark-navy/70 mb-4">
                Complete courses to earn certificates and showcase your achievements.
              </p>
              <Link
                to="/courses"
                className="bg-deep-ocean text-white px-6 py-2 rounded-brand font-medium hover:bg-deep-ocean/90 transition inline-block"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <>
              {/* Selected Certificate Preview */}
              {selectedCertificate && (
                <AnimatedSection animation="fade-up" className="mb-8">
                  <CertificatePreview
                    certificate={selectedCertificate}
                    onDownload={() => handleDownload(selectedCertificate.id)}
                    onShare={() => handleShare(selectedCertificate.id)}
                  />
                </AnimatedSection>
              )}

              {/* Certificate List */}
              <AnimatedSection animation="fade-up" delay={200}>
                <h2 className="text-xl font-bold text-deep-ocean mb-4">
                  All Certificates
                  <span className="text-sm font-normal text-dark-navy/60 ml-2">
                    (Page {currentPage} of {totalPages})
                  </span>
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className={`bg-white rounded-brand-lg shadow-card p-4 hover:shadow-card-hover transition-all duration-300 cursor-pointer hover:-translate-y-1 ${
                        selectedCertificate?.id === cert.id ? 'border-2 border-clear-teal' : ''
                      }`}
                      onClick={() => setSelectedCertificate(cert)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-deep-ocean truncate">
                            {cert.course_title || 'Unknown Course'}
                          </h4>
                          <p className="text-sm text-dark-navy/60">
                            Issued: {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : 'N/A'}
                          </p>
                          <p className="text-xs text-dark-navy/40 truncate">
                            {cert.certificate_id || 'No ID'}
                          </p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(cert.id);
                            }}
                            className="text-clear-teal hover:text-clear-teal/80 transition text-sm p-2 hover:bg-clear-teal/5 rounded"
                            disabled={downloading}
                            title="Download Certificate"
                          >
                            📥
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(cert.id);
                            }}
                            className="text-coral-orange hover:text-coral-orange/80 transition text-sm p-2 hover:bg-coral-orange/5 rounded"
                            title="Share Certificate"
                          >
                            📤
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AnimatedSection>

              {/* Pagination */}
              {totalPages > 1 && (
                <AnimatedSection animation="fade-up" delay={300}>
                  {renderPagination()}
                </AnimatedSection>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Certificates;