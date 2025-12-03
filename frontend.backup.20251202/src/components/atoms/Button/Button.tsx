// frontend/src/components/atoms/Button/Button.tsx
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  type = 'button',
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-naramakna-gold hover:bg-yellow-600 text-white font-medium';
      case 'secondary':
        return 'bg-naramakna-gray-600 hover:bg-naramakna-gray-700 text-white font-medium';
      case 'outline':
        return 'border-2 border-naramakna-gold text-naramakna-gold hover:bg-naramakna-gold hover:text-white font-medium';
      case 'ghost':
        return 'text-naramakna-gray-700 hover:bg-naramakna-gray-100 font-medium';
      default:
        return 'bg-naramakna-gold hover:bg-yellow-600 text-white font-medium';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-4 py-2 text-base';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${getVariantClasses()}
        ${getSizeClasses()}
        rounded-lg transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-naramakna-gold focus:ring-opacity-50
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `.trim()}
    >
      {children}
    </button>
  );
};