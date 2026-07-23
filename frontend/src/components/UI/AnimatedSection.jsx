import React, { useEffect, useRef, useState } from 'react';

const AnimatedSection = ({
  children,
  animation = 'fade-up',
  delay = 0,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [delay]);

  const animations = {
    'fade-up': 'translate-y-8 opacity-0',
    'fade-down': '-translate-y-8 opacity-0',
    'fade-left': 'translate-x-8 opacity-0',
    'fade-right': '-translate-x-8 opacity-0',
    'scale': 'scale-95 opacity-0',
    'none': '',
  };

  const visibleAnimations = {
    'fade-up': 'translate-y-0 opacity-100',
    'fade-down': 'translate-y-0 opacity-100',
    'fade-left': 'translate-x-0 opacity-100',
    'fade-right': 'translate-x-0 opacity-100',
    'scale': 'scale-100 opacity-100',
    'none': '',
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? visibleAnimations[animation] : animations[animation]
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;