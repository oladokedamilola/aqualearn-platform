import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PageTitle from '../components/UI/PageTitle';
import AnimatedSection from '../components/UI/AnimatedSection';
import { toast } from 'react-toastify';

const VerifyEmail = () => {
  const { userId, token } = useParams();
  const navigate = useNavigate();
  const { verifyEmail, authService } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    handleVerification();
  }, []);

  const handleVerification = async () => {
    setLoading(true);
    try {
      const result = await verifyEmail(userId, token);
      console.log('🔵 Verification result:', result);
      
      if (result.success && result.data.verified) {
        setSuccess(true);
        toast.success('✅ Email verified successfully!');
        
        // ✅ The verifyEmail function in AuthContext already stores tokens
        // Check if user was set in context
        const redirectPath = authService.getRedirectAfterAuth() || '/dashboard';
        authService.clearRedirectAfterAuth();
        
        // Small delay before redirecting
        setRedirecting(true);
        setTimeout(() => {
          // Check if onboarding is required
          if (result.data.onboarding_required) {
            navigate('/onboarding');
          } else {
            navigate(redirectPath);
          }
        }, 1500);
        
      } else if (result.data?.already_verified) {
        toast.info('Email already verified. Please login.');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(result.error || 'Invalid verification link');
        toast.error('Invalid verification link');
      }
    } catch (error) {
      console.error('🔴 Verification error:', error);
      setError('An error occurred during verification');
      toast.error('Verification failed. Please try again.');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <>
        <PageTitle title="Verifying Email" />
        <div className="min-h-[calc(100vh-120px)] bg-sea-foam flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-deep-ocean border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-dark-navy/70">Verifying your email...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageTitle title="Verification Failed" />
        <div className="min-h-[calc(100vh-120px)] bg-sea-foam flex items-center justify-center p-4">
          <AnimatedSection animation="fade-up" className="w-full max-w-md">
            <div className="bg-white rounded-brand-lg shadow-card p-8 text-center">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-deep-ocean mb-2">Verification Failed</h2>
              <p className="text-dark-navy/70 mb-6">{error}</p>
              <p className="text-sm text-dark-navy/60 mb-6">
                The verification link may have expired or been used already.
              </p>
              <Link
                to="/login"
                className="inline-block bg-deep-ocean text-white px-6 py-2 rounded-brand font-medium hover:bg-deep-ocean/90 transition"
              >
                Go to Login
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </>
    );
  }

  if (success || redirecting) {
    return (
      <>
        <PageTitle title="Email Verified" />
        <div className="min-h-[calc(100vh-120px)] bg-sea-foam flex items-center justify-center p-4">
          <AnimatedSection animation="fade-up" className="w-full max-w-md">
            <div className="bg-white rounded-brand-lg shadow-card p-8 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-clear-teal mb-2">Email Verified!</h2>
              <p className="text-dark-navy/70 mb-6">
                Your email has been verified successfully.
              </p>
              <div className="animate-pulse text-dark-navy/40 text-sm">
                {redirecting ? 'Redirecting...' : 'Logging you in...'}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </>
    );
  }

  return null;
};

export default VerifyEmail;