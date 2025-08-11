// Authentication API service
import { buildApiUrl } from '../../config/api';

export interface LoginRequest {
  identifier: string; // email or username
  user_pass: string;
  remember_me?: boolean;
}

export interface RegisterRequest {
  user_login: string;
  user_email: string;
  user_pass: string;
  display_name?: string;
  role_request?: 'user' | 'writer';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      ID: number;
      user_login: string;
      user_email: string;
      display_name: string;
      user_role: string;
      user_status: number;
      email_verified: boolean;
    };
    token: string;
    requires_approval?: boolean;
  };
}

export interface ProfileResponse {
  success: boolean;
  data?: {
    user: {
      ID: number;
      user_login: string;
      user_email: string;
      display_name: string;
      user_role: string;
      user_status: number;
      email_verified: boolean;
      bio?: string;
      user_url?: string;
    };
  };
}

class AuthAPI {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(buildApiUrl('auth/login'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }

  /**
   * Register new user
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(buildApiUrl('auth/register'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(buildApiUrl('auth/logout'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Logout failed');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<ProfileResponse> {
    try {
      const response = await fetch(buildApiUrl('auth/profile'), {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get profile');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get profile');
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(buildApiUrl('auth/request-reset'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_email: email })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Password reset request failed');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Password reset request failed');
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(buildApiUrl('auth/reset-password'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, new_password: newPassword })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Password reset failed');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Password reset failed');
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: {
    display_name?: string;
    user_email?: string;
    bio?: string;
    current_password?: string;
    new_password?: string;
  }): Promise<{ success: boolean; message: string; data?: { user: any } }> {
    try {
      const response = await fetch(buildApiUrl('auth/profile'), {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Profile update failed');
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(error.message || 'Profile update failed');
    }
  }
}

// Create singleton instance
export const authAPI = new AuthAPI();