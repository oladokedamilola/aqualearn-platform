/**
 * AquaLearn Main Application Component
 * 
 * Sets up routing, authentication context, and toast notifications.
 * Includes protected routes, onboarding routes, and public routes.
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layout Components
import Layout from './components/Layout/Layout';
import Preloader from './components/UI/Preloader';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Landing from './pages/Landing';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Lesson from './pages/Lesson';
import Profile from './pages/Profile';
import Certificates from './pages/Certificates';
import VerifyCertificate from './pages/VerifyCertificate';
import VerifyEmail from './pages/VerifyEmail';
import VerifyEmailPending from './pages/VerifyEmailPending';
import Quiz from './pages/Quiz';

// Styles
import './index.css';
import './styles/animations.css';


// ============================================================================
// GLOBAL PRELOADER COMPONENT
// ============================================================================

/**
 * GlobalPreloader Component
 * 
 * Shows preloader on initial load and on every route change.
 * Displays for a minimum of 4 seconds.
 */
const GlobalPreloader = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const minDisplayTime = 4000; // 4 seconds

  // Show loader on initial load and route changes
  useEffect(() => {
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (isLoading) {
    return <Preloader minDisplayTime={minDisplayTime} />;
  }

  return children;
};


// ============================================================================
// ROUTE PROTECTION COMPONENTS
// ============================================================================

/**
 * Protected Route Component
 * 
 * Ensures only authenticated users can access certain routes.
 * Redirects unauthenticated users to the login page.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <Preloader minDisplayTime={4000} />;
  }
  
  if (!isAuthenticated) {
    // Save the current path to redirect back after login
    const currentPath = window.location.pathname;
    // Store in sessionStorage instead of localStorage to avoid persistence issues
    sessionStorage.setItem('redirect_after_auth', currentPath);
    return <Navigate to="/login" replace />;
  }
  
  return children;
};


/**
 * Onboarding Route Component
 * 
 * Ensures users only access onboarding if they haven't completed it.
 */
const OnboardingRoute = ({ children }) => {
  const { user, loading, onboardingRequired } = useAuth();
  
  if (loading) {
    return <Preloader minDisplayTime={4000} />;
  }
  
  if (!onboardingRequired) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};


/**
 * Public Route Component
 * 
 * Redirects authenticated users away from public routes.
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <Preloader minDisplayTime={4000} />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};


// ============================================================================
// APPLICATION ROUTES
// ============================================================================

/**
 * AppRoutes Component
 * 
 * Defines all application routes with their respective protection levels.
 */
function AppRoutes() {
  return (
    <GlobalPreloader>
      <Routes>
        {/* ===== PUBLIC ROUTES (No Authentication Required) ===== */}
        <Route 
          path="/" 
          element={
            <Layout>
              <Landing />
            </Layout>
          } 
        />
        
        <Route 
          path="/about" 
          element={
            <Layout>
              <About />
            </Layout>
          } 
        />
        <Route 
          path="/faq" 
          element={
            <Layout>
              <FAQ />
            </Layout>
          } 
        />
        <Route 
          path="/privacy" 
          element={
            <Layout>
              <Privacy />
            </Layout>
          } 
        />
        <Route 
          path="/terms" 
          element={
            <Layout>
              <Terms />
            </Layout>
          } 
        />
        <Route 
          path="/contact" 
          element={
            <Layout>
              <Contact />
            </Layout>
          } 
        />
        
        {/* Courses - PUBLIC (anyone can view) */}
        <Route 
          path="/courses" 
          element={
            <Layout>
              <Courses />
            </Layout>
          } 
        />
        
        <Route 
          path="/courses/:id" 
          element={
            <Layout>
              <CourseDetail />
            </Layout>
          } 
        />
        <Route 
          path="/verify-email-pending" 
          element={<VerifyEmailPending />} 
        />
        
        {/* Certificate Verification - PUBLIC */}
        <Route 
          path="/verify/:certificateId/:verificationCode" 
          element={
            <Layout>
              <VerifyCertificate />
            </Layout>
          } 
        />
        
        {/* Email Verification - PUBLIC */}
        <Route 
          path="/verify-email/:userId/:token" 
          element={<VerifyEmail />} 
        />
        
        {/* Auth Pages - Redirect if already authenticated */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Layout>
                <Login />
              </Layout>
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Layout>
                <Register />
              </Layout>
            </PublicRoute>
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            <Layout>
              <ForgotPassword />
            </Layout>
          } 
        />
        <Route 
          path="/reset-password/:uidb64/:token" 
          element={
            <Layout>
              <ResetPassword />
            </Layout>
          } 
        />

        {/* ===== PROTECTED ROUTES (Authentication Required) ===== */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/certificates" 
          element={
            <ProtectedRoute>
              <Layout>
                <Certificates />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        {/* Lesson - Requires Authentication */}
        <Route 
          path="/courses/:courseId/lessons/:lessonId" 
          element={
            <ProtectedRoute>
              <Layout>
                <Lesson />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/courses/:courseId/lessons/:lessonId/quiz" 
          element={
            <ProtectedRoute>
              <Layout>
                <Quiz />
              </Layout>
            </ProtectedRoute>
          } 
        />
            
        {/* Onboarding - Requires Authentication AND Onboarding Not Completed */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingRoute>
                <Layout>
                  <Onboarding />
                </Layout>
              </OnboardingRoute>
            </ProtectedRoute>
          }
        />
        
        {/* ===== CATCH-ALL ROUTE ===== */}
        <Route 
          path="*" 
          element={<Navigate to="/" replace />} 
        />
      </Routes>
    </GlobalPreloader>
  );
}


// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

/**
 * Main App Component
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        
        {/* Toast Notification Container */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastClassName="rounded-brand shadow-card"
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;