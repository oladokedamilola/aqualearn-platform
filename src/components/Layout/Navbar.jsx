import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = isAuthenticated
    ? [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/courses', label: 'Courses', icon: '📚' },
        { path: '/certificates', label: 'Certificates', icon: '📜' },
        { path: '/profile', label: 'Profile', icon: '👤' },
      ]
    : [
        { path: '/', label: 'Home', icon: '🏠' },
        { path: '/courses', label: 'Courses', icon: '📚' },
        { path: '/about', label: 'About', icon: 'ℹ️' },
        { path: '/faq', label: 'FAQ', icon: '❓' },
      ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-card py-2'
            : 'bg-white/80 backdrop-blur-sm py-4'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              to={isAuthenticated ? '/dashboard' : '/'}
              className="flex items-center gap-2 group"
            >
              <span className="text-2xl transition-transform duration-300 group-hover:scale-110">🐟</span>
              <span className="text-xl font-bold text-deep-ocean">
                AquaLearn
                <span className="text-clear-teal">.</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-brand text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    isActive(link.path)
                      ? 'bg-deep-ocean text-white shadow-md'
                      : 'text-dark-navy hover:bg-deep-ocean/5'
                  }`}
                >
                  <span className="mr-1">{link.icon}</span>
                  {link.label}
                </Link>
              ))}

              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="ml-2 px-4 py-2 rounded-brand text-sm font-medium text-coral-orange hover:bg-coral-orange/10 transition-all duration-200 hover:scale-105"
                >
                  🚪 Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-brand text-sm font-medium text-deep-ocean hover:bg-deep-ocean/5 transition-all duration-200 hover:scale-105"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-brand text-sm font-medium bg-deep-ocean text-white hover:bg-deep-ocean/90 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-brand hover:bg-deep-ocean/5 transition-colors"
              aria-label="Toggle menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span
                  className={`block h-0.5 bg-deep-ocean transition-all duration-300 ${
                    isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                  }`}
                />
                <span
                  className={`block h-0.5 bg-deep-ocean transition-all duration-300 ${
                    isMobileMenuOpen ? 'opacity-0' : ''
                  }`}
                />
                <span
                  className={`block h-0.5 bg-deep-ocean transition-all duration-300 ${
                    isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 z-40 bg-white shadow-card transition-transform duration-300 ease-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🐟</span>
            <span className="text-xl font-bold text-deep-ocean">AquaLearn</span>
          </div>

          {/* Mobile Nav Links */}
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-3 rounded-brand text-sm font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? 'bg-deep-ocean text-white'
                    : 'text-dark-navy hover:bg-deep-ocean/5'
                }`}
              >
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </Link>
            ))}

            <div className="border-t border-gray-200 my-2 pt-2">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 rounded-brand text-sm font-medium text-coral-orange hover:bg-coral-orange/10 transition-all duration-200 text-left"
                >
                  🚪 Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-3 rounded-brand text-sm font-medium text-deep-ocean hover:bg-deep-ocean/5 transition-all duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-3 rounded-brand text-sm font-medium bg-deep-ocean text-white hover:bg-deep-ocean/90 transition-all duration-200 text-center mt-2"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;