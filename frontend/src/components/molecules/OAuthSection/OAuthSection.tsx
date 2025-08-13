import React from 'react';
import { SocialButton } from '../../atoms/SocialButton';

interface OAuthSectionProps {
  onGoogleClick: () => void;
  onFacebookClick?: () => void;
  onTwitterClick?: () => void;
  className?: string;
}

export const OAuthSection: React.FC<OAuthSectionProps> = ({
  onGoogleClick,
  onFacebookClick,
  onTwitterClick,
  className = ""
}) => {
  return (
    <div className={`mt-6 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-gray-50 px-2 text-gray-500">Atau daftar dengan</span>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <SocialButton
          provider="google"
          onClick={onGoogleClick}
        >
          Daftar dengan Google
        </SocialButton>

        {onFacebookClick && (
          <SocialButton
            provider="facebook"
            onClick={onFacebookClick}
          >
            Daftar dengan Facebook
          </SocialButton>
        )}

        {onTwitterClick && (
          <SocialButton
            provider="twitter"
            onClick={onTwitterClick}
          >
            Daftar dengan Twitter
          </SocialButton>
        )}
      </div>
    </div>
  );
}; 