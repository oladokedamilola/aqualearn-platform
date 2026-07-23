/**
 * Loading Spinner Component
 * 
 * Reusable loading spinner with brand colors.
 * 
 * @param {Object} props
 * @param {string} props.size - Size of spinner (sm, md, lg)
 * @param {string} props.message - Loading message to display
 * @param {string} props.color - Color of spinner (default: deep-ocean)
 */

import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  message = 'Loading...', 
  color = 'deep-ocean' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="min-h-screen bg-sea-foam flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div 
          className={`${sizeClasses[size]} border-4 border-${color} border-t-transparent rounded-full animate-spin`}
        />
        <p className={`text-${color} font-medium`}>{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;