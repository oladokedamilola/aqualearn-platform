import React, { useState, useEffect } from 'react';

const PreloaderClean = ({ minDisplayTime = 4000 }) => {
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
        setTimeout(() => {
          setLoading(false);
        }, 300);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, minDisplayTime + 2000);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      clearTimeout(safetyTimeout);
    };
  }, [minDisplayTime, startTime]);

  if (!loading) return null;

  const dots = 6;
  const colors = ['#0A3D62', '#1A5A8A', '#0088A8', '#00A890', '#00B894', '#0A3D62'];

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-sea-foam">
      {/* Logo */}
      <div className="text-6xl md:text-7xl mb-6 animate-bounce-slow">🐟</div>
      
      <h1 className="text-3xl md:text-4xl font-bold text-deep-ocean mb-2">
        AquaLearn
      </h1>
      <p className="text-dark-navy/40 text-sm mb-10">Loading your learning experience...</p>

      {/* Rolling Dots Circle */}
      <div className="relative w-40 h-40 md:w-48 md:h-48">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-deep-ocean/10"></div>
        
        {/* Rotating dots */}
        <div className="absolute inset-0 animate-spin-slow">
          {[...Array(dots)].map((_, index) => {
            const angle = (index / dots) * 2 * Math.PI - Math.PI / 2;
            const radius = 50;
            const x = 50 + radius * Math.cos(angle);
            const y = 50 + radius * Math.sin(angle);
            const size = 8 + (index % 3) * 3;
            
            return (
              <div
                key={index}
                className="absolute rounded-full transition-all duration-300"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  backgroundColor: colors[index % colors.length],
                  transform: 'translate(-50%, -50%)',
                  opacity: 0.5 + (index / dots) * 0.5,
                  animation: `dotPulse ${1.5 + index * 0.2}s ease-in-out infinite alternate`,
                  animationDelay: `${index * 0.15}s`,
                }}
              />
            );
          })}
        </div>

        {/* Center logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-deep-ocean to-clear-teal flex items-center justify-center shadow-lg">
            <span className="text-white text-sm md:text-base font-bold">AL</span>
          </div>
        </div>

        {/* Inner decorative rings */}
        <div className="absolute inset-[15%] rounded-full border border-deep-ocean/5 animate-spin-reverse-slow"></div>
        <div className="absolute inset-[30%] rounded-full border border-deep-ocean/5"></div>
      </div>

      {/* Progress */}
      <div className="mt-10 w-48">
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-deep-ocean to-clear-teal rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-center mt-2 text-xs text-dark-navy/30 font-mono">
          {Math.round(progress)}%
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes spin-reverse-slow {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes dotPulse {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.4; }
          100% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
        }
        
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
        
        .animate-spin-reverse-slow {
          animation: spin-reverse-slow 3s linear infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default PreloaderClean;