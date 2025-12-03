// src/components/ui/IconButton/index.tsx
import React from 'react';

interface IconButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'ghost' | 'outline' | 'solid';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

const IconButton: React.FC<IconButtonProps> = ({
  children,
  onClick,
  variant = 'ghost',
  size = 'md',
  className = '',
  disabled = false
}) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    ghost: "text-gray-600 hover:text-gray-800 hover:bg-gray-100 focus:ring-gray-500",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
    solid: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500"
  };

  const sizes = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
      }`}
    >
      {children}
    </button>
  );
};

export default IconButton;