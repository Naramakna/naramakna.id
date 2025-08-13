import React, { useState } from 'react';
import { FormField } from '../../molecules/FormField';
import { PasswordField } from '../../molecules/PasswordField';
import { RememberMeSection } from '../../molecules/RememberMeSection';
import { LoginOAuthSection } from '../../molecules/LoginOAuthSection';
import { AlertMessage } from '../../atoms/AlertMessage';
import { authAPI } from '../../../services/api/auth';
import { useAuth } from '../../../contexts/AuthContext';

interface LoginFormProps {
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ className = "" }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login({
        identifier: email,
        user_pass: password,
        remember_me: rememberMe
      });

      if (response.success && response.data) {
        // Use AuthContext to manage login state
        login(response.data.user, response.data.token);
        
        // Redirect to home
        window.location.href = '/';
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.message || 'Email atau password salah. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Implement Google OAuth
    console.log('Google login clicked');
    setError('Fitur Google OAuth belum tersedia');
  };

  return (
    <form className={`space-y-4 ${className}`} onSubmit={handleSubmit}>
      <div className="space-y-4">
        <FormField
          id="email"
          name="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Masukkan email Anda"
          required
          autoComplete="email"
        />

        <PasswordField
          id="password"
          name="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Masukkan password Anda"
          required
          autoComplete="current-password"
        />
      </div>

      <RememberMeSection
        rememberMe={rememberMe}
        onRememberMeChange={setRememberMe}
      />

      {error && (
        <AlertMessage type="error" message={error} />
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="group relative flex w-full justify-center rounded-lg border border-transparent bg-yellow-500 py-2 px-4 text-sm font-medium text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : null}
          {loading ? 'Memproses...' : 'Masuk'}
        </button>
      </div>

      <LoginOAuthSection onGoogleClick={handleGoogleLogin} />
    </form>
  );
}; 