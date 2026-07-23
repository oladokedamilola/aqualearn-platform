import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import PageTitle from '../components/UI/PageTitle';
import AnimatedSection from '../components/UI/AnimatedSection';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post('/users/password-reset/', { email });
      setSubmitted(true);
      toast.success('Password reset link sent to your email!');
    } catch (error) {
      toast.error('Failed to send reset link. Please try again.');
    }
    setLoading(false);
  };

  return (
    <>
      <PageTitle title="Forgot Password" description="Reset your AquaLearn account password." />
      
      <div className="min-h-[calc(100vh-120px)] bg-sea-foam flex items-center justify-center p-4">
        <AnimatedSection animation="fade-up" className="w-full max-w-md">
          <div className="bg-white rounded-brand-lg shadow-card p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-deep-ocean">🔐 Reset Password</h1>
              <p className="text-dark-navy text-sm mt-1">
                Enter your email and we'll send you a reset link
              </p>
            </div>

            {submitted ? (
              <div className="text-center">
                <div className="text-6xl mb-4">📧</div>
                <h2 className="text-xl font-bold text-deep-ocean mb-2">
                  Check Your Email
                </h2>
                <p className="text-dark-navy/70 mb-6">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-sm text-dark-navy/60 mb-6">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-clear-teal font-medium hover:underline"
                  >
                    try again
                  </button>
                </p>
                <Link
                  to="/login"
                  className="inline-block bg-deep-ocean text-white py-2 px-6 rounded-brand font-medium hover:bg-deep-ocean/90 transition"
                >
                  Back to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-deep-ocean font-medium text-sm mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-brand focus:outline-none focus:border-deep-ocean focus:ring-2 focus:ring-deep-ocean/20 transition"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-deep-ocean text-white py-3 px-4 rounded-brand font-medium hover:bg-deep-ocean/90 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}

            {!submitted && (
              <p className="text-center text-sm text-dark-navy mt-6">
                Remember your password?{' '}
                <Link to="/login" className="text-clear-teal font-medium hover:underline">
                  Back to Login
                </Link>
              </p>
            )}
          </div>
        </AnimatedSection>
      </div>
    </>
  );
};

export default ForgotPassword;