import React from 'react';
import { SocialButton } from '../../atoms/SocialButton/SocialButton';

interface LoginOAuthSectionProps {
  onGoogleClick: () => void;
  className?: string;
}

export const LoginOAuthSection: React.FC<LoginOAuthSectionProps> = ({
  onGoogleClick,
  className = ""
}) => {
  return (
    <div className={`mt-6 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-gray-50 px-2 text-gray-500">Atau lanjutkan dengan</span>
        </div>
      </div>

      <div className="mt-6">
        <SocialButton
          provider="google"
          onClick={onGoogleClick}
        >
          Masuk dengan Google
        </SocialButton>
      </div>
    </div>
  );
}; 