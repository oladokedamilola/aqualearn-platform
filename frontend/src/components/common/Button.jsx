import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  className = '',
  type = 'button',
  ...props
}) => {
  const variants = {
    primary: 'bg-deep-ocean text-white hover:bg-deep-ocean/90 shadow-md hover:shadow-lg',
    secondary: 'bg-white text-deep-ocean border-2 border-deep-ocean hover:bg-deep-ocean/5',
    success: 'bg-clear-teal text-white hover:bg-clear-teal/90 shadow-md hover:shadow-lg',
    accent: 'bg-coral-orange text-white hover:bg-coral-orange/90 shadow-md hover:shadow-lg',
    outline: 'bg-transparent text-deep-ocean border-2 border-deep-ocean hover:bg-deep-ocean/5',
    ghost: 'bg-transparent text-deep-ocean hover:bg-deep-ocean/5',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-brand font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
        variants[variant]
      } ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${
        disabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''
      } ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;