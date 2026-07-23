import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoading } from '../../contexts/LoadingContext';
import Preloader from './Preloader';

const RouteChangeLoader = ({ children }) => {
  const location = useLocation();
  const { isLoading, setIsLoading, minDisplayTime } = useLoading();
  const [isRouteChanging, setIsRouteChanging] = useState(false);

  useEffect(() => {
    // Show loader on route change
    setIsRouteChanging(true);
    setIsLoading(true);

    // Hide after minimum time
    const timer = setTimeout(() => {
      setIsRouteChanging(false);
      setIsLoading(false);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [location.pathname, setIsLoading, minDisplayTime]);

  if (isLoading || isRouteChanging) {
    return <Preloader minDisplayTime={minDisplayTime} />;
  }

  return children;
};

export default RouteChangeLoader;