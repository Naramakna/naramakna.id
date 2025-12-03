// src/components/sections/HeroSection/index.tsx
import React from 'react';
import Button from '../../ui/Button';

const HeroSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
          Selamat Datang di <span className="text-blue-600">Naramakna</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Portal berita terpercaya dari PT Solusi Komunikasi Terapan. 
          Dapatkan informasi terkini dengan kualitas jurnalisme terbaik.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="px-8">
            Baca Berita Terkini
          </Button>
          <Button variant="outline" size="lg" className="px-8">
            Tentang Kami
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;