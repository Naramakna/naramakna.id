// src/components/ui/Logo/Logo.tsx
import React from 'react';

export interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  alt?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  width = 180,
  height = 60,
  alt = 'Naramakna Logo',
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Logo Image - akan diganti dengan LogoNaramakna.png */}
      <img
        src="/LogoNaramakna.png"
        alt={alt}
        width={width}
        height={height}
        className="object-contain"
        onError={(e) => {
          // Fallback jika logo belum ada
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.nextElementSibling?.classList.remove('hidden');
        }}
      />
      
      {/* Fallback text logo */}
      <div className="hidden">
        <span className="text-2xl font-bold text-black">nara</span>
        <span className="text-2xl font-bold text-[#db9942]">makna</span>
      </div>
    </div>
  );
};

export default Logo;