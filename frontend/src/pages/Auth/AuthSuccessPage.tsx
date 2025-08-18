import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AuthSuccessPage: React.FC = () => {
  const { refreshUser } = useAuth();

  useEffect(() => {
    // Refresh user data after successful OAuth
    const handleSuccess = async () => {
      try {
        await refreshUser();
        // Redirect to dashboard or home
        setTimeout(() => {
          window.location.href = '/user/dashboard';
        }, 2000);
      } catch (error) {
        console.error('Failed to refresh user:', error);
        // Still redirect but user might need to login again
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      }
    };

    handleSuccess();
  }, [refreshUser]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Login Berhasil!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Anda berhasil masuk dengan akun Google. Tunggu sebentar, kami akan mengalihkan Anda ke dashboard.
          </p>
          
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            <span className="ml-3 text-sm text-gray-500">Memuat...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSuccessPage;