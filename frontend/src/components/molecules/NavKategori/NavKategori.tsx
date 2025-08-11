import React from 'react';
import { NavDropdown } from '../NavDropdown';

interface NavKategoriProps {
  className?: string;
}

export const NavKategori: React.FC<NavKategoriProps> = ({ className = '' }) => {
  // Kategori utama (sekarang dynamic dari API)
  const categories = [
    'News',
    'Entertainment', 
    'Tekno & Sains',
    'Bisnis',
    'Bola & Sports',
    'Otomotif',
    'Woman',
    'Food & Travel',
    'Mom',
    'Bolanita'
  ];

  // Data untuk dropdown "Lainnya"
  const lainnyaItems = [
    {
      title: 'Video Story',
      description: 'Tonton video berita terkini',
      icon: (
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h1m4 0h1M9 6h6a2 2 0 012 2v8a2 2 0 01-2 2H9a2 2 0 01-2-2V8a2 2 0 012-2z" />
        </svg>
      ),
    },
    {
      title: 'Galeri Foto',
      description: 'Lihat koleksi foto berita',
      icon: (
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Kabar Daerah',
      description: 'Berita dari berbagai daerah',
      icon: (
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      title: 'Polling',
      description: 'Ikuti polling dan survey',
      icon: (
        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-8 h-12 overflow-x-auto scrollbar-hide">
          {categories.map((category, index) => (
            <a
              key={index}
              href={`/kategori/${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              className="text-sm font-medium text-gray-700 hover:text-yellow-500 whitespace-nowrap transition-colors duration-200 flex-shrink-0"
            >
              {category}
            </a>
          ))}
          
          {/* Dropdown untuk "Lainnya" */}
          <NavDropdown
            trigger={
              <div className="flex items-center text-sm font-medium text-gray-700 hover:text-yellow-500 whitespace-nowrap transition-colors duration-200">
                Lainnya 
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            }
            items={lainnyaItems}
          />
        </div>
      </div>
    </div>
  );
}; 