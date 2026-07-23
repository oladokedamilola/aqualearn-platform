import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { certificateService } from '../services/certificate';
import PageTitle from '../components/UI/PageTitle';
import AnimatedSection from '../components/UI/AnimatedSection';

const VerifyCertificate = () => {
  const { certificateId, verificationCode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    verifyCertificate();
  }, []);

  const verifyCertificate = async () => {
    setLoading(true);
    try {
      const data = await certificateService.verifyCertificate(
        certificateId,
        verificationCode
      );
      setResult(data);
    } catch (error) {
      setError(error.response?.data?.message || 'Certificate verification failed');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <>
        <PageTitle title="Verifying Certificate" />
        <div className="min-h-screen bg-sea-foam flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-deep-ocean border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-dark-navy/70">Verifying certificate...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageTitle title="Certificate Verification Failed" />
        <div className="min-h-screen bg-sea-foam flex items-center justify-center p-4">
          <AnimatedSection animation="fade-up">
            <div className="bg-white rounded-brand-lg shadow-card p-8 max-w-md w-full text-center">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-deep-ocean mb-2">Certificate Not Found</h2>
              <p className="text-dark-navy/70 mb-6">{error}</p>
              <button
                onClick={() => navigate('/')}
                className="bg-deep-ocean text-white px-6 py-2 rounded-brand font-medium hover:bg-deep-ocean/90 transition"
              >
                Go Home
              </button>
            </div>
          </AnimatedSection>
        </div>
      </>
    );
  }

  if (result?.valid) {
    return (
      <>
        <PageTitle title="Verified Certificate" />
        <div className="min-h-screen bg-sea-foam flex items-center justify-center p-4">
          <AnimatedSection animation="fade-up">
            <div className="bg-white rounded-brand-lg shadow-card p-8 max-w-lg w-full">
              <div className="text-center">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-clear-teal mb-2">
                  Valid Certificate
                </h2>
                <p className="text-dark-navy/70 mb-6">
                  This certificate has been verified and is authentic.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-dark-navy/60">Certificate ID</span>
                  <span className="font-medium text-deep-ocean">
                    {result.certificate.certificate_id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-navy/60">Issued To</span>
                  <span className="font-medium text-deep-ocean">
                    {result.certificate.user_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-navy/60">Course</span>
                  <span className="font-medium text-deep-ocean">
                    {result.certificate.course_title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-navy/60">Issued On</span>
                  <span className="font-medium text-deep-ocean">
                    {new Date(result.certificate.issued_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-navy/60">Issued By</span>
                  <span className="font-medium text-deep-ocean">
                    {result.certificate.issued_by}
                  </span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate('/')}
                  className="bg-deep-ocean text-white px-6 py-2 rounded-brand font-medium hover:bg-deep-ocean/90 transition"
                >
                  Go Home
                </button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </>
    );
  }

  return null;
};

export default VerifyCertificate;