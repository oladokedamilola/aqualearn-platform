import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PageTitle from '../components/UI/PageTitle';
import AnimatedSection from '../components/UI/AnimatedSection';
import { toast } from 'react-toastify';

const VerifyEmailPending = () => {
  const location = useLocation();
  const { resendVerification } = useAuth();
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState(location.state?.email || '');
  const [userId, setUserId] = useState(location.state?.userId || '');

  useEffect(() => {
    if (!email && !userId) {
      // Try to get from localStorage
      const savedEmail = localStorage.getItem('pending_verification_email');
      const savedUserId = localStorage.getItem('pending_verification_user_id');
      if (savedEmail) setEmail(savedEmail);
      if (savedUserId) setUserId(savedUserId);
    } else {
      // Save to localStorage for persistence
      localStorage.setItem('pending_verification_email', email);
      localStorage.setItem('pending_verification_user_id', userId);
    }
  }, [email, userId]);

  const handleResend = async () => {
    setResending(true);
    try {
      const result = await resendVerification(email);
      if (result.success) {
        toast.success('📧 Verification email resent successfully!');
      } else {
        toast.error(result.error || 'Failed to resend verification email');
      }
    } catch (error) {
      toast.error('Failed to resend verification email');
    }
    setResending(false);
  };

  return (
    <>
      <PageTitle 
        title="Verify Your Email" 
        description="Check your email to verify your AquaLearn account." 
      />
      
      <div className="min-h-screen bg-sea-foam flex items-center justify-center p-4">
        <AnimatedSection animation="fade-up" className="w-full max-w-md">
          <div className="bg-white rounded-brand-lg shadow-card p-6 md:p-8 text-center">
            {/* Icon */}
            <div className="text-6xl md:text-7xl mb-4 animate-bounce-slow">📧</div>
            
            <h2 className="text-2xl font-bold text-deep-ocean mb-2">
              Verify Your Email
            </h2>
            
            <p className="text-dark-navy/70 mb-2">
              We've sent a verification link to:
            </p>
            <p className="font-medium text-deep-ocean mb-4">
              {email}
            </p>
            
            <div className="bg-sea-foam rounded-brand p-4 mb-6 text-sm text-dark-navy/60">
              <p>📌 Please check your email and click the verification link to activate your account.</p>
              <p className="mt-2">Check your spam folder if you don't see the email.</p>
            </div>
            
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-clear-teal font-medium hover:underline text-sm transition-colors"
            >
              {resending ? 'Sending...' : "🔄 Didn't receive the email? Resend"}
            </button>
            
            <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/login"
                className="inline-block bg-deep-ocean text-white px-6 py-2.5 rounded-brand font-medium hover:bg-deep-ocean/90 transition-all duration-300 hover:scale-105"
              >
                Back to Login
              </Link>
            </div>
            
            <p className="text-xs text-dark-navy/40 mt-4">
              The verification link expires in 24 hours.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </>
  );
};

export default VerifyEmailPending;