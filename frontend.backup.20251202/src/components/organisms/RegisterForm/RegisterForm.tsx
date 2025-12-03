import React, { useState } from 'react';
import { FormField } from '../../molecules/FormField';
import { PasswordField } from '../../molecules/PasswordField/PasswordField';
import { AlertMessage } from '../../atoms/AlertMessage/AlertMessage';
import { OAuthSection } from '../../molecules/OAuthSection/OAuthSection';
import { TermsSection } from '../../molecules/TermsSection/TermsSection';
import { authAPI } from '../../../services/api/auth';

interface RegisterFormProps {
  className?: string;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ className = "" }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'Nama lengkap harus diisi';
    }
    if (!formData.email.trim()) {
      return 'Email harus diisi';
    }
    if (!formData.password) {
      return 'Password harus diisi';
    }
    if (formData.password.length < 6) {
      return 'Password minimal 6 karakter';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Password tidak cocok';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.register({
        user_login: formData.name.toLowerCase().replace(/\s+/g, ''),
        user_email: formData.email,
        user_pass: formData.password,
        display_name: formData.name,
        role_request: 'user'
      });

      if (response.success) {
        setSuccess(response.message || 'Akun berhasil dibuat! Silakan login.');
        // Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(response.message || 'Gagal membuat akun');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    // Implement Google OAuth
    console.log('Google register clicked');
    setError('Fitur Google OAuth belum tersedia');
  };

  const handleFacebookRegister = () => {
    // Implement Facebook OAuth
    console.log('Facebook register clicked');
    setError('Fitur Facebook OAuth belum tersedia');
  };

  return (
    <form className={`space-y-4 ${className}`} onSubmit={handleSubmit}>
      <div className="space-y-4">
        <FormField
          id="name"
          name="name"
          label="Nama Lengkap"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="Masukkan nama lengkap Anda"
          required
          autoComplete="name"
        />

        <FormField
          id="email"
          name="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Masukkan email Anda"
          required
          autoComplete="email"
        />

        <PasswordField
          id="password"
          name="password"
          label="Password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Minimal 6 karakter"
          required
          autoComplete="new-password"
        />

        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          label="Konfirmasi Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Ulangi password Anda"
          required
          autoComplete="new-password"
        />
      </div>

      {error && (
        <AlertMessage type="error" message={error} />
      )}

      {success && (
        <AlertMessage type="success" message={success} />
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
          {loading ? 'Memproses...' : 'Daftar'}
        </button>
      </div>

      <OAuthSection
        onGoogleClick={handleGoogleRegister}
        onFacebookClick={handleFacebookRegister}
      />

      <TermsSection />
    </form>
  );
}; 