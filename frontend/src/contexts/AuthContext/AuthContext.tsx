import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '../../services/api/auth';
import type { ProfileResponse } from '../../services/api/auth';
import { buildApiUrl } from '../../config/api';

interface User {
  ID: number;
  user_login: string;
  user_email: string;
  display_name: string;
  user_role: string;
  user_status: number;
  email_verified: boolean;
  bio?: string;
  user_url?: string;
  profile_image?: string;
  profile?: {
    birth_date?: string;
    gender?: string;
    phone_number?: string;
    city?: string;
    profession?: string;
    address?: string;
    province?: string;
    postal_code?: string;
    country?: string;
    company?: string;
    education?: string;
    facebook_url?: string;
    twitter_url?: string;
    instagram_url?: string;
    linkedin_url?: string;
    tiktok_url?: string;
    writer_category?: string;
    writing_experience?: string;
    portfolio_url?: string;
    show_email?: boolean;
    show_phone?: boolean;
    show_address?: boolean;
    show_birth_date?: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userData: User, token?: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  checkProfileCompletion: () => boolean;
  canApplyForWriter: () => boolean;
  loginWithGoogle: () => Promise<void>;
  redirectToProfileIfIncomplete: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Load user from localStorage and verify with server
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check localStorage first
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 Loaded user from localStorage:', userData.user_login);
          }
        }

        // Verify with server (optional - don't logout on failure)
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 Verifying user session with server...');
        }
        try {
          await refreshUser();
        } catch (refreshError: any) {
          if (process.env.NODE_ENV === 'development') {
            console.log('⚠️ Session refresh failed, keeping local session:', refreshError.message);
          }
          // Keep user logged in with localStorage data
        }
      } catch (error: any) {
        if (process.env.NODE_ENV === 'development') {
          console.log('❌ No valid session found:', error.message);
        }
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setIsLoading(false);
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Auth initialization complete');
        }
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = (userData: User, token?: string) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('token', token);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 AuthContext: Calling authAPI.logout()...');
      }
      await authAPI.logout();
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ AuthContext: API logout successful');
      }
    } catch (error) {
      console.error('❌ AuthContext: Logout API error:', error);
    } finally {
      if (process.env.NODE_ENV === 'development') {
        console.log('🧹 AuthContext: Cleaning up local data...');
      }
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ AuthContext: Local data cleaned');
      }
    }
  };

  // Update user data
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  // Refresh user data from server
  const refreshUser = async () => {
    try {
      // First try to get extended profile data
      const profileResponse = await fetch(buildApiUrl('profile'), {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (process.env.NODE_ENV === 'development') {
          console.log('📡 Profile response:', profileData);
        }
        
        if (profileData.success && profileData.data) {
          const userData = profileData.data.user;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Extended profile loaded:', userData.user_login);
          }
          return;
        }
      }

      // Fallback to basic auth profile
      const response: ProfileResponse = await authAPI.getProfile();
      if (process.env.NODE_ENV === 'development') {
        console.log('📡 Auth response:', response);
      }
      
      if (response.success && response.data) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Basic profile loaded:', userData.user_login);
        }
      } else {
        throw new Error('Invalid server response');
      }
    } catch (error: any) {
      console.error('❌ Failed to refresh user:', error.message);
      
      // If it's just a 401/403, don't clear localStorage immediately
      // User might be using a saved session
      if (!error.message.includes('401') && !error.message.includes('403')) {
        setUser(null);
        localStorage.removeItem('user');
      }
      throw error;
    }
  };

  // Check if profile is complete for writer application
  const checkProfileCompletion = (): boolean => {
    if (!user) return false;
    
    const requiredFields = [
      user.display_name,
      user.user_email,
      user.bio
    ];

    return requiredFields.every(field => field && field.trim().length > 0);
  };

  // Check if user can apply for writer role
  const canApplyForWriter = (): boolean => {
    if (!user) return false;
    
    return (
      user.user_role === 'user' && // Must be regular user
      user.user_status === 1 && // Account must be active
      user.email_verified && // Email must be verified
      checkProfileCompletion() // Profile must be complete
    );
  };

  // Google OAuth login
  const loginWithGoogle = async (): Promise<void> => {
    try {
      // Get Google OAuth URL from backend
      const response = await fetch(buildApiUrl('auth/google'));
      const data = await response.json();
      
      if (data.success && data.data.auth_url) {
        // Redirect to Google OAuth
        window.location.href = data.data.auth_url;
      } else {
        throw new Error('Failed to get Google OAuth URL');
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  // Redirect to profile page if incomplete
  const redirectToProfileIfIncomplete = (): boolean => {
    if (!user || !isAuthenticated) return false;
    
    if (!checkProfileCompletion()) {
      // Store the intended destination 
      const currentPath = window.location.pathname;
      // Don't redirect if already on profile pages, login, register, auth pages, or admin pages
      const allowedPaths = ['/profile', '/profile/edit', '/login', '/register', '/auth/success', '/auth/error', '/admin', '/superadmin'];
      const isAllowedPath = allowedPaths.some(path => currentPath.startsWith(path));
      
      if (!isAllowedPath) {
        localStorage.setItem('redirect_after_profile', currentPath);
        window.location.href = '/profile?incomplete=true';
        return true;
      }
    }
    return false;
  };

  // Auto-redirect effect for incomplete profiles
  useEffect(() => {
    if (user && isAuthenticated && !isLoading) {
      redirectToProfileIfIncomplete();
    }
  }, [user, isAuthenticated, isLoading]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    refreshUser,
    checkProfileCompletion,
    canApplyForWriter,
    loginWithGoogle,
    redirectToProfileIfIncomplete
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
