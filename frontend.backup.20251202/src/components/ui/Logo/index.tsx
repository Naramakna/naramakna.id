// src/components/ui/Logo/index.tsx
import React from 'react';

const Logo: React.FC = () => (
  <div className="flex items-center">
    <img 
      src="/LogoNaramakna.png" 
      alt="Naramakna" 
      className="h-8 w-auto"
    />
  </div>
);

export default Logo;