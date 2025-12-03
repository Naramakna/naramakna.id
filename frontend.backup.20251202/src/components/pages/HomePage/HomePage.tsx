// frontend/src/components/pages/HomePage/HomePage.tsx
import React from 'react';
import MainLayout from '../../layouts/MainLayout';

const HomePage: React.FC = () => {
  return (
    <MainLayout>
      {/* Hero Section - Fixed Width & Padding */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 lg:py-24 xl:py-32 w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-6 lg:mb-8">
              <span className="text-black">nara</span>
              <span className="text-[#19b3a6]">makna</span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-gray-600 mb-8 lg:mb-10 max-w-4xl mx-auto leading-relaxed">
              Bicara Fakta Lewat Berita - Platform berita terpercaya dari PT Solusi Komunikasi Terapan
            </p>
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center">
              <button className="bg-[#19b3a6] text-white px-8 lg:px-12 py-4 lg:py-5 rounded-lg font-medium hover:bg-[#17a398] transition-colors text-base lg:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Baca Berita Terbaru
              </button>
              <button className="border-2 border-gray-300 text-gray-700 px-8 lg:px-12 py-4 lg:py-5 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all text-base lg:text-lg">
                Tentang Kami
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Content - Fixed Width & Padding */}
      <section className="py-16 lg:py-24 xl:py-32 bg-white w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 lg:mb-6">
              Navbar Naramakna Demo
            </h2>
            <p className="text-lg lg:text-xl xl:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Navbar telah dibangun menggunakan Atomic Design pattern dengan komponen yang responsif dan mudah dikustomisasi
            </p>
          </div>

          {/* Fitur Navbar - Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-10 mb-16 lg:mb-20">
            <div className="text-center p-8 lg:p-10 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-5xl lg:text-6xl mb-4 lg:mb-6">🎨</div>
              <h3 className="text-xl lg:text-2xl xl:text-3xl font-semibold text-gray-900 mb-3 lg:mb-4">Atomic Design</h3>
              <p className="text-base lg:text-lg xl:text-xl text-gray-600 leading-relaxed">Struktur komponen terorganisir: Atoms, Molecules, Organisms</p>
            </div>
            
            <div className="text-center p-8 lg:p-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-5xl lg:text-6xl mb-4 lg:mb-6">📱</div>
              <h3 className="text-xl lg:text-2xl xl:text-3xl font-semibold text-gray-900 mb-3 lg:mb-4">Responsif</h3>
              <p className="text-base lg:text-lg xl:text-xl text-gray-600 leading-relaxed">Mobile-first untuk semua ukuran layar: 14", 17", 24", 27", tablet, mobile</p>
            </div>
            
            <div className="text-center p-8 lg:p-10 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-sm hover:shadow-md transition-shadow md:col-span-2 xl:col-span-1">
              <div className="text-5xl lg:text-6xl mb-4 lg:mb-6">🔍</div>
              <h3 className="text-xl lg:text-2xl xl:text-3xl font-semibold text-gray-900 mb-3 lg:mb-4">Search Ready</h3>
              <p className="text-base lg:text-lg xl:text-xl text-gray-600 leading-relaxed">Search bar terintegrasi dengan UI yang clean dan modern</p>
            </div>
          </div>

          {/* Call to Action */}
                      <div className="bg-gradient-to-r from-[#19b3a6] to-[#17a398] rounded-2xl p-8 lg:p-12 text-center text-white shadow-lg">
            <h3 className="text-2xl lg:text-3xl xl:text-4xl font-bold mb-4 lg:mb-6">
              Siap Menampilkan Berita Terpercaya
            </h3>
            <p className="text-lg lg:text-xl xl:text-2xl mb-6 lg:mb-8 opacity-90 max-w-2xl mx-auto">
              Dengan foundation yang kuat, Naramakna siap menyajikan informasi berkualitas untuk masyarakat Indonesia
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-[#19b3a6] px-8 lg:px-10 py-3 lg:py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-base lg:text-lg shadow-md">
                Mulai Membaca
              </button>
              <button className="border-2 border-white text-white px-8 lg:px-10 py-3 lg:py-4 rounded-lg font-semibold hover:bg-white hover:text-[#19b3a6] transition-colors text-base lg:text-lg">
                Pelajari Lebih Lanjut
              </button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default HomePage;