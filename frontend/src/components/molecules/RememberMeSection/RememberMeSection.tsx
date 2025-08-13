import React from 'react';
import { CheckboxField } from '../../atoms/CheckboxField/CheckboxField';

interface RememberMeSectionProps {
  rememberMe: boolean;
  onRememberMeChange: (checked: boolean) => void;
  className?: string;
}

export const RememberMeSection: React.FC<RememberMeSectionProps> = ({
  rememberMe,
  onRememberMeChange,
  className = ""
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <CheckboxField
        id="remember-me"
        name="remember-me"
        checked={rememberMe}
        onChange={onRememberMeChange}
        label="Ingat saya"
      />
      
      <div className="text-sm">
        <a 
          href="/forgot-password" 
          className="font-medium text-yellow-500 hover:text-yellow-600"
        >
          Lupa password?
        </a>
      </div>
    </div>
  );
}; 