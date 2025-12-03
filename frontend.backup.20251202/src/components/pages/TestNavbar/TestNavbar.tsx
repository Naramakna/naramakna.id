import React from 'react';
import { Navbar } from '../../organisms/Navbar';

export const TestNavbar: React.FC = () => {
  return (
    <div className="min-h-screen bg-naramakna-gray-100">
      <Navbar />
      
      {/* Content untuk test navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-naramakna-gray-900 mb-6">
            Selamat Datang di Naramakna
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-naramakna-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-naramakna-gray-900 mb-3">
                Berita Terkini
              </h3>
              <p className="text-naramakna-gray-600">
                Dapatkan informasi berita terbaru dan terpercaya dari berbagai sumber.
              </p>
            </div>
            
            <div className="bg-naramakna-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-naramakna-gray-900 mb-3">
                Entertainment
              </h3>
              <p className="text-naramakna-gray-600">
                Hiburan terkini dari dunia selebriti, film, musik, dan lifestyle.
              </p>
            </div>
            
            <div className="bg-naramakna-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-naramakna-gray-900 mb-3">
                Teknologi
              </h3>
              <p className="text-naramakna-gray-600">
                Perkembangan teknologi terbaru dan inovasi yang mengubah dunia.
              </p>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-naramakna-gold/10 rounded-lg border border-naramakna-gold/20">
            <h2 className="text-xl font-semibold text-naramakna-gray-900 mb-3">
              PT Solusi Komunikasi Terapan
            </h2>
            <p className="text-naramakna-gray-700">
              Memberikan solusi komunikasi terdepan dengan menyajikan informasi berkualitas 
              dan terpercaya untuk masyarakat Indonesia.
            </p>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-naramakna-gray-600">
              Test halaman untuk melihat navbar Naramakna. 
              Coba scroll untuk melihat sticky navbar dan test responsive di mobile.
            </p>
          </div>
          
          {/* Content untuk test scroll */}
          <div className="mt-16 space-y-8">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="bg-white border border-naramakna-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-naramakna-gray-900 mb-3">
                  Artikel Contoh {item}
                </h3>
                <p className="text-naramakna-gray-600 mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
                  tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim 
                  veniam, quis nostrud exercitation ullamco laboris.
                </p>
                <p className="text-naramakna-gray-600">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum 
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non 
                  proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};