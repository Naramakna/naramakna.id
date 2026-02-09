import React, { useEffect } from 'react';
import { Navbar } from '../../components/organisms/Navbar';
import { LoginForm } from '../../components/organisms/LoginForm/LoginForm';
import { useAuth } from '../../contexts/AuthContext/AuthContext';

const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Redirect to /superadmin/dashboard if user is already logged in
    if (!isLoading && isAuthenticated) {
      window.location.href = '/superadmin/dashboard';
    }
  }, [isAuthenticated, isLoading]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // Don't render login page if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <div className="flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              Masuk ke Akun Anda
            </h2>
            <p className="mt-2 text-sm text-gray-600 text-center">
              Atau{' '}
              <a
                href="/register"
                className="font-medium text-yellow-500 hover:text-yellow-600 underline"
              >
                daftar akun baru
              </a>
            </p>
          </div>

          {/* Form */}
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;