import React from 'react';
import { Logo } from '../../atoms/Logo';
import { Button } from '../../atoms/Button';
import { SearchInput } from '../../atoms/SearchInput';

interface NavHeaderProps {
  className?: string;
}

export const NavHeader: React.FC<NavHeaderProps> = ({ className = '' }) => {
  const handleSearch = (value: string) => {
    console.log('Searching for:', value);
    // Implementasi pencarian nanti
  };

  const handleLogoClick = () => {
    console.log('Logo clicked - redirect to home');
    // Redirect ke home page nanti
  };

  return (
    <div className={`bg-white border-b border-naramakna-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo size="xl" onClick={handleLogoClick} />
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <SearchInput 
              placeholder="Cari di sini..."
              onSearch={handleSearch}
              className="w-full"
            />
          </div>

          {/* Action Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" size="sm">
              Masuk
            </Button>
            <Button variant="primary" size="sm">
              Buat Tulisan
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-naramakna-gray-700 hover:text-naramakna-gold hover:bg-naramakna-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-naramakna-gold"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 