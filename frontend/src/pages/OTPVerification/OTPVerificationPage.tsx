import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/organisms/Navbar';
import { AlertMessage } from '../../components/atoms/AlertMessage';
import { authAPI } from '../../services/api/auth';

const OTPVerificationPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    } else {
      // Redirect back to forgot password if no email
      window.location.href = '/forgot-password';
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Masukkan kode OTP 6 digit');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.verifyOTP(email, otp);
      
      if (response.success && response.data?.reset_token) {
        // Redirect to reset password page with token
        window.location.href = `/reset-password?token=${response.data.reset_token}`;
      } else {
        setError(response.message || 'Verifikasi OTP gagal');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    setError('');

    try {
      const response = await authAPI.requestPasswordReset(email);
      if (response.success) {
        alert('Kode OTP baru telah dikirim ke email Anda');
      } else {
        setError(response.message || 'Gagal mengirim ulang OTP');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim ulang OTP');
    } finally {
      setResending(false);
    }
  };

  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split('@');
    if (!domain) return email;
    const maskedLocal = localPart.charAt(0) + '*'.repeat(Math.max(0, localPart.length - 2)) + localPart.slice(-1);
    return `${maskedLocal}@${domain}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              Verifikasi Kode OTP
            </h2>
            <p className="mt-2 text-sm text-gray-600 text-center">
              Masukkan kode 6 digit yang telah dikirim ke
            </p>
            <p className="text-sm font-medium text-gray-900 text-center">
              {maskEmail(email)}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Kode OTP
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 text-center text-2xl tracking-widest"
                placeholder="000000"
                required
                autoComplete="one-time-code"
              />
            </div>

            {error && (
              <AlertMessage type="error" message={error} />
            )}

            <div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="group relative flex w-full justify-center rounded-lg border border-transparent bg-yellow-500 py-2 px-4 text-sm font-medium text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {loading ? 'Memverifikasi...' : 'Verifikasi'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Tidak menerima kode?{' '}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resending}
                  className="font-medium text-yellow-600 hover:text-yellow-500 disabled:opacity-50"
                >
                  {resending ? 'Mengirim...' : 'Kirim ulang'}
                </button>
              </p>
            </div>

            <div className="text-center">
              <a
                href="/forgot-password"
                className="text-sm text-gray-600 hover:text-yellow-500"
              >
                ← Kembali ke halaman email
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage;