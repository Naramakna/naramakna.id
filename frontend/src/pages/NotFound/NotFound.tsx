import React from 'react';
import { Button } from '../../components/atoms/Button';
import { Footer } from '../../components/organisms/Footer';
import { SEOHead } from '../../components/atoms/SEOHead';

export const NotFound: React.FC = () => {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <>
      <SEOHead 
        title="Halaman Tidak Ditemukan - 404"
        description="Halaman yang Anda cari tidak ditemukan. Kembali ke beranda Naramakna untuk menemukan berita terkini."
        keywords={['404', 'halaman tidak ditemukan', 'naramakna', 'error']}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-2xl mx-auto">
          {/* Logo atau Ilustrasi 404 */}
          <div className="mb-8">
            <div className="text-8xl font-bold text-gray-300 mb-4">
              404
            </div>
            <div className="w-32 h-1 bg-yellow-500 mx-auto rounded-full"></div>
          </div>

          {/* Konten Utama */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Halaman Tidak Ditemukan
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              Maaf, halaman yang Anda cari tidak dapat ditemukan.
            </p>
            <p className="text-gray-500">
              Halaman mungkin telah dipindahkan, dihapus, atau URL yang Anda masukkan salah.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              onClick={handleGoHome}
              variant="primary"
              size="large"
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Kembali ke Beranda
            </Button>
            
            <Button
              onClick={handleGoBack}
              variant="secondary"
              size="large"
              className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke Halaman Sebelumnya
            </Button>
          </div>

          {/* Helpful Links */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Atau coba halaman populer kami:
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              <a 
                href="/kategori/narapandang" 
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Narapandang
              </a>
              <span className="text-gray-300">•</span>
              <a 
                href="/kategori/pelakon" 
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Pelakon
              </a>
              <span className="text-gray-300">•</span>
              <a 
                href="/kategori/laga-gaya" 
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Laga & Gaya
              </a>
              <span className="text-gray-300">•</span>
              <a
                href="/kategori/mata-elang"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Mata Elang
              </a>
              <span className="text-gray-300">•</span>
              <a 
                href="/polling" 
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Polling
              </a>
            </div>
          </div>

        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </>
  );
};
