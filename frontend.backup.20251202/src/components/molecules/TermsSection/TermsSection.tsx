import React from 'react';

interface TermsSectionProps {
  className?: string;
}

export const TermsSection: React.FC<TermsSectionProps> = ({ className = "" }) => {
  return (
    <div className={`text-center text-xs text-gray-500 ${className}`}>
      Dengan mendaftar, Anda menyetujui{' '}
      <a 
        href="/terms" 
        className="text-yellow-500 hover:text-yellow-600 underline"
      >
        Syarat & Ketentuan
      </a>{' '}
      dan{' '}
      <a 
        href="/privacy" 
        className="text-yellow-500 hover:text-yellow-600 underline"
      >
        Kebijakan Privasi
      </a>{' '}
      kami.
    </div>
  );
}; 