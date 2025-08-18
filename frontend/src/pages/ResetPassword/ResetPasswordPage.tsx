import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/organisms/Navbar';
import { AlertMessage } from '../../components/atoms/AlertMessage';
import { FormField } from '../../components/molecules/FormField';
import { authAPI } from '../../services/api/auth';

const ResetPasswordPage: React.FC = () => {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      // Redirect back to forgot password if no token
      window.location.href = '/forgot-password';
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak sama');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.resetPassword(token, newPassword);
      
      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message || 'Reset password gagal');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="mt-4 text-2xl font-bold text-gray-900">
                Password Berhasil Direset
              </h2>
              
              <p className="mt-2 text-sm text-gray-600">
                Password Anda telah berhasil diubah. Anda sekarang dapat masuk dengan password baru.
              </p>
            </div>

            <div>
              <a
                href="/login"
                className="group relative flex w-full justify-center rounded-lg border border-transparent bg-yellow-500 py-2 px-4 text-sm font-medium text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors"
              >
                Masuk Sekarang
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              Reset Password
            </h2>
            <p className="mt-2 text-sm text-gray-600 text-center">
              Masukkan password baru Anda
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormField
              id="newPassword"
              name="newPassword"
              label="Password Baru"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Masukkan password baru"
              required
              autoComplete="new-password"
            />

            <FormField
              id="confirmPassword"
              name="confirmPassword"
              label="Konfirmasi Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
              required
              autoComplete="new-password"
            />

            {error && (
              <AlertMessage type="error" message={error} />
            )}

            <div className="text-xs text-gray-500">
              Password minimal 6 karakter
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !newPassword || !confirmPassword}
                className="group relative flex w-full justify-center rounded-lg border border-transparent bg-yellow-500 py-2 px-4 text-sm font-medium text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {loading ? 'Mereset...' : 'Reset Password'}
              </button>
            </div>

            <div className="text-center">
              <a
                href="/forgot-password"
                className="text-sm text-gray-600 hover:text-yellow-500"
              >
                ← Kembali ke halaman lupa password
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;