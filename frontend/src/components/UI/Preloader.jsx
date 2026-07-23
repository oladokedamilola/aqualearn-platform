import React, { useState, useEffect } from 'react';

const Preloader = ({ minDisplayTime = 4000 }) => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    let animationFrame;
    let safetyTimeout;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / minDisplayTime) * 100, 100);
      setProgress(newProgress);

      if (newProgress < 100) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        // Ensure minimum display time
        setTimeout(() => {
          setLoading(false);
        }, 300);
      }
    };

    // Start animation
    animationFrame = requestAnimationFrame(animate);

    // Safety timeout - force hide after max 6 seconds
    safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, minDisplayTime + 2000);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      clearTimeout(safetyTimeout);
    };
  }, [minDisplayTime, startTime]);

  if (!loading) return null;

  // Generate dots for rolling animation (5 dots)
  const dots = 5;
  const dotRadius = 30;
  const centerX = 60;
  const centerY = 60;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-sea-foam via-white to-sea-foam">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-deep-ocean/5 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-clear-teal/5 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-deep-ocean/5"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-deep-ocean/5"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-deep-ocean/5"></div>
      </div>

      {/* Logo with Pulsing Effect */}
      <div className="relative mb-8 z-10">
        <div className="text-7xl md:text-8xl animate-bounce-slow">🐟</div>
        <div className="absolute inset-0 rounded-full bg-deep-ocean/5 animate-ping-slow"></div>
        <div className="absolute -inset-4 rounded-full bg-deep-ocean/5 animate-pulse-slow"></div>
        <div className="absolute -inset-8 rounded-full bg-clear-teal/5 animate-pulse-slow-delay"></div>
      </div>

      {/* Brand Name */}
      <div className="relative z-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-deep-ocean via-clear-teal to-deep-ocean bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
          AquaLearn
        </h1>
        <p className="text-dark-navy/50 text-sm mt-2 font-light tracking-wider">
          Learn aquaculture. Grow your future.
        </p>
      </div>

      {/* Rolling Dots Circle */}
      <div className="relative z-10 mt-12">
        <div className="relative w-32 h-32 md:w-40 md:h-40">
          {/* Outer ring glow */}
          <div className="absolute inset-0 rounded-full border-2 border-deep-ocean/10 animate-spin-slow"></div>
          <div className="absolute inset-[6px] rounded-full border border-deep-ocean/5"></div>
          
          {/* Rolling dots - SVG based for smooth animation */}
          <svg
            className="w-full h-full animate-spin-slow"
            viewBox="0 0 120 120"
          >
            {[...Array(dots)].map((_, index) => {
              const angle = (index / dots) * 2 * Math.PI - Math.PI / 2;
              const radius = 35;
              const x = 60 + radius * Math.cos(angle);
              const y = 60 + radius * Math.sin(angle);
              const size = 10 + (index % 2) * 4;
              const opacity = 0.5 + (index / dots) * 0.5;
              
              // Color variation: deep-ocean to clear-teal gradient
              const colors = ['#0A3D62', '#1A5A8A', '#0088A8', '#00A890', '#00B894'];
              const color = colors[index % colors.length];
              
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r={size / 2}
                  fill={color}
                  opacity={opacity}
                  className="transition-all duration-300"
                  style={{
                    animation: `dotPulse ${1.5 + index * 0.2}s ease-in-out infinite alternate`,
                    animationDelay: `${index * 0.15}s`,
                  }}
                />
              );
            })}
          </svg>

          {/* Center dot with AquaLearn branding */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-deep-ocean to-clear-teal flex items-center justify-center shadow-lg shadow-deep-ocean/20 animate-pulse-slow">
              <span className="text-white text-xs md:text-sm font-bold">AL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 mt-8 w-64">
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-deep-ocean via-clear-teal to-deep-ocean rounded-full bg-[length:200%_100%] animate-shimmer"
            style={{ 
              width: `${progress}%`,
              transition: 'width 0.3s ease-out'
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-dark-navy/30 font-mono">
          <span>Loading</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Loading Message with animated dots */}
      <div className="relative z-10 mt-4 flex items-center gap-1 text-dark-navy/40 text-sm font-light">
        <span>Preparing your learning experience</span>
        <span className="inline-flex gap-1">
          <span className="animate-bounce-dot" style={{ animationDelay: '0ms' }}>.</span>
          <span className="animate-bounce-dot" style={{ animationDelay: '200ms' }}>.</span>
          <span className="animate-bounce-dot" style={{ animationDelay: '400ms' }}>.</span>
        </span>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes spin-reverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.6; }
          100% { transform: scale(1); opacity: 0.3; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.2); opacity: 0.3; }
        }
        
        @keyframes pulse-slow-delay {
          0%, 100% { transform: scale(1); opacity: 0.1; }
          50% { transform: scale(1.3); opacity: 0.2; }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes dotPulse {
          0% { r: 4px; opacity: 0.4; }
          100% { r: 8px; opacity: 1; }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes bounce-dot {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
        
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
        
        .animate-reverse-slow {
          animation: spin-reverse 3s linear infinite;
        }
        
        .animate-ping-slow {
          animation: ping-slow 2s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        
        .animate-pulse-slow-delay {
          animation: pulse-slow-delay 2.5s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 1.5s linear infinite;
        }
        
        .animate-bounce-dot {
          animation: bounce-dot 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Preloader;