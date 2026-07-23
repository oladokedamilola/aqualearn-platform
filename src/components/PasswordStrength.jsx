import React, { useRef, useEffect, useState } from 'react';

const PasswordStrength = ({ password, isVisible }) => {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  // Update height when visibility changes
  useEffect(() => {
    if (contentRef.current) {
      const updateHeight = () => {
        if (isVisible) {
          setHeight(contentRef.current.scrollHeight);
        } else {
          setHeight(0);
        }
      };

      requestAnimationFrame(updateHeight);
    }
  }, [isVisible, password]);

  // Calculate password strength
  const calculateStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.match(/[a-z]/)) score++;
    if (pass.match(/[A-Z]/)) score++;
    if (pass.match(/[0-9]/)) score++;
    if (pass.match(/[^a-zA-Z0-9]/)) score++;
    return score;
  };

  const getStrengthLabel = (score) => {
    if (score <= 1) return { label: 'Weak', color: 'text-coral-orange', bg: 'bg-coral-orange' };
    if (score <= 2) return { label: 'Fair', color: 'text-orange-400', bg: 'bg-orange-400' };
    if (score <= 3) return { label: 'Good', color: 'text-yellow-500', bg: 'bg-yellow-500' };
    if (score <= 4) return { label: 'Strong', color: 'text-clear-teal', bg: 'bg-clear-teal' };
    return { label: 'Very Strong', color: 'text-green-500', bg: 'bg-green-500' };
  };

  const score = calculateStrength(password);
  const strength = getStrengthLabel(score);

  const criteria = [
    { 
      id: 'length', 
      label: '8+ characters', 
      met: password.length >= 8
    },
    { 
      id: 'lowercase', 
      label: 'Lowercase', 
      met: /[a-z]/.test(password)
    },
    { 
      id: 'uppercase', 
      label: 'Uppercase', 
      met: /[A-Z]/.test(password)
    },
    { 
      id: 'number', 
      label: 'Number', 
      met: /[0-9]/.test(password)
    },
    { 
      id: 'special', 
      label: 'Special character', 
      met: /[^a-zA-Z0-9]/.test(password)
    },
  ];

  const passedCount = criteria.filter(c => c.met).length;
  const totalCount = criteria.length;
  const progressPercentage = (passedCount / totalCount) * 100;

  return (
    <div 
      className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
      style={{ 
        height: `${height}px`,
        opacity: isVisible ? 1 : 0,
        marginTop: isVisible ? '6px' : '0px',
      }}
    >
      <div ref={contentRef}>
        {/* Compact Strength Bar */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 relative">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${strength.bg}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          <span className={`text-[10px] font-semibold ${strength.color} min-w-[50px] text-right tracking-wide`}>
            {password.length > 0 ? strength.label : ''}
          </span>
        </div>

        {/* Compact Criteria Grid - 2 columns */}
        <div className="grid grid-cols-2 gap-1.5">
          {criteria.map((criterion) => (
            <div
              key={criterion.id}
              className={`
                flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-300
                ${criterion.met 
                  ? 'bg-clear-teal/5 border border-clear-teal/10' 
                  : 'bg-gray-50/50 border border-gray-100'
                }
              `}
              style={{
                transform: isVisible ? 'translateX(0)' : 'translateX(-8px)',
                transitionDelay: `${criteria.indexOf(criterion) * 40}ms`
              }}
            >
              {/* Mini Indicator */}
              <div className={`
                flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300
                ${criterion.met 
                  ? 'bg-clear-teal text-white scale-100' 
                  : 'bg-gray-200 text-gray-400 scale-90'
                }
              `}>
                <span className="text-[8px] font-bold">
                  {criterion.met ? '✓' : '○'}
                </span>
              </div>
              
              {/* Label */}
              <span className={`
                text-[10px] transition-all duration-300
                ${criterion.met 
                  ? 'text-dark-navy font-medium' 
                  : 'text-dark-navy/40'
                }
              `}>
                {criterion.label}
              </span>
            </div>
          ))}
        </div>

        {/* Compact Progress Summary */}
        {password.length > 0 && (
          <div className="mt-1.5 flex items-center justify-between px-0.5">
            <span className="text-[9px] text-dark-navy/40">
              <span className="font-semibold text-deep-ocean">{passedCount}</span>/{totalCount}
            </span>
            <div className="flex gap-1">
              {[...Array(totalCount)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-1 rounded-full transition-all duration-500 ${
                    i < passedCount ? 'bg-clear-teal' : 'bg-gray-200'
                  }`}
                  style={{
                    transitionDelay: `${i * 80}ms`
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordStrength;