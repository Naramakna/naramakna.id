import React, { useState } from 'react';
import { Navbar } from '../../components/organisms/Navbar';
import { AdSection } from '../../components/organisms/AdSection/AdSection';
import { Footer } from '../../components/organisms/Footer';

import { HelpCategories } from '../../components/organisms/HelpCategories';
import { FAQSection } from '../../components/organisms/FAQSection';
import { ContactSupportSection } from '../../components/organisms/ContactSupportSection';

export const Help: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('umum');

  const helpCategories = [
    { 
      id: 'umum', 
      name: 'Pertanyaan Umum', 
      type: 'umum' as const
    },
    { 
      id: 'akun', 
      name: 'Akun & Login', 
      type: 'akun' as const
    },
    { 
      id: 'artikel', 
      name: 'Artikel & Konten', 
      type: 'artikel' as const
    },
    { 
      id: 'teknis', 
      name: 'Masalah Teknis', 
      type: 'teknis' as const
    }
  ];

  const faqData = {
    umum: [
      {
        question: 'Apa itu Naramakna.id?',
        answer: 'Naramakna.id adalah platform media digital yang menyajikan konten berkualitas dengan tagline "Cerdas Memaknai". Kami fokus pada jurnalisme data yang humanis dan konten yang mendalam.'
      },
      {
        question: 'Bagaimana cara menggunakan platform ini?',
        answer: 'Anda bisa membaca artikel, berpartisipasi dalam polling, menonton video story, dan berinteraksi dengan konten lainnya. Untuk fitur lengkap, daftar dan login ke akun Anda.'
      },
      {
        question: 'Apakah konten di sini gratis?',
        answer: 'Ya, semua konten di Naramakna.id dapat diakses secara gratis. Kami berkomitmen memberikan informasi berkualitas tanpa biaya kepada pembaca.'
      }
    ],
    akun: [
      {
        question: 'Bagaimana cara mendaftar akun?',
        answer: 'Klik tombol "Daftar" di pojok kanan atas, isi form registrasi dengan data lengkap, verifikasi email yang dikirim, dan login dengan akun yang sudah dibuat.'
      },
      {
        question: 'Lupa password, bagaimana?',
        answer: 'Klik "Lupa Password" di halaman login, masukkan email yang terdaftar, dan ikuti instruksi reset password yang dikirim ke email Anda.'
      },
      {
        question: 'Bisa ganti email yang terdaftar?',
        answer: 'Ya, Anda bisa mengubah email di pengaturan profil. Pastikan email baru aktif dan belum terdaftar di platform lain.'
      }
    ],
    artikel: [
      {
        question: 'Bagaimana cara menulis artikel?',
        answer: 'Setelah login, klik "Tulis Artikel" di dashboard, pilih kategori yang sesuai, tulis konten, upload gambar pendukung, dan submit untuk review admin.'
      },
      {
        question: 'Berapa lama artikel dipublish?',
        answer: 'Proses review artikel biasanya memakan waktu 24-48 jam kerja. Tim admin akan review kualitas konten dan memberikan feedback jika diperlukan.'
      },
      {
        question: 'Bisa edit artikel yang sudah dipublish?',
        answer: 'Ya, Anda bisa mengedit artikel yang sudah dipublish melalui dashboard penulis. Perubahan akan direview ulang sebelum dipublish.'
      }
    ],
    teknis: [
      {
        question: 'Website tidak bisa diakses, kenapa?',
        answer: 'Cek koneksi internet Anda, clear cache browser, atau coba akses dari browser lain. Jika masih bermasalah, hubungi tim support kami.'
      },
      {
        question: 'Gambar tidak muncul, bagaimana?',
        answer: 'Pastikan koneksi internet stabil, refresh halaman, atau coba akses dari device lain. Jika masalah berlanjut, laporkan ke tim support.'
      },
      {
        question: 'Aplikasi mobile tidak berfungsi?',
        answer: 'Update aplikasi ke versi terbaru, restart aplikasi, atau reinstall jika diperlukan. Pastikan device Anda mendukung versi aplikasi.'
      }
    ]
  };

  const contactMethods = [
    {
      name: 'WhatsApp',
      description: 'Hubungi tim support langsung via WhatsApp',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>
      ),
      link: 'https://wa.me/628979132802',
      color: 'from-green-500 to-green-600'
    },
    {
      name: 'Email',
      description: 'Kirim email ke tim support kami',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      link: 'mailto:redaksi@naramakna.id',
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Instagram',
      description: 'DM kami di Instagram untuk bantuan',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      link: 'https://www.instagram.com/naramakna.id',
      color: 'from-pink-500 to-purple-600'
    },
    {
      name: 'Facebook',
      description: 'Hubungi kami melalui Facebook',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      link: 'https://www.facebook.com/naramakna.id',
      color: 'from-blue-600 to-blue-700'
    }
  ];

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const currentCategory = helpCategories.find(cat => cat.id === activeCategory);
  const currentFAQs = faqData[activeCategory as keyof typeof faqData];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      {/* Navbar */}
      <Navbar />
      
      {/* Header Ad Section */}
      <AdSection />
      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-100 to-transparent opacity-30 rounded-full blur-3xl"></div>
          <div className="relative">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-1 bg-orange-400 rounded-full"></div>
              <div className="w-8 h-1 bg-orange-500 mx-2 rounded-full"></div>
              <div className="w-4 h-1 bg-orange-600 rounded-full"></div>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 to-orange-800 bg-clip-text text-transparent mb-4">
              Pusat Bantuan
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Temukan jawaban untuk pertanyaan Anda atau hubungi tim support kami yang siap membantu
            </p>
          </div>
        </div>

        {/* Help Categories & FAQ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Categories */}
          <div className="lg:col-span-1">
            <HelpCategories
              categories={helpCategories}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>

          {/* Right Column - FAQ Content */}
          <div className="lg:col-span-2">
            {currentCategory && currentFAQs && (
              <FAQSection
                title={currentCategory.name}
                description={`Temukan jawaban untuk pertanyaan seputar ${currentCategory.name.toLowerCase()}`}
                faqs={currentFAQs}
              />
            )}
          </div>
        </div>

        {/* Contact Support */}
        <ContactSupportSection
          title="Masih Butuh Bantuan?"
          description="Tim support kami siap membantu menyelesaikan masalah Anda"
          contactMethods={contactMethods}
        />
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};