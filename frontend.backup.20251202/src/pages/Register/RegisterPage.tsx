import React from 'react';
import { Navbar } from '../../components/organisms/Navbar';
import { RegisterForm } from '../../components/organisms/RegisterForm';

const RegisterPage: React.FC = () => {
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
              Daftar Akun Baru
            </h2>
            <p className="mt-2 text-sm text-gray-600 text-center">
              Atau{' '}
              <a 
                href="/login" 
                className="font-medium text-yellow-500 hover:text-yellow-600 underline"
              >
                masuk ke akun yang sudah ada
              </a>
            </p>
          </div>

          {/* Form */}
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;