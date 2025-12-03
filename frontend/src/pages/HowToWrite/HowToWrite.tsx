import React, { useState } from 'react';
import { Navbar } from '../../components/organisms/Navbar';
import { AdSection } from '../../components/organisms/AdSection/AdSection';
import { Footer } from '../../components/organisms/Footer';

export const HowToWrite: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: 'Login & Registrasi',
      description: 'Buat akun dan login ke platform Naramakna',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: 'bg-blue-500',
      details: [
        'Klik tombol "Daftar" di pojok kanan atas',
        'Isi form registrasi dengan data lengkap',
        'Verifikasi email yang dikirim',
        'Login dengan akun yang sudah dibuat'
      ]
    },
    {
      id: 2,
      title: 'Lengkapi Profile',
      description: 'Isi data diri dan informasi penulis',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: 'bg-green-500',
      details: [
        'Upload foto profile yang profesional',
        'Isi bio dan deskripsi diri',
        'Pilih kategori penulisan yang diminati',
        'Tambahkan portfolio atau karya sebelumnya'
      ]
    },
    {
      id: 3,
      title: 'Mulai Menulis',
      description: 'Buat artikel pertama dan publish',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      color: 'bg-purple-500',
      details: [
        'Klik tombol "Tulis Artikel" di dashboard',
        'Pilih kategori dan sub-kategori yang sesuai',
        'Tulis artikel dengan format yang baik',
        'Upload gambar pendukung dan submit untuk review'
      ]
    },
        {
      id: 4,
      title: 'Review & Publish',
      description: 'Admin akan review tulisan sebelum publish',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-orange-500',
      details: [
        'Submit artikel untuk review admin',
        'Admin akan check kualitas dan konten',
        'Jika ada revisi, admin akan memberikan feedback',
        'Setelah approved, artikel akan dipublish'
      ]
    }
  ];

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
            <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 to-orange-800 bg-clip-text text-transparent mb-4">
              Cara Menulis di Naramakna
            </h1>
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-1 bg-orange-400 rounded-full"></div>
              <div className="w-8 h-1 bg-orange-500 mx-2 rounded-full"></div>
              <div className="w-4 h-1 bg-orange-600 rounded-full"></div>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ikuti langkah-langkah berikut untuk menjadi penulis di platform media digital terdepan Indonesia
            </p>
          </div>
        </div>

        {/* Steps Navigation */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-4">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`flex items-center space-x-3 px-6 py-3 rounded-full transition-all duration-300 ${
                  activeStep === step.id
                    ? 'bg-orange-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-gray-200'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activeStep === step.id ? 'bg-white text-orange-500' : 'bg-orange-100 text-orange-600'
                }`}>
                  {step.id}
                </div>
                <span className="font-medium">{step.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-12">
          {steps.map((step) => (
            <div key={step.id} className={activeStep === step.id ? 'block' : 'hidden'}>
              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-20 h-20 ${step.color} rounded-full mb-6 shadow-lg`}>
                  {step.icon}
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">{step.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">Langkah-langkah:</h4>
                  <ul className="space-y-3">
                    {step.details.map((detail, index) => (
                      <li key={index} className="flex items-start">
                        <div className={`w-6 h-6 ${step.color.replace('bg-', 'bg-').replace('-500', '-100')} rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0`}>
                          <span className="text-xs font-bold text-gray-700">{index + 1}</span>
                        </div>
                        <span className="text-gray-700 leading-relaxed">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-blue-50 p-6 rounded-xl border border-orange-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Tips & Trik:</h4>
                  <div className="space-y-3 text-sm text-gray-700">
                    {step.id === 1 && (
                      <>
                        <p>• Gunakan email yang aktif dan mudah diakses</p>
                        <p>• Password minimal 8 karakter dengan kombinasi huruf dan angka</p>
                        <p>• Simpan informasi login dengan aman</p>
                      </>
                    )}
                    {step.id === 2 && (
                      <>
                        <p>• Foto profile sebaiknya formal dan profesional</p>
                        <p>• Bio yang menarik dan menjelaskan keahlian</p>
                        <p>• Portfolio menunjukkan kredibilitas penulis</p>
                      </>
                    )}
                    {step.id === 3 && (
                      <>
                        <p>• Proses review biasanya 1-2 hari kerja</p>
                        <p>• Pastikan artikel sesuai dengan guidelines</p>
                        <p>• Jika ada revisi, ikuti feedback dari admin</p>
                      </>
                    )}
                    {step.id === 4 && (
                      <>
                        <p>• Mulai dengan topik yang dikuasai</p>
                        <p>• Gunakan bahasa yang mudah dipahami</p>
                        <p>• Tambahkan gambar yang relevan dan berkualitas</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 rounded-2xl shadow-xl text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10 rounded-2xl"></div>
          <div className="relative">
            <h3 className="text-2xl font-bold mb-4">Siap Menjadi Penulis?</h3>
            <p className="text-lg mb-6 opacity-90">
              Bergabunglah dengan komunitas penulis berkualitas dan bagikan pengetahuan Anda kepada ribuan pembaca
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://wa.me/628979132802"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-orange-600 px-6 py-3 rounded-full font-semibold hover:bg-orange-50 transition-colors duration-300 shadow-lg flex items-center justify-center gap-2"
              >
                Hubungi Kami
              </a>
              <a 
                href="/register"
                className="bg-white text-orange-600 px-8 py-3 rounded-full font-semibold hover:bg-orange-50 transition-colors duration-300 shadow-lg"
              >
                Daftar Sekarang
              </a>
              <a 
                href="/login"
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-orange-600 transition-all duration-300"
              >
                Sudah Punya Akun? Login
              </a>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-8">Pertanyaan Umum</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Berapa lama proses review?</h4>
              <p className="text-gray-600">Proses review artikel biasanya memakan waktu 24-48 jam kerja. Tim admin akan review kualitas konten dan memberikan feedback jika diperlukan.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Apakah ada syarat khusus?</h4>
              <p className="text-gray-600">Tidak ada syarat khusus, yang penting adalah keinginan untuk berbagi pengetahuan dan menulis konten yang berkualitas.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Bisa menulis dalam bahasa apa?</h4>
              <p className="text-gray-600">Saat ini platform mendukung penulisan dalam Bahasa Indonesia dan Bahasa Inggris untuk menjangkau pembaca yang lebih luas.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Bagaimana jika artikel ditolak?</h4>
              <p className="text-gray-600">Jika artikel ditolak, admin akan memberikan feedback dan saran perbaikan. Penulis bisa merevisi dan submit ulang artikel tersebut.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};
