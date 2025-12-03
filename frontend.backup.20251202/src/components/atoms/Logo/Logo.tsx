import React from 'react';
import LogoImage from '../../../assets/LogoNaramakna.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
  onClick,
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 md:h-10 w-auto';
      case 'md':
        return 'h-10 md:h-12 w-auto';
      case 'lg':
        return 'h-12 md:h-16 w-auto';
      case 'xl':
        return 'h-16 md:h-20 w-auto';
      case '2xl':
        return 'h-20 md:h-24 w-auto';
      default:
        return 'h-10 md:h-12 w-auto';
    }
  };

  return (
    <div 
      className={`flex items-center cursor-pointer ${className}`}
      onClick={onClick}
    >
      <img
        src={LogoImage}
        alt="Naramakna"
        className={`${getSizeClasses()} object-contain`}
      />
    </div>
  );
};