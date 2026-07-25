/**
 * AquaLearn Authentication Context
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboardingRequired, setOnboardingRequired] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setOnboardingRequired(!userData.onboarding_completed);
        } catch (error) {
          console.error('Failed to load user session:', error);
          authService.logout();
          setUser(null);
          setOnboardingRequired(false);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      setUser(data.user);
      setOnboardingRequired(true);
      return { success: true, data };
    } catch (error) {
      const errorData = error.response?.data || {};
      return {
        success: false,
        error: errorData.error || errorData || 'Registration failed. Please try again.'
      };
    }
  };

  const login = async (email, password, remember = false) => {
    try {
      const data = await authService.login({ email, password });
      setUser(data.user);
      setOnboardingRequired(data.onboarding_required || false);
      
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

  const logout = () => {
    authService.logout();
    setUser(null);
    setOnboardingRequired(false);
    localStorage.removeItem('remember_me');
    return { 
      success: true, 
      message: 'You have been successfully logged out.' 
    };
  };

  const updateUser = (userData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...userData,
    }));
  };

  const completeOnboarding = async (data) => {
    try {
      const result = await authService.completeOnboarding(data);
      setUser(result.user);
      setOnboardingRequired(false);
      
      const redirectPath = authService.getRedirectAfterAuth();
      if (redirectPath) {
        authService.clearRedirectAfterAuth();
      }
      
      return { success: true, data: result };
    } catch (error) {
      const errorData = error.response?.data || {};
      return {
        success: false,
        error: errorData.error || errorData || 'Onboarding failed. Please try again.'
      };
    }
  };

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

  const isAuthenticated = () => {
    return !!user && authService.isAuthenticated();
  };

  const value = {
    user,
    loading,
    onboardingRequired,
    login,
    register,
    logout,
    updateUser,
    completeOnboarding,
    refreshUser,
    authService,
    isAuthenticated: isAuthenticated(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
