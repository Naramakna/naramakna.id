import React, { useState } from 'react';
import { Logo } from '../../atoms/Logo/Logo';
import SearchBlock from '../../blocks/SearchBlock';
import { NavKategori } from '../../molecules/NavKategori/NavKategori';
import { NavService } from '../../molecules/NavService/NavService';
import { ProfileBadge } from '../../molecules/ProfileBadge';
import { useAuth } from '../../../contexts/AuthContext';

// Simplified Navbar component for debugging
export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const { isAuthenticated, isLoading, user } = useAuth();

  const handleSearch = (value: string) => {
    console.log('Searching for:', value);
    setIsSearchModalOpen(false);
  };

  return (
    <>
      {/* Complete Navbar with Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        {/* Top Navbar */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo - Responsive */}
              <div className="flex-shrink-0">
                <a href="/" className="flex items-center">
                  <Logo size="lg" />
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
          /* Show ProfileBadge and "Buat Tulisan" button when authenticated */
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

        {/* Categories Navigation */}
        <NavKategori />

        {/* Services Navigation */}
        <NavService />

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}></div>
            
            {/* Sidebar Menu */}
            <div className="absolute right-0 top-0 h-full w-1/2 bg-white shadow-lg">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Menu</h3>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Menu Items */}
                <div className="flex-1 px-4 py-2 space-y-1">
                  <a href="/" className="block px-3 py-3 text-sm font-medium text-gray-700 hover:text-yellow-500 hover:bg-gray-100 rounded-md transition-colors duration-200">
                    Beranda
                  </a>
                  
                  {/* Conditional mobile menu items */}
                  {isAuthenticated ? (
                    <>
                      <a href="/tulis" className="block px-3 py-3 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded-md transition-colors duration-200 mb-2">
                        Buat Tulisan
                      </a>
                      <a href={user?.user_login ? `/${user.user_login}` : '/profile'} className="block px-3 py-3 text-sm font-medium text-gray-700 hover:text-yellow-500 hover:bg-gray-100 rounded-md transition-colors duration-200">
                        Profil Saya
                      </a>
                      <a href="/dashboard" className="block px-3 py-3 text-sm font-medium text-gray-700 hover:text-yellow-500 hover:bg-gray-100 rounded-md transition-colors duration-200">
                        Dashboard
                      </a>
                    </>
                  ) : (
                    <>
                      <a href="/login" className="block px-3 py-3 text-sm font-medium text-gray-700 hover:text-yellow-500 hover:bg-gray-100 rounded-md transition-colors duration-200">
                        Masuk
                      </a>
                      <a href="/tulis" className="block px-3 py-3 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded-md transition-colors duration-200">
                        Buat Tulisan
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Search Modal */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsSearchModalOpen(false)}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-md bg-white rounded-lg shadow-xl">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Cari</h3>
                <button 
                  onClick={() => setIsSearchModalOpen(false)}
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari di sini..."
                  className="w-full px-4 py-3 pl-10 pr-4 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch((e.target as HTMLInputElement).value);
                    }
                  }}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};