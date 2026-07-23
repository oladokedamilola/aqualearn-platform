import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import PageTitle from '../components/UI/PageTitle';
import AnimatedSection from '../components/UI/AnimatedSection';
import PasswordStrength from '../components/PasswordStrength';
import EyeToggle from '../components/UI/EyeToggle';

const ResetPassword = () => {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    password2: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCriteria, setShowCriteria] = useState(false);

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

    try {
      await api.post(`/users/password-reset-confirm/${uidb64}/${token}/`, {
        password: formData.password,
        password2: formData.password2,
      });
      toast.success('✅ Password reset successful! Please login with your new password.');
      navigate('/login');
    } catch (error) {
      if (error.response?.data?.error) {
        setErrors({ general: error.response.data.error });
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to reset password. Please try again.');
      }
    }
    setLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <>
      <PageTitle 
        title="Reset Password" 
        description="Set a new password for your AquaLearn account." 
      />
      
      <div className="min-h-[calc(100vh-120px)] bg-sea-foam flex items-center justify-center p-4">
        <AnimatedSection animation="fade-up" className="w-full max-w-md">
          <div className="bg-white rounded-brand-lg shadow-card p-6 md:p-8">
            {/* Header */}
            <div className="text-center mb-6 md:mb-8">
              <div className="text-4xl md:text-5xl mb-2">🔑</div>
              <h1 className="text-2xl md:text-3xl font-bold text-deep-ocean">
                Set New Password
              </h1>
              <p className="text-dark-navy/60 text-sm mt-1">
                Enter your new password below
              </p>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="bg-coral-orange/10 border-l-4 border-coral-orange p-3 rounded mb-4">
                <p className="text-coral-orange text-sm">{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* New Password with Eye Toggle */}
              <div className="mb-1">
                <label className="block text-deep-ocean font-medium text-sm mb-1.5">
                  New Password <span className="text-coral-orange">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={handlePasswordFocus}
                    onBlur={handlePasswordBlur}
                    className={`w-full px-4 py-2.5 pr-11 border ${
                      errors.password ? 'border-coral-orange' : 'border-gray-300'
                    } rounded-brand focus:outline-none focus:border-deep-ocean focus:ring-2 focus:ring-deep-ocean/20 transition text-dark-navy text-sm`}
                    placeholder="Minimum 8 characters"
                    required
                  />
                  <EyeToggle 
                    showPassword={showPassword} 
                    toggle={togglePasswordVisibility} 
                  />
                </div>
                {errors.password && (
                  <p className="text-coral-orange text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Password Strength */}
              <PasswordStrength 
                password={formData.password} 
                isVisible={showCriteria}
              />

              {/* Confirm New Password with Eye Toggle */}
              <div className="mt-3">
                <label className="block text-deep-ocean font-medium text-sm mb-1.5">
                  Confirm New Password <span className="text-coral-orange">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="password2"
                    value={formData.password2}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 pr-11 border ${
                      errors.password2 ? 'border-coral-orange' : 'border-gray-300'
                    } rounded-brand focus:outline-none focus:border-deep-ocean focus:ring-2 focus:ring-deep-ocean/20 transition text-dark-navy text-sm`}
                    placeholder="Confirm your new password"
                    required
                  />
                  <EyeToggle 
                    showPassword={showConfirmPassword} 
                    toggle={toggleConfirmPasswordVisibility} 
                  />
                </div>
                {errors.password2 && (
                  <p className="text-coral-orange text-xs mt-1">{errors.password2}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-clear-teal text-white py-3 px-4 rounded-brand font-medium hover:bg-clear-teal/90 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-6"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resetting...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-dark-navy/40">Remember your password?</span>
              </div>
            </div>

            {/* Back to Login Link */}
            <p className="text-center">
              <Link 
                to="/login" 
                className="text-clear-teal font-medium hover:text-clear-teal/80 transition-colors hover:underline"
              >
                Back to Login
              </Link>
            </p>

            {/* Security Note */}
            <p className="text-center text-xs text-dark-navy/40 mt-4">
              🔒 Your password is encrypted and securely stored
            </p>
          </div>
        </AnimatedSection>
      </div>
    </>
  );
};

export default ResetPassword;