import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/courses', label: 'Courses', icon: '📚' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🐟</span>
            <span className="font-bold text-deep-ocean">AquaLearn</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-brand text-sm font-medium transition ${
                    isActive(item.path)
                      ? 'bg-deep-ocean text-white'
                      : 'text-dark-navy hover:bg-deep-ocean/5'
                  }`}
                >
                  {item.icon} {item.label}
                </Link>
              ))}
            </div>

            <button
              onClick={logout}
              className="text-dark-navy/60 hover:text-coral-orange transition text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around py-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center p-2 text-xs transition ${
                isActive(item.path)
                  ? 'text-clear-teal'
                  : 'text-dark-navy/60 hover:text-deep-ocean'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
          <button
            onClick={logout}
            className="flex flex-col items-center p-2 text-xs text-dark-navy/60 hover:text-coral-orange transition"
          >
            <span className="text-xl">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;