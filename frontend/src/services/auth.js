import api from './api';

export const authService = {
  // Register user
  register: async (userData) => {
    const response = await api.post('/users/register/', userData);
    return response.data;
  },

  // Verify email
  verifyEmail: async (userId, token) => {
    const response = await api.get(`/users/verify-email/${userId}/${token}/`);
    console.log('📥 Verify email response:', response.data);
    
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      console.log('✅ Tokens stored from verification');
    }
    return response.data;
  },

  // Resend verification email
  resendVerification: async (email) => {
    const response = await api.post('/users/resend-verification/', { email });
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/users/login/', credentials);
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
    }
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('redirect_after_auth');
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/users/profile/');
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await api.patch('/users/profile/', data);
    return response.data;
  },

  // Onboarding: Experience Level
  updateExperience: async (data) => {
    const response = await api.post('/users/onboarding/experience/', data);
    return response.data;
  },

  // Onboarding: Interests
  updateInterests: async (data) => {
    const response = await api.post('/users/onboarding/interests/', data);
    return response.data;
  },

// Onboarding: Profile
completeOnboarding: async (data) => {
  console.log('📤 authService: completeOnboarding called');
  console.log('📤 Data type:', data instanceof FormData ? 'FormData' : typeof data);
  
  // ✅ If data is FormData, let axios handle the headers automatically
  const response = await api.post('/users/onboarding/profile/', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  console.log('📥 authService: response received:', response.data);
  return response.data;
},

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  // ===== REDIRECT AFTER AUTH METHODS =====
  
  // Store redirect after auth
  setRedirectAfterAuth: (path) => {
    console.log('🟢 Setting redirect after auth:', path);
    localStorage.setItem('redirect_after_auth', path);
  },

  // Get redirect after auth
  getRedirectAfterAuth: () => {
    const path = localStorage.getItem('redirect_after_auth');
    console.log('🟢 Getting redirect after auth:', path);
    return path;
  },

  // Clear redirect after auth
  clearRedirectAfterAuth: () => {
    console.log('🟢 Clearing redirect after auth');
    localStorage.removeItem('redirect_after_auth');
  },
};