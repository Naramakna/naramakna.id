import React, { useState } from 'react';
import { Logo } from '../../atoms/Logo/Logo';
import SearchBlock from '../../blocks/SearchBlock';
import { ProfileBadge } from '../../molecules/ProfileBadge';
import { useAuth } from '../../../contexts/AuthContext';

interface NavHeaderProps {
  className?: string;
}

export const NavHeader: React.FC<NavHeaderProps> = ({ className = '' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  // Get appropriate dashboard URL based on user role
  const getActionButton = () => {
    if (!isAuthenticated) {
      return {
        href: '/tulis',
        text: 'Buat Tulisan'
      };
    }

    switch (user?.user_role) {
      case 'partner_fotografi':
        return {
          href: '/partner-fotografi/dashboard',
          text: 'Tambahkan Foto ke Galeri'
        };
      case 'mata_elang':
        return {
          href: '/mata-elang/dashboard',
          text: 'Kelola Galeri'
        };
      case 'writer':
      case 'admin':
      case 'superadmin':
      default:
        return {
          href: '/tulis',
          text: 'Buat Tulisan'
        };
    }
  };

  const actionButton = getActionButton();
  const getDashboardUrl = () => {
    if (!user) return '/dashboard';

    switch (user.user_role) {
      case 'superadmin':
        return '/superadmin/dashboard';
      case 'admin':
        return '/admin/dashboard';
      case 'writer':
        return '/writer/dashboard';
      case 'mata_elang':
        return '/mata-elang/dashboard';
      default:
        return '/dashboard';
    }
  };

  // Handle logout for mobile menu
  const handleLogout = async () => {
    try {
      // Starting logout process
      await logout();
      // Logout successful, redirecting
      window.location.href = '/';
    } catch (error) {
      console.error('❌ Logout failed:', error);
      // Still redirect even if logout fails
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/';
    }
  };

  return (
    <>
      {/* Top Navbar - Reduced height */}
      <div className={`bg-white ${className}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            {/* Logo - Smaller */}
            <div className="flex-shrink-0">
              <a href="/" className="flex items-center">
                <Logo size="md" />
              </a>
            </div>

            {/* Search Bar - Desktop - Smaller */}
            <div className="hidden md:flex flex-1 max-w-sm mx-6">
              <SearchBlock />
            </div>

            {/* Action Buttons - Desktop - Smaller */}
            <div className="hidden md:flex items-center space-x-3">
              
              {/* Show loading state */}
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="w-16 h-6 bg-gray-200 rounded-lg"></div>
                </div>
                      ) : isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <ProfileBadge />
                  <a
                    href={actionButton.href}
                    className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-all duration-200 text-xs"
                  >
                    {actionButton.text}
                  </a>
                </div>
              ) : (
                /* Show login/register buttons when not authenticated */
                <>
                  <a 
                    href="/login"
                    className="px-3 py-1.5 border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white font-medium rounded-lg transition-all duration-200 text-xs"
                  >
                    Masuk
                  </a>
                  <a
                    href={actionButton.href}
                    className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-all duration-200 text-xs"
                  >
                    {actionButton.text}
                  </a>
                </>
              )}
            </div>

            {/* Mobile Action Buttons */}
            <div className="md:hidden flex items-center space-x-1">
              {/* SearchBlock handles mobile search button */}
              <SearchBlock />
              
              {/* Mobile menu button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-1.5 rounded-md text-gray-700 hover:text-yellow-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-yellow-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Compact */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}></div>
          
          {/* Sidebar Menu - Smaller */}
          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-lg">
            <div className="flex flex-col h-full">
              {/* Header - Compact */}
              <div className="flex items-center justify-between p-3 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">Menu</h3>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Menu Items - Compact */}
              <div className="flex-1 px-3 py-2 space-y-1">
                <a href="/" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-yellow-500 hover:bg-gray-100 rounded-md transition-colors duration-200">
                  Beranda
                </a>
                
                {/* Conditional mobile menu items */}
                {isAuthenticated ? (
                  <>
                    <a href={actionButton.href} className="block px-3 py-2 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded-md transition-colors duration-200 mb-2">
                      {actionButton.text}
                    </a>
                    <a href={user ? `/penulis/${user.user_nicename || user.user_login.replace(/\s+/g, '-').replace(/\./g, '-').toLowerCase()}` : '/profile'} className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-yellow-500 hover:bg-gray-100 rounded-md transition-colors duration-200">
                      Profil Saya
                    </a>
                    <a href={getDashboardUrl()} className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-yellow-500 hover:bg-gray-100 rounded-md transition-colors duration-200">
                      Dashboard
                    </a>
                    <button 
                      onClick={handleLogout} 
                      className="block w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Keluar</span>
                      </div>
                    </button>
                  </>
                ) : (
                  <>
                    <a href="/login" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-yellow-500 hover:bg-gray-100 rounded-md transition-colors duration-200">
                      Masuk
                    </a>
                    <a href={actionButton.href} className="block px-3 py-2 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded-md transition-colors duration-200">
                      {actionButton.text}
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
};
