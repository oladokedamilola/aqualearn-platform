import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import PageTitle from '../components/UI/PageTitle';
import AnimatedSection from '../components/UI/AnimatedSection';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, completeOnboarding, authService } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState('forward');
  const [isAnimating, setIsAnimating] = useState(false);
  
  const [formData, setFormData] = useState({
    experience_level: user?.experience_level || 'beginner',
    interests: user?.interests || [],
    bio: user?.bio || '',
    profile_image: null,
  });

  const experienceOptions = [
    { value: 'beginner', label: '🌱 Beginner', desc: 'New to fish farming' },
    { value: 'intermediate', label: '🌿 Intermediate', desc: 'Have some experience' },
    { value: 'advanced', label: '🌳 Advanced', desc: 'Experienced farmer' },
  ];

  const interestOptions = [
    { value: 'tilapia', label: '🐟 Tilapia Farming' },
    { value: 'catfish', label: '🐠 Catfish Farming' },
    { value: 'pond_management', label: '💧 Pond Management' },
    { value: 'feed_management', label: '🍽️ Feed Management' },
    { value: 'water_quality', label: '🌊 Water Quality' },
    { value: 'health_management', label: '🩺 Fish Health' },
    { value: 'harvesting', label: '🎣 Harvesting & Marketing' },
    { value: 'business', label: '💼 Business Management' },
  ];

  const toggleInterest = (value) => {
    if (formData.interests.includes(value)) {
      setFormData({
        ...formData,
        interests: formData.interests.filter((i) => i !== value),
      });
    } else {
      setFormData({
        ...formData,
        interests: [...formData.interests, value],
      });
    }
  };

  const handleNext = () => {
    if (step < 3 && !isAnimating) {
      setDirection('forward');
      setIsAnimating(true);
      setTimeout(() => {
        setStep(step + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleBack = () => {
    if (step > 1 && !isAnimating) {
      setDirection('backward');
      setIsAnimating(true);
      setTimeout(() => {
        setStep(step - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  // ✅ FIXED: Complete onboarding with proper error handling
  const handleComplete = async () => {
    console.log('🟢 Onboarding complete clicked');
    setLoading(true);
    
    try {
      // ✅ First update experience level
      try {
        await authService.updateExperience({ 
          experience_level: formData.experience_level 
        });
        console.log('🟢 Experience updated');
      } catch (error) {
        console.warn('Failed to update experience:', error);
      }
      
      // ✅ Update interests
      try {
        await authService.updateInterests({ 
          interests: formData.interests 
        });
        console.log('🟢 Interests updated');
      } catch (error) {
        console.warn('Failed to update interests:', error);
      }
      
      // ✅ Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add bio if it exists
      if (formData.bio) {
        formDataToSend.append('bio', formData.bio);
        console.log('🟢 Adding bio:', formData.bio);
      }
      
      // Add profile image if it exists
      if (formData.profile_image) {
        formDataToSend.append('profile_image', formData.profile_image);
        console.log('🟢 Adding profile image:', formData.profile_image.name);
      }
      
      console.log('📤 Sending FormData...');
      
      // ✅ Complete profile with FormData
      const result = await completeOnboarding(formDataToSend);
      console.log('🟢 Onboarding result:', result);
      
      if (result.success) {
        toast.success('🎉 Welcome to AquaLearn! Your profile is complete.');
        
        // ✅ Wait a moment for state to update
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const redirectPath = authService.getRedirectAfterAuth();
        console.log('🟢 Redirect path after auth:', redirectPath);
        
        if (redirectPath) {
          authService.clearRedirectAfterAuth();
          navigate(redirectPath);
        } else {
          navigate('/dashboard');
        }
      } else {
        console.error('🔴 Onboarding failed:', result.error);
        toast.error(result.error || 'Failed to complete onboarding. Please try again.');
      }
    } catch (error) {
      console.error('🔴 Onboarding error:', error);
      console.error('🔴 Error response:', error.response);
      
      // Check if it's a validation error
      if (error.response?.data) {
        const errors = error.response.data;
        const errorMessages = Object.values(errors).flat().join(', ');
        toast.error(errorMessages || 'An error occurred. Please try again.');
      } else {
        toast.error('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStepProgress = () => {
    return ((step - 1) / 2) * 100;
  };

  const getAnimationClass = () => {
    if (!isAnimating) return 'opacity-100 translate-x-0';
    
    if (direction === 'forward') {
      return 'opacity-0 -translate-x-8';
    } else {
      return 'opacity-0 translate-x-8';
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className={`transition-all duration-300 ease-out ${getAnimationClass()}`}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-deep-ocean/10 flex items-center justify-center text-3xl mx-auto mb-3">
                🌱
              </div>
              <h2 className="text-xl font-bold text-deep-ocean">
                What's your experience level?
              </h2>
              <p className="text-dark-navy/60 text-sm mt-1">
                This helps us recommend the right courses for you.
              </p>
            </div>
            <div className="space-y-3">
              {experienceOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFormData({ ...formData, experience_level: opt.value })}
                  className={`w-full text-left p-4 border-2 rounded-brand transition-all duration-300 ${
                    formData.experience_level === opt.value
                      ? 'border-deep-ocean bg-deep-ocean/5 shadow-md scale-[1.02]'
                      : 'border-gray-200 hover:border-deep-ocean/50 hover:bg-deep-ocean/5 hover:scale-[1.01]'
                  }`}
                >
                  <div className="font-medium text-deep-ocean">{opt.label}</div>
                  <div className="text-sm text-dark-navy/60">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className={`transition-all duration-300 ease-out ${getAnimationClass()}`}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-clear-teal/10 flex items-center justify-center text-3xl mx-auto mb-3">
                🎯
              </div>
              <h2 className="text-xl font-bold text-deep-ocean">
                What interests you?
              </h2>
              <p className="text-dark-navy/60 text-sm mt-1">
                Select all that apply (optional).
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {interestOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => toggleInterest(opt.value)}
                  className={`p-3 border-2 rounded-brand transition-all duration-300 text-center ${
                    formData.interests.includes(opt.value)
                      ? 'border-clear-teal bg-clear-teal/10 shadow-md scale-[1.02]'
                      : 'border-gray-200 hover:border-clear-teal/50 hover:bg-clear-teal/5 hover:scale-[1.02]'
                  }`}
                >
                  <span className="text-sm font-medium text-deep-ocean">
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className={`transition-all duration-300 ease-out ${getAnimationClass()}`}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-coral-orange/10 flex items-center justify-center text-3xl mx-auto mb-3">
                📸
              </div>
              <h2 className="text-xl font-bold text-deep-ocean">
                Almost done!
              </h2>
              <p className="text-dark-navy/60 text-sm mt-1">
                Add a profile photo and tell us about yourself.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-deep-ocean font-medium text-sm mb-1.5">
                  Profile Photo (optional)
                </label>
                <div className="flex items-center gap-4">
                  {formData.profile_image ? (
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(formData.profile_image)}
                        alt="Profile preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-deep-ocean"
                      />
                      <button
                        onClick={() => setFormData({ ...formData, profile_image: null })}
                        className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-coral-orange text-white text-xs flex items-center justify-center hover:bg-coral-orange/90 transition"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-deep-ocean/10 flex items-center justify-center text-3xl border-2 border-dashed border-gray-300">
                      🐟
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        setFormData({ ...formData, profile_image: e.target.files[0] });
                      }
                    }}
                    className="text-sm text-dark-navy/60 file:mr-3 file:py-2 file:px-4 file:rounded-brand file:border-0 file:bg-deep-ocean file:text-white file:hover:bg-deep-ocean/90 file:cursor-pointer file:transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-deep-ocean font-medium text-sm mb-1.5">
                  Tell us about yourself (optional)
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-brand focus:outline-none focus:border-deep-ocean focus:ring-2 focus:ring-deep-ocean/20 transition resize-none"
                  placeholder="I'm a fish farmer from..."
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <PageTitle title="Onboarding" description="Complete your profile to get started." />
      
      <div className="min-h-[calc(100vh-120px)] bg-sea-foam flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-dark-navy/40 mb-1.5">
              <span>Step {step} of 3</span>
              <span>{Math.round(getStepProgress())}%</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-deep-ocean via-clear-teal to-deep-ocean rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getStepProgress()}%` }}
              />
            </div>
          </div>

          {/* Card */}
          <AnimatedSection animation="fade-up" className="w-full">
            <div className="bg-white rounded-brand-lg shadow-card p-6 md:p-8 relative overflow-hidden">
              {/* Subtle background decoration */}
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-deep-ocean/5 blur-2xl"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-clear-teal/5 blur-2xl"></div>
              
              {/* Step Counter Badge */}
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-medium text-deep-ocean/60 bg-deep-ocean/10 px-2.5 py-1 rounded-full">
                    Step {step}/3
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((s) => (
                      <div
                        key={s}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          s <= step ? 'w-6 bg-deep-ocean' : 'w-3 bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Step Content */}
              <div className="relative z-10 min-h-[320px]">
                {renderStep()}
              </div>

              {/* Navigation Buttons */}
              <div className="relative z-10 flex gap-3 mt-8 pt-6 border-t border-gray-100">
                {step > 1 ? (
                  <button
                    onClick={handleBack}
                    disabled={isAnimating}
                    className="flex-1 bg-gray-100 text-dark-navy py-3 rounded-brand font-medium hover:bg-gray-200 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Back
                  </button>
                ) : (
                  <div className="flex-1"></div>
                )}
                
                {step < 3 ? (
                  <button
                    onClick={handleNext}
                    disabled={isAnimating}
                    className="flex-1 bg-deep-ocean text-white py-3 rounded-brand font-medium hover:bg-deep-ocean/90 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Continue
                    <span className="text-lg">→</span>
                  </button>
                ) : (
                  <button
                    onClick={handleComplete}
                    disabled={loading || isAnimating}
                    className="flex-1 bg-clear-teal text-white py-3 rounded-brand font-medium hover:bg-clear-teal/90 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Completing...
                      </>
                    ) : (
                      <>
                        🎉 Complete
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Skip option for steps 2 & 3 */}
              {step > 1 && step < 3 && (
                <button
                  onClick={handleComplete}
                  disabled={loading || isAnimating}
                  className="relative z-10 w-full text-center text-sm text-dark-navy/40 mt-3 hover:text-deep-ocean transition-colors hover:underline"
                >
                  Skip for now
                </button>
              )}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </>
  );
};

export default Onboarding;