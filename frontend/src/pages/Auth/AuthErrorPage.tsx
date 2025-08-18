import React from 'react';

const AuthErrorPage: React.FC = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const errorMessage = urlParams.get('message') || 'Terjadi kesalahan saat login dengan Google';

  const handleRetry = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Login Gagal
          </h1>
          
          <p className="text-gray-600 mb-6">
            {errorMessage}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Coba Lagi
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthErrorPage;