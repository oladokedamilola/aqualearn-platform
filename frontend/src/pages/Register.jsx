import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import PageTitle from '../components/UI/PageTitle';
import AnimatedSection from '../components/UI/AnimatedSection';
import PasswordStrength from '../components/PasswordStrength';
import EyeToggle from '../components/UI/EyeToggle';

const Register = () => {
  const navigate = useNavigate();
  const { register, authService, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password2: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCriteria, setShowCriteria] = useState(false);

  // If already authenticated, redirect to dashboard or saved redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = authService?.getRedirectAfterAuth() || '/dashboard';
      authService?.clearRedirectAfterAuth();
      navigate(redirectPath);
    }
  }, [isAuthenticated, navigate, authService]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    
    if (name === 'password') {
      setShowCriteria(true);
    }
  };

  const handlePasswordFocus = () => {
    if (formData.password.length > 0) {
      setShowCriteria(true);
    }
  };

  const handlePasswordBlur = () => {
    setShowCriteria(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (formData.password !== formData.password2) {
      setErrors({ password2: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters' });
      setLoading(false);
      return;
    }

    const result = await register({
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      password: formData.password,
      password2: formData.password2,
    });

    if (result.success) {
      toast.success('🎉 Registration successful! Please complete your profile.');
      
      // ✅ Check if onboarding is required (it always is for new users)
      if (result.data?.onboarding_required) {
        navigate('/onboarding');
      } else {
        // Fallback - redirect to dashboard or saved redirect
        const redirectPath = authService?.getRedirectAfterAuth() || '/dashboard';
        authService?.clearRedirectAfterAuth();
        navigate(redirectPath);
      }
    } else {
      if (result.error && typeof result.error === 'object') {
        setErrors(result.error);
        Object.values(result.error).forEach((msg) => {
          if (typeof msg === 'string') {
            toast.error(msg);
          } else if (Array.isArray(msg)) {
            msg.forEach((m) => toast.error(m));
          }
        });
      } else {
        toast.error(result.error || 'Registration failed. Please try again.');
      }
    }
    setLoading(false);
  };

  return (
    <>
      <PageTitle 
        title="Create Account" 
        description="Join AquaLearn and start learning aquaculture for free." 
      />
      
      <div className="min-h-[calc(100vh-120px)] bg-sea-foam flex items-center justify-center p-4">
        <AnimatedSection animation="fade-up" className="w-full max-w-md">
          <div className="bg-white rounded-brand-lg shadow-card p-6 md:p-8">
            <div className="text-center mb-6 md:mb-8">
              <div className="text-4xl md:text-5xl mb-2">🐟</div>
              <h1 className="text-2xl md:text-3xl font-bold text-deep-ocean">
                Create Account
              </h1>
              <p className="text-dark-navy/60 text-sm mt-1">
                Join AquaLearn and start learning for free
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* First Name */}
              <div className="mb-4">
                <label className="block text-deep-ocean font-medium text-sm mb-1.5">
                  First Name <span className="text-coral-orange">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-brand focus:outline-none focus:border-deep-ocean focus:ring-2 focus:ring-deep-ocean/20 transition text-dark-navy ${
                    errors.first_name ? 'border-coral-orange' : 'border-gray-300'
                  }`}
                  placeholder="Enter your first name"
                  required
                />
                {errors.first_name && (
                  <p className="text-coral-orange text-sm mt-1">{errors.first_name}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="mb-4">
                <label className="block text-deep-ocean font-medium text-sm mb-1.5">
                  Last Name <span className="text-coral-orange">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-brand focus:outline-none focus:border-deep-ocean focus:ring-2 focus:ring-deep-ocean/20 transition text-dark-navy ${
                    errors.last_name ? 'border-coral-orange' : 'border-gray-300'
                  }`}
                  placeholder="Enter your last name"
                  required
                />
                {errors.last_name && (
                  <p className="text-coral-orange text-sm mt-1">{errors.last_name}</p>
                )}
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-deep-ocean font-medium text-sm mb-1.5">
                  Email Address <span className="text-coral-orange">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-brand focus:outline-none focus:border-deep-ocean focus:ring-2 focus:ring-deep-ocean/20 transition text-dark-navy ${
                    errors.email ? 'border-coral-orange' : 'border-gray-300'
                  }`}
                  placeholder="you@example.com"
                  required
                />
                {errors.email && (
                  <p className="text-coral-orange text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="mb-1">
                <label className="block text-deep-ocean font-medium text-sm mb-1.5">
                  Password <span className="text-coral-orange">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={handlePasswordFocus}
                    onBlur={handlePasswordBlur}
                    className={`w-full px-4 py-3 pr-12 border rounded-brand focus:outline-none focus:border-deep-ocean focus:ring-2 focus:ring-deep-ocean/20 transition text-dark-navy ${
                      errors.password ? 'border-coral-orange' : 'border-gray-300'
                    }`}
                    placeholder="Minimum 8 characters"
                    required
                  />
                  <EyeToggle 
                    showPassword={showPassword} 
                    toggle={togglePasswordVisibility} 
                  />
                </div>
                {errors.password && (
                  <p className="text-coral-orange text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <PasswordStrength 
                password={formData.password} 
                isVisible={showCriteria}
              />

              {/* Confirm Password */}
              <div className="mt-3">
                <label className="block text-deep-ocean font-medium text-sm mb-1.5">
                  Confirm Password <span className="text-coral-orange">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="password2"
                    value={formData.password2}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-12 border rounded-brand focus:outline-none focus:border-deep-ocean focus:ring-2 focus:ring-deep-ocean/20 transition text-dark-navy ${
                      errors.password2 ? 'border-coral-orange' : 'border-gray-300'
                    }`}
                    placeholder="Confirm your password"
                    required
                  />
                  <EyeToggle 
                    showPassword={showConfirmPassword} 
                    toggle={toggleConfirmPasswordVisibility} 
                  />
                </div>
                {errors.password2 && (
                  <p className="text-coral-orange text-sm mt-1">{errors.password2}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-deep-ocean text-white py-3.5 px-4 rounded-brand font-medium hover:bg-deep-ocean/90 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-6"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-dark-navy/40">Already have an account?</span>
              </div>
            </div>

            <p className="text-center">
              <Link 
                to="/login" 
                className="text-clear-teal font-medium hover:text-clear-teal/80 transition-colors hover:underline"
              >
                Sign in to your account
              </Link>
            </p>

            <p className="text-center text-xs text-dark-navy/40 mt-4">
              By creating an account, you agree to our{' '}
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

export default Register;
