import React from 'react';

interface BackToLoginSectionProps {
  className?: string;
}

export const BackToLoginSection: React.FC<BackToLoginSectionProps> = ({
  className = ""
}) => {
  return (
    <div className={`text-center ${className}`}>
      <a
        href="/login"
        className="font-medium text-yellow-500 hover:text-yellow-600"
      >
        Kembali ke Login
      </a>
    </div>
  );
}; 