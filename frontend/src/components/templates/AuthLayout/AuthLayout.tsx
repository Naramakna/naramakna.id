import React from 'react';
import { NavHeader } from '../../molecules/NavHeader';

interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Navigation Header */}
      <NavHeader />

      {/* Main Content */}
      <div className="flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
};
