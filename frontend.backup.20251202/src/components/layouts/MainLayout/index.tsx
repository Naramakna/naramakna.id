// src/components/layouts/MainLayout/index.tsx
import React from 'react';
import NavbarSection from '../../sections/NavbarSection';
import FooterSection from '../../sections/FooterSection';

interface MainLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  showFooter = false // Disable footer by default
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation */}
      <NavbarSection />
      
      {/* Main Content */}
      <main className="flex-1 bg-white">
        {children}
      </main>
      
      {/* Footer - Disabled for now */}
      {showFooter && <FooterSection />}
    </div>
  );
};

export default MainLayout;