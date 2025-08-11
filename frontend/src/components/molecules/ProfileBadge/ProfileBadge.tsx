import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

// Helper function to get full image URL
const getImageUrl = (imagePath: string | null) => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  
  // If it's a relative path starting with /uploads, prepend backend URL
  if (imagePath.startsWith('/uploads/')) {
    return `http://localhost:3001${imagePath}`;
  }
  
  // Otherwise, assume it's a relative path and prepend backend URL
  return `http://localhost:3001/uploads/${imagePath}`;
};

interface ProfileBadgeProps {
  className?: string;
}

export const ProfileBadge: React.FC<ProfileBadgeProps> = ({ className = '' }) => {
  const { user, logout, checkProfileCompletion, canApplyForWriter } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'user': return 'User';
      case 'writer': return 'Writer';
      case 'admin': return 'Admin';
      case 'superadmin': return 'Super Admin';
      default: return 'User';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'user': return 'bg-gray-100 text-gray-800';
      case 'writer': return 'bg-blue-100 text-blue-800';
      case 'admin': return 'bg-green-100 text-green-800';
      case 'superadmin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isProfileComplete = checkProfileCompletion();
  const canApplyWriter = canApplyForWriter();

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Profile Badge Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {/* Avatar */}
        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {user.profile_image ? (
            <img 
              src={getImageUrl(user.profile_image) || ''} 
              alt={user.display_name}
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                console.log('ProfileBadge image failed to load:', user.profile_image);
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            getInitials(user.display_name)
          )}
        </div>
        
        {/* Name & Role */}
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-900">
            {user.display_name}
          </div>
          <div className="text-xs text-gray-500">
            {getRoleDisplayName(user.user_role)}
          </div>
        </div>

        {/* Dropdown Arrow */}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Profile Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white font-medium">
                {user.profile_image ? (
                  <img 
                    src={getImageUrl(user.profile_image) || ''} 
                    alt={user.display_name}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      console.log('ProfileBadge dropdown image failed to load:', user.profile_image);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  getInitials(user.display_name)
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{user.display_name}</div>
                <div className="text-sm text-gray-500">{user.user_email}</div>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.user_role)}`}>
                    {getRoleDisplayName(user.user_role)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Completion Status */}
          {user.user_role === 'user' && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">Kelengkapan Profil</div>
                  <div className="text-xs text-gray-500">
                    {isProfileComplete ? 'Lengkap' : 'Belum lengkap - Tambahkan bio'}
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${isProfileComplete ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
              
              {canApplyWriter && (
                <div className="mt-2">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      window.location.href = '/profile/edit?apply=writer';
                    }}
                    className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition-colors"
                  >
                    Daftar Jadi Penulis
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Menu Items */}
          <div className="py-2">
            <a
              href={`/${user.user_login}`}
              onClick={() => setIsDropdownOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Lihat Profil</span>
              </div>
            </a>

            {(user.user_role === 'writer' || user.user_role === 'admin' || user.user_role === 'superadmin') && (
              <a
                href={`/${user.user_role}/dashboard`}
                onClick={() => setIsDropdownOpen(false)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Dashboard</span>
                </div>
              </a>
            )}

            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Keluar</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
