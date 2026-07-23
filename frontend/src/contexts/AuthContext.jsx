/**
 * AquaLearn Authentication Context
 * 
 * Provides authentication state and methods throughout the application.
 * Manages user session, JWT tokens, onboarding status, email verification,
 * redirect after auth, and remember me functionality.
 * 
 * @module contexts/AuthContext
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/auth';


// ============================================================================
// CONTEXT CREATION
// ============================================================================

/**
 * Auth Context
 * 
 * Contains authentication state and methods for managing user sessions.
 */
const AuthContext = createContext();


// ============================================================================
// CUSTOM HOOK
// ============================================================================

/**
 * useAuth Hook
 * 
 * Custom hook for accessing authentication context.
 * Must be used within an AuthProvider.
 * 
 * @returns {Object} Auth context value
 * @throws {Error} If used outside of AuthProvider
 * 
 * @example
 * const { user, login, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


// ============================================================================
// AUTH PROVIDER COMPONENT
// ============================================================================

/**
 * AuthProvider Component
 * 
 * Provides authentication state to all child components.
 * Loads user session on mount and manages token persistence.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactNode} Auth context provider
 */
export const AuthProvider = ({ children }) => {
  // ===== STATE =====
  
  /** Current authenticated user object */
  const [user, setUser] = useState(null);
  
  /** Loading state for authentication checks */
  const [loading, setLoading] = useState(true);
  
  /** Whether user needs to complete onboarding */
  const [onboardingRequired, setOnboardingRequired] = useState(false);
  
  /** Whether user needs to verify email */
  const [requiresVerification, setRequiresVerification] = useState(false);
  
  /** Email of pending user waiting for verification */
  const [pendingUserEmail, setPendingUserEmail] = useState(null);
  
  /** User ID of pending user waiting for verification */
  const [pendingUserId, setPendingUserId] = useState(null);

  // ===== EFFECTS =====

  /**
   * Load user session on mount
   * 
   * Checks for valid JWT token and loads user data.
   * Handles token expiration and invalid sessions.
   */
  useEffect(() => {
    const loadUser = async () => {
      // Check if user has a valid access token
      if (authService.isAuthenticated()) {
        try {
          // Fetch current user data from API
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setOnboardingRequired(!userData.onboarding_completed);
          setRequiresVerification(false);
          setPendingUserEmail(null);
          setPendingUserId(null);
          
          // If remember me was checked, ensure refresh token is stored
          if (localStorage.getItem('remember_me') === 'true') {
            // Refresh token is already stored by the login function
            // Just ensure it's still valid
          }
        } catch (error) {
          // Handle authentication errors (invalid token, expired, etc.)
          console.error('Failed to load user session:', error);
          authService.logout(); // Clear invalid tokens
          setUser(null);
          setOnboardingRequired(false);
          setRequiresVerification(false);
          setPendingUserEmail(null);
          setPendingUserId(null);
        }
      }
      setLoading(false);
    };
    
    loadUser();
  }, []); // Empty dependency array = run once on mount

  // ===== AUTHENTICATION METHODS =====

  /**
   * Register User
   * 
   * Creates a new user account. Sends verification email.
   * User is not logged in until email is verified.
   * 
   * @param {Object} userData - Registration data
   * @param {string} userData.first_name - User's first name
   * @param {string} userData.last_name - User's last name
   * @param {string} userData.email - User's email address
   * @param {string} userData.password - User's password
   * @param {string} userData.password2 - Password confirmation
   * @returns {Promise<Object>} Registration result with success status and data
   */
  const register = async (userData) => {
    try {
      // Call registration API
      const data = await authService.register(userData);
      
      // Store pending verification info
      setRequiresVerification(true);
      setPendingUserEmail(data.email || userData.email);
      setPendingUserId(data.user_id);
      
      // Clear any existing user session
      setUser(null);
      setOnboardingRequired(false);
      
      return { success: true, data };
    } catch (error) {
      // Handle registration errors
      const errorData = error.response?.data || {};
      return {
        success: false,
        error: errorData.error || errorData || 'Registration failed. Please try again.'
      };
    }
  };

  /**
   * Verify Email
   * 
   * Verifies user's email using the token from the verification link.
   * Auto-logins the user upon successful verification.
   * 
   * @param {string} userId - User's ID
   * @param {string} token - Verification token
   * @returns {Promise<Object>} Verification result with success status and data
   */
  const verifyEmail = async (userId, token) => {
  try {
    const data = await authService.verifyEmail(userId, token);
    console.log('🔵 verifyEmail response:', data);
    
    if (data.verified) {
      // ✅ User is now verified and logged in
      // The authService.verifyEmail already stored the tokens
      setUser(data.user);
      setOnboardingRequired(data.onboarding_required || false);
      setRequiresVerification(false);
      setPendingUserEmail(null);
      setPendingUserId(null);
      
      return { success: true, data };
    }
    
    if (data.already_verified) {
      return { success: true, data };
    }
    
    return { success: false, error: 'Email verification failed' };
  } catch (error) {
    console.error('🔴 verifyEmail error:', error);
    const errorData = error.response?.data || {};
    return {
      success: false,
      error: errorData.error || 'Verification failed. Please try again.'
    };
  }
};

  /**
   * Resend Verification Email
   * 
   * Resends the email verification link to the user.
   * 
   * @param {string} email - User's email address
   * @returns {Promise<Object>} Resend result with success status
   */
  const resendVerification = async (email) => {
    try {
      const data = await authService.resendVerification(email);
      return { success: true, data };
    } catch (error) {
      const errorData = error.response?.data || {};
      return {
        success: false,
        error: errorData.error || 'Failed to resend verification email.'
      };
    }
  };

  /**
   * Login User
   * 
   * Authenticates user with email and password.
   * Stores JWT tokens and remembers user preference.
   * 
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @param {boolean} remember - Whether to persist session (Remember Me)
   * @returns {Promise<Object>} Login result with success status and data
   */
  const login = async (email, password, remember = false) => {
  try {
    const data = await authService.login({ email, password });
    console.log('🔵 Login response:', data);
    
    // Check if email verification is required
    if (data.requires_verification || data.verified === false) {
      localStorage.setItem('pending_verification_email', email);
      localStorage.setItem('pending_verification_user_id', data.user_id);
      
      return { 
        success: true, 
        data: { 
          ...data, 
          requires_verification: true 
        } 
      };
    }
    
    // ✅ User is verified - set state
    setUser(data.user);
    setOnboardingRequired(data.onboarding_required || false);
    console.log('🔵 onboarding_required:', data.onboarding_required);
    
    setRequiresVerification(false);
    setPendingUserEmail(null);
    setPendingUserId(null);
    
    if (remember) {
      localStorage.setItem('remember_me', 'true');
    } else {
      localStorage.removeItem('remember_me');
    }
    
    return { success: true, data };
  } catch (error) {
    const errorData = error.response?.data || {};
    return { 
      success: false, 
      error: errorData.error || errorData.message || 'Login failed. Please try again.'
    };
  }
};

  /**
   * Logout User
   * 
   * Clears user session and removes all stored tokens.
   * Resets all authentication state.
   * 
   * @returns {Object} Result with success message
   */
  const logout = () => {
    authService.logout();
    setUser(null);
    setOnboardingRequired(false);
    setRequiresVerification(false);
    setPendingUserEmail(null);
    setPendingUserId(null);
    localStorage.removeItem('remember_me');
    
    // ✅ Return success message
    return { 
      success: true, 
      message: 'You have been successfully logged out.' 
    };
  };

  /**
   * Update User Profile
   * 
   * Updates the current user object in state.
   * Useful after profile updates to reflect changes immediately.
   * 
   * @param {Object} userData - Updated user data
   */
  const updateUser = (userData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...userData,
    }));
  };

  /**
   * Complete Onboarding
   * 
   * Finalizes the user onboarding process.
   * Updates profile data and marks onboarding as completed.
   * 
   * @param {Object} data - Onboarding data
   * @param {string} data.experience_level - User's experience level
   * @param {Array} data.interests - User's interests
   * @param {string} data.bio - User's biography
   * @param {File} data.profile_image - User's profile image
   * @returns {Promise<Object>} Onboarding result with success status
   */
    const completeOnboarding = async (data) => {
  console.log('🟢 AuthContext: completeOnboarding called');
  console.log('🟢 Data type:', data instanceof FormData ? 'FormData' : typeof data);
  
  try {
    // ✅ Call onboarding completion API
    const result = await authService.completeOnboarding(data);
    console.log('🟢 AuthContext: result received:', result);
    
    // ✅ Update user state with new data
    if (result.user) {
      setUser(result.user);
    } else {
      // If no user returned, refresh user data
      const userData = await authService.getCurrentUser();
      setUser(userData);
    }
    
    setOnboardingRequired(false);
    
    // Check if there's a redirect after auth
    const redirectPath = authService.getRedirectAfterAuth();
    if (redirectPath) {
      authService.clearRedirectAfterAuth();
    }
    
    return { success: true, data: result };
  } catch (error) {
    console.error('🔴 AuthContext: completeOnboarding error:', error);
    console.error('🔴 Error response:', error.response);
    
    // Handle onboarding errors
    const errorData = error.response?.data || {};
    return {
      success: false,
      error: errorData.error || errorData || 'Onboarding failed. Please try again.'
    };
  }
};

  /**
   * Refresh User Data
   * 
   * Fetches fresh user data from the API.
   * Useful after profile updates from other sessions.
   * 
   * @returns {Promise<Object>} Updated user data
   */
  const refreshUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setOnboardingRequired(!userData.onboarding_completed);
      return userData;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      throw error;
    }
  };

  /**
   * Check if user is authenticated
   * 
   * @returns {boolean} True if user is authenticated
   */
  const isAuthenticated = () => {
    return !!user && authService.isAuthenticated();
  };

  // ===== CONTEXT VALUE =====

  const value = {
    // State
    user,
    loading,
    onboardingRequired,
    requiresVerification,
    pendingUserEmail,
    pendingUserId,
    
    // Methods
    login,
    register,
    verifyEmail,
    resendVerification,
    logout,
    updateUser,
    completeOnboarding,
    refreshUser,
    
    // ✅ Add authService to the context value
    authService,
    
    // Computed
    isAuthenticated: isAuthenticated(),
  };

  // ===== RENDER =====

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;