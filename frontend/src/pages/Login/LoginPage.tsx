import React from 'react';
import { Navbar } from '../../components/organisms/Navbar';
import { LoginForm } from '../../components/organisms/LoginForm/LoginForm';

const LoginPage: React.FC = () => {
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