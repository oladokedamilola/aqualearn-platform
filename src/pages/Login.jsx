import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import PageTitle from '../components/UI/PageTitle';
import AnimatedSection from '../components/UI/AnimatedSection';
import EyeToggle from '../components/UI/EyeToggle';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, authService } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Show logout message from navigation state
  useEffect(() => {
    if (location.state?.logoutMessage) {
      toast.success(location.state.logoutMessage);
      // Clear the state so it doesn't show again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // If already authenticated, redirect to appropriate page
  useEffect(() => {
    if (isAuthenticated) {
      // Check if there's a redirect after auth (from course page)
      const redirectPath = authService.getRedirectAfterAuth();
      if (redirectPath) {
        authService.clearRedirectAfterAuth();
        navigate(redirectPath);
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, navigate, authService]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password, rememberMe);

    if (result.success) {
      toast.success('Welcome back!');
      
      // ✅ Check if email verification is required
      if (result.data.requires_verification || result.data.verified === false) {
        toast.info('Please verify your email. A new verification link has been sent.');
        navigate('/verify-email-pending', { 
          state: { 
            email: formData.email, 
            userId: result.data.user_id 
          } 
        });
        return;
      }
      
      // ✅ Check onboarding FIRST before dashboard
      if (result.data.onboarding_required) {
        console.log('🔵 Onboarding required, redirecting to onboarding');
        navigate('/onboarding');
        return;
      }
      
      // ✅ Check for redirect after auth (from course page)
      const redirectPath = authService.getRedirectAfterAuth();
      if (redirectPath) {
        authService.clearRedirectAfterAuth();
        navigate(redirectPath);
        return;
      }
      
      // ✅ Default: go to dashboard
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed. Please try again.');
      toast.error(result.error || 'Login failed');
    }
    setLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <PageTitle title="Sign In" description="Sign in to your AquaLearn account and continue learning." />
      
      <div className="min-h-[calc(100vh-120px)] bg-sea-foam flex items-center justify-center p-4">
        <AnimatedSection animation="fade-up" className="w-full max-w-md">
          <div className="bg-white rounded-brand-lg shadow-card p-6 md:p-8">
            {/* Logo */}
            <div className="text-center mb-6 md:mb-8">
              <div className="text-4xl md:text-5xl mb-2">🐟</div>
              <h1 className="text-2xl md:text-3xl font-bold text-deep-ocean">
                Welcome Back
              </h1>
              <p className="text-dark-navy/60 text-sm mt-1">
                Sign in to continue learning
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="mb-4">
                <label className="block text-deep-ocean font-medium text-sm mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-brand focus:outline-none focus:border-deep-ocean focus:ring-2 focus:ring-deep-ocean/20 transition text-dark-navy"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {/* Password with Eye Toggle */}
              <div className="mb-2">
                <label className="block text-deep-ocean font-medium text-sm mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-brand focus:outline-none focus:border-deep-ocean focus:ring-2 focus:ring-deep-ocean/20 transition text-dark-navy"
                    placeholder="Enter your password"
                    required
                  />
                  <EyeToggle 
                    showPassword={showPassword} 
                    toggle={togglePasswordVisibility} 
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-coral-orange/10 border-l-4 border-coral-orange p-3 rounded mb-4 mt-4">
                  <p className="text-coral-orange text-sm">{error}</p>
                </div>
              )}

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between mb-6 mt-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-deep-ocean border-gray-300 rounded focus:ring-deep-ocean cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-dark-navy">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-clear-teal hover:underline">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-deep-ocean text-white py-3.5 px-4 rounded-brand font-medium hover:bg-deep-ocean/90 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-dark-navy/40">Don't have an account?</span>
              </div>
            </div>

            {/* Register Link */}
            <p className="text-center">
              <Link 
                to="/register" 
                className="text-clear-teal font-medium hover:text-clear-teal/80 transition-colors hover:underline"
              >
                Create your free account
              </Link>
            </p>

            {/* Terms */}
            <p className="text-center text-xs text-dark-navy/40 mt-4">
              By signing in, you agree to our{' '}
              <Link to="/terms" className="text-clear-teal hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-clear-teal hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </AnimatedSection>
      </div>
    </>
  );
};

export default Login;