import React, { createContext, useContext, useState, useEffect } from 'react';
import Preloader from '../components/UI/Preloader';

const LoadingContext = createContext();

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [minDisplayTime] = useState(4000); // 4 seconds minimum

  useEffect(() => {
    // Start loading on mount
    setIsLoading(true);

    // Minimum display time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime]);

  // Function to show loading on navigation
  const showLoading = () => {
    setIsLoading(true);
    // Auto-hide after minimum time
    setTimeout(() => {
      setIsLoading(false);
    }, minDisplayTime);
  };

  const value = {
    isLoading,
    setIsLoading,
    showLoading,
    minDisplayTime,
  };

  return (
    <LoadingContext.Provider value={value}>
      {isLoading && <Preloader minDisplayTime={minDisplayTime} />}
      {children}
    </LoadingContext.Provider>
  );
};