import React from 'react';
import { Navbar } from '../../components/organisms/Navbar';
import { ForgotPasswordForm } from '../../components/organisms/ForgotPasswordForm';

const ForgotPasswordPage: React.FC = () => {
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
              Lupa Password
            </h2>
            <p className="mt-2 text-sm text-gray-600 text-center">
              Masukkan email Anda untuk menerima link reset password
            </p>
          </div>

          {/* Form */}
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 