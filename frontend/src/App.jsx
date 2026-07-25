/**
 * AquaLearn Main Application Component
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Preloader from './components/UI/Preloader';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
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
import Quiz from './pages/Quiz';

// ✅ Removed: ForgotPassword, ResetPassword, VerifyEmail, VerifyEmailPending

import './index.css';
import './styles/animations.css';

const GlobalPreloader = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const minDisplayTime = 4000;

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

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <Preloader minDisplayTime={4000} />;
  }
  
  if (!isAuthenticated) {
    const currentPath = window.location.pathname;
    sessionStorage.setItem('redirect_after_auth', currentPath);
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const OnboardingRoute = ({ children }) => {
  const { loading, onboardingRequired } = useAuth();
  
  if (loading) {
    return <Preloader minDisplayTime={4000} />;
  }
  
  if (!onboardingRequired) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

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

function AppRoutes() {
  return (
    <GlobalPreloader>
      <Routes>
        {/* ===== PUBLIC ROUTES ===== */}
        <Route path="/" element={<Layout><Landing /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/faq" element={<Layout><FAQ /></Layout>} />
        <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
        <Route path="/terms" element={<Layout><Terms /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="/courses" element={<Layout><Courses /></Layout>} />
        <Route path="/courses/:id" element={<Layout><CourseDetail /></Layout>} />
        <Route path="/verify/:certificateId/:verificationCode" element={<Layout><VerifyCertificate /></Layout>} />
        
        {/* ✅ Removed: /verify-email, /verify-email-pending, /forgot-password, /reset-password */}
        
        <Route path="/login" element={<PublicRoute><Layout><Login /></Layout></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Layout><Register /></Layout></PublicRoute>} />

        {/* ===== PROTECTED ROUTES ===== */}
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
        <Route path="/certificates" element={<ProtectedRoute><Layout><Certificates /></Layout></ProtectedRoute>} />
        <Route path="/courses/:courseId/lessons/:lessonId" element={<ProtectedRoute><Layout><Lesson /></Layout></ProtectedRoute>} />
        <Route path="/courses/:courseId/lessons/:lessonId/quiz" element={<ProtectedRoute><Layout><Quiz /></Layout></ProtectedRoute>} />
        
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingRoute><Layout><Onboarding /></Layout></OnboardingRoute></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </GlobalPreloader>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
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
