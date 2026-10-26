import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = true,
}) => {
  const heightClasses = {
    sm: 'h-6 sm:h-8',
    md: 'h-10 sm:h-11',
    lg: 'h-12 sm:h-16',
  };

  return (
    <Link to="/" className={`inline-flex items-center gap-2 group ${className}`}>
      {/* Official Shop Logo Image */}
      <img
        src="/like-clothing-logo.jpg"
        alt="LIKE CLOTHING - Update Your Fashion"
        className={`${heightClasses[size]} w-auto object-contain rounded-md transition-transform duration-300 group-hover:scale-105`}
        onError={(e) => {
          // If image fails, fallback to stylish text logo
          const target = e.currentTarget;
          target.style.display = 'none';
        }}
      />
      {/* Slogan Text for SEO & Accessibility */}
      {showTagline && (
        <span className="sr-only">LIKE CLOTHING - Update Your Fashion (喜欢)</span>
      )}
    </Link>
  );
};
