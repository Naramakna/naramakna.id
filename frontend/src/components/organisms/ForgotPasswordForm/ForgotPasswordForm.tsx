import React, { useState } from 'react';
import { FormField } from '../../molecules/FormField';
import { BackToLoginSection } from '../../molecules/BackToLoginSection';
import { AlertMessage } from '../../atoms/AlertMessage';
import { authAPI } from '../../../services/api/auth';

interface ForgotPasswordFormProps {
  className?: string;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ className = "" }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.requestPasswordReset(email);
      
      if (response.success) {
        setSuccess(true);
        setEmail('');
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`space-y-4 ${className}`}>
        <AlertMessage 
          type="success" 
          message="Email terkirim! Link reset password telah dikirim ke email Anda. Silakan cek inbox atau folder spam." 
        />
        <BackToLoginSection />
      </div>
    );
  }

  return (
    <form className={`space-y-4 ${className}`} onSubmit={handleSubmit}>
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
          {loading ? 'Mengirim...' : 'Kirim Link Reset'}
        </button>
      </div>

      <BackToLoginSection />
    </form>
  );
}; 