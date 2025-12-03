// frontend/src/components/layouts/MainLayout/MainLayout.tsx
import React from 'react';
import { NavbarSection } from '../../sections/NavbarSection';

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
      {showFooter && (
        <footer className="bg-gray-800 text-white p-4 text-center">
          <p>&copy; 2024 PT Solusi Komunikasi Terapan. All rights reserved.</p>
        </footer>
      )}
    </div>
  );
};

export default MainLayout;