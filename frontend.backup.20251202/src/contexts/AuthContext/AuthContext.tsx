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
    youtube_url?: string;
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
          console.log('🔄 Loaded user from localStorage:', userData.user_login);
        }

        // Verify with server
        console.log('🔄 Verifying user session with server...');
        await refreshUser();
      } catch (error: any) {
        console.log('❌ No valid session found:', error.message);
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setIsLoading(false);
        console.log('✅ Auth initialization complete');
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = (userData: User, token?: string) => {
    // Save token to localStorage if provided
    if (token) {
      localStorage.setItem('token', token);
      console.log('🔧 Token saved to localStorage');
    }
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
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
        console.log('📡 Profile response:', profileData);
        
        if (profileData.success && profileData.data) {
          const userData = profileData.data.user;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('✅ Extended profile loaded:', userData.user_login);
          return;
        }
      }

      // Fallback to basic auth profile
      const response: ProfileResponse = await authAPI.getProfile();
      console.log('📡 Auth response:', response);
      
      if (response.success && response.data) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('✅ Basic profile loaded:', userData.user_login);
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

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    refreshUser,
    checkProfileCompletion,
    canApplyForWriter
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
