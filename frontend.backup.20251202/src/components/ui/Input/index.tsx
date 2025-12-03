// src/components/ui/Input/index.tsx
import React from 'react';
import { Search, X } from 'lucide-react';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'search';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  icon?: 'search' | 'none';
  onClear?: () => void;
  showClearButton?: boolean;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  icon = 'none',
  onClear,
  showClearButton = false
}) => {
  const baseClasses = "w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors";
  
  return (
    <div className="relative">
      {icon === 'search' && (
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`${baseClasses} ${icon === 'search' ? 'pl-10' : ''} ${
          showClearButton && value ? 'pr-10' : ''
        } ${className}`}
      />
      {showClearButton && value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Input;