import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AnimatedSection from './AnimatedSection';

// Hero slide images - Replace with actual image URLs
const heroSlides = [
  {
    id: 1,
    image: '/images/hero/fish-farmer-1.jpg',
    title: 'Learn Modern Fish Farming',
    subtitle: 'Practical aquaculture knowledge for Nigerian farmers',
    cta: 'Start Learning',
    ctaLink: '/courses',
    alignment: 'center',
  },
  {
    id: 2,
    image: '/images/hero/fish-farmer-2.jpg',
    title: 'Grow Your Skills, Grow Your Business',
    subtitle: 'From beginner to expert farmer',
    cta: 'Explore Courses',
    ctaLink: '/courses',
    alignment: 'left',
  },
  {
    id: 3,
    image: '/images/hero/fish-farmer-3.jpg',
    title: 'Earn Verifiable Certificates',
    subtitle: 'Showcase your achievement with pride',
    cta: 'View Certificates',
    ctaLink: '/courses',
    alignment: 'right',
  },
];

const HeroCarousel = () => {
  const { isAuthenticated } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);

  const totalSlides = heroSlides.length;

  // Auto-slide function
  const goToSlide = useCallback((index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning]);

  // Auto-slide effect - slides every 5 seconds
  useEffect(() => {
    if (!autoPlay) return;
    
    const timer = setInterval(() => {
      const nextIndex = (currentSlide + 1) % totalSlides;
      goToSlide(nextIndex);
    }, 5000);

    return () => clearInterval(timer);
  }, [currentSlide, goToSlide, totalSlides, autoPlay]);

  // Pause auto-slide on hover
  const handleMouseEnter = () => setAutoPlay(false);
  const handleMouseLeave = () => setAutoPlay(true);

  // Manual navigation
  const goToPrevious = () => {
    const prevIndex = (currentSlide - 1 + totalSlides) % totalSlides;
    goToSlide(prevIndex);
  };

  const goToNext = () => {
    const nextIndex = (currentSlide + 1) % totalSlides;
    goToSlide(nextIndex);
  };

  const slide = heroSlides[currentSlide];

  const getAlignmentClass = (alignment) => {
    switch (alignment) {
      case 'left':
        return 'items-start text-left';
      case 'right':
        return 'items-end text-right';
      default:
        return 'items-center text-center';
    }
  };

  const getTextAlignment = (alignment) => {
    switch (alignment) {
      case 'left':
        return 'text-left';
      case 'right':
        return 'text-right';
      default:
        return 'text-center';
    }
  };

  return (
    <div 
      className="relative h-[85vh] min-h-[500px] max-h-[700px] overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Slide Image with Overlay */}
      <div
        className={`absolute inset-0 transition-transform duration-700 ease-in-out ${
          isTransitioning ? 'scale-105' : 'scale-100'
        }`}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${slide.image})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center px-4">
        <div className={`max-w-4xl w-full flex flex-col ${getAlignmentClass(slide.alignment)} text-white`}>
          <AnimatedSection animation="fade-up" delay={300}>
            <span className="inline-block px-3 py-1 bg-deep-ocean/80 backdrop-blur-sm text-white text-xs font-medium rounded-full mb-4">
              🌊 AquaLearn
            </span>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={500}>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4 drop-shadow-lg">
              {slide.title}
            </h1>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={700}>
            <p className={`text-lg md:text-xl text-white/90 max-w-2xl ${getTextAlignment(slide.alignment)} ${slide.alignment === 'center' ? 'mx-auto' : ''} drop-shadow-md mb-8`}>
              {slide.subtitle}
            </p>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={900}>
            <Link
              to={isAuthenticated ? slide.ctaLink : '/register'}
              className={`inline-block bg-clear-teal text-white px-8 py-3 rounded-brand font-medium hover:bg-clear-teal/90 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                slide.alignment === 'right' ? 'ml-auto' : slide.alignment === 'center' ? 'mx-auto' : ''
              }`}
            >
              {isAuthenticated ? slide.cta : 'Get Started Free'}
            </Link>
          </AnimatedSection>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? 'w-10 h-2.5 bg-clear-teal'
                : 'w-2.5 h-2.5 bg-white/60 hover:bg-white/90'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute bottom-8 right-8 text-white/60 text-sm font-mono z-10">
        {String(currentSlide + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
      </div>

      {/* Previous/Next Buttons */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 flex items-center justify-center"
        aria-label="Previous slide"
      >
        ←
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 flex items-center justify-center"
        aria-label="Next slide"
      >
        →
      </button>

      {/* Auto-play indicator */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1 z-10">
        {heroSlides.map((_, index) => (
          <div
            key={index}
            className={`h-0.5 rounded-full transition-all duration-500 ${
              index === currentSlide 
                ? 'w-8 bg-clear-teal' 
                : 'w-4 bg-white/30'
            }`}
            style={{
              animation: index === currentSlide && autoPlay 
                ? 'slideProgress 5s linear' 
                : 'none'
            }}
          />
        ))}
      </div>

      {/* Add keyframe animation for progress bar */}
      <style jsx>{`
        @keyframes slideProgress {
          0% { width: 0; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default HeroCarousel;