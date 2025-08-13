import React, { useState } from 'react';
import { Logo } from '../../atoms/Logo';
import SearchBlock from '../../blocks/SearchBlock';
import { ProfileBadge } from '../../molecules/ProfileBadge';

interface NavHeaderProps {
  className?: string;
}

export const NavHeader: React.FC<NavHeaderProps> = ({ className = '' }) => {
  // Temporary authentication state - replace with actual useAuth hook later
  const isAuthenticated = false;
  const isLoading = false;
  
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={`bg-white border-b border-gray-200 sticky top-0 z-50 ${className}`}>
      {/* Top Navbar */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Responsive */}
            <div className="flex-shrink-0">
              <a href="/" className="flex items-center">
                <Logo size="md" />
              </a>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <SearchBlock />
            </div>

            {/* Action Buttons - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              
              {/* Show loading state */}
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="w-20 h-8 bg-gray-200 rounded-lg"></div>
                </div>
              ) : isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <ProfileBadge />
                  <a
                    href="/tulis"
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-all duration-200 text-sm"
                  >
                    Buat Tulisan
                  </a>
                </div>
              ) : (
                /* Show login/register buttons when not authenticated */
                <>
                  <a 
                    href="/login"
                    className="px-4 py-2 border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white font-medium rounded-lg transition-all duration-200"
                  >
                    Masuk
                  </a>
                  <a 
                    href="/tulis"
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-all duration-200"
                  >
                    Buat Tulisan
                  </a>
                </>
              )}
            </div>

            {/* Mobile Action Buttons */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Mobile Search Button */}
              <button 
                onClick={() => setIsSearchModalOpen(true)}
                className="p-2 text-gray-700 hover:text-yellow-500 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Mobile menu button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-yellow-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-yellow-500"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {/* Mobile Search */}
            <div className="px-3 py-2">
              <SearchBlock />
            </div>
            
            {/* Mobile Navigation Items */}
            {isAuthenticated ? (
              <div className="space-y-2">
                <a
                  href="/profile"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-yellow-500 hover:bg-gray-50 rounded-md"
                >
                  Profil Saya
                </a>
                <a
                  href="/tulis"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-yellow-500 hover:bg-gray-50 rounded-md"
                >
                  Buat Tulisan
                </a>
                <a
                  href="/logout"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-red-500 hover:bg-gray-50 rounded-md"
                >
                  Keluar
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                <a
                  href="/login"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-yellow-500 hover:bg-gray-50 rounded-md"
                >
                  Masuk
                </a>
                <a
                  href="/register"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-yellow-500 hover:bg-gray-50 rounded-md"
                >
                  Daftar
                </a>
                <a
                  href="/tulis"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-yellow-500 hover:bg-gray-50 rounded-md"
                >
                  Buat Tulisan
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Modal */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-start justify-center min-h-screen pt-16 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsSearchModalOpen(false)}></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <SearchBlock />
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-500 text-base font-medium text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsSearchModalOpen(false)}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 