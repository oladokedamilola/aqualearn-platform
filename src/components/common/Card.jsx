import React from 'react';
import { Link } from 'react-router-dom';

const Card = ({
  children,
  href,
  onClick,
  className = '',
  hover = true,
  padding = 'p-5',
  ...props
}) => {
  const baseClasses = `bg-white rounded-brand-lg shadow-card transition-all duration-300 ${padding} ${
    hover ? 'hover:shadow-card-hover hover:-translate-y-1' : ''
  } ${className}`;

  if (href) {
    return (
      <Link to={href} className={`${baseClasses} block`} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <div className={baseClasses} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

export default Card;