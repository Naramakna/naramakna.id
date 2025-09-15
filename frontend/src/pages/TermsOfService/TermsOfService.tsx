import React from 'react';
import { Navbar } from '../../components/organisms/Navbar';
import { Footer } from '../../components/organisms/Footer';
import { useSEO } from '../../hooks/useSEO';

export const TermsOfService: React.FC = () => {
  useSEO({
    title: 'Pedoman Media Siber | Naramakna',
    description: 'Syarat dan ketentuan penggunaan portal berita Naramakna.id. Pedoman media siber dan aturan penggunaan platform.',
    keywords: ['pedoman media siber', 'terms of service', 'syarat ketentuan', 'naramakna'],
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    type: 'website'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6 lg:p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Pedoman Media Siber Naramakna
            </h1>
            <p className="text-gray-600">
              Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </header>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Penerimaan Syarat</h2>
              <p className="text-gray-700 mb-4">
                Dengan mengakses dan menggunakan portal berita Naramakna.id, Anda menyetujui untuk terikat 
                oleh syarat dan ketentuan yang ditetapkan dalam pedoman ini. Jika Anda tidak menyetujui 
                syarat-syarat ini, harap tidak menggunakan layanan kami.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Tentang Naramakna</h2>
              <p className="text-gray-700 mb-4">
                Naramakna.id adalah portal berita digital yang menyajikan informasi terkini, artikel 
                jurnalistik, dan konten multimedia. Kami berkomitmen untuk menyajikan berita yang 
                akurat, berimbang, dan independen sesuai dengan kode etik jurnalistik Indonesia.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Hak Cipta dan Kekayaan Intelektual</h2>
              <p className="text-gray-700 mb-4">
                Seluruh konten yang dipublikasikan di Naramakna.id, termasuk namun tidak terbatas pada 
                artikel, foto, video, grafis, dan desain, dilindungi oleh hak cipta dan merupakan 
                kekayaan intelektual Naramakna atau pihak ketiga yang telah memberikan lisensi.
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Dilarang memperbanyak, mendistribusikan, atau menggunakan konten tanpa izin tertulis</li>
                <li>Penggunaan konten untuk keperluan komersial memerlukan lisensi khusus</li>
                <li>Sitasi dan rujukan harus menyertakan sumber yang lengkap</li>
                <li>Fair use berlaku untuk keperluan pendidikan dan kritik yang wajar</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Aturan Pengguna dan Komentar</h2>
              <p className="text-gray-700 mb-4">
                Pengguna yang berpartisipasi dalam platform Naramakna wajib mematuhi aturan berikut:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Tidak menyebarkan konten yang melanggar hukum atau mengandung SARA</li>
                <li>Tidak melakukan spam, trolling, atau cyberbullying</li>
                <li>Menghormati privasi dan hak orang lain</li>
                <li>Tidak menyebarkan hoaks atau informasi yang menyesatkan</li>
                <li>Menggunakan bahasa yang sopan dan konstruktif</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Naramakna berhak menghapus komentar atau menangguhkan akun yang melanggar aturan ini.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Akurasi Informasi dan Koreksi</h2>
              <p className="text-gray-700 mb-4">
                Naramakna berkomitmen menyajikan informasi yang akurat. Namun, kami tidak dapat menjamin 
                keakuratan 100% dari seluruh informasi yang disajikan. Jika Anda menemukan kesalahan 
                informasi, silakan hubungi kami melalui:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Email: koreksi@naramakna.id</li>
                <li>Formulir kontak di website</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Kami akan melakukan verifikasi dan koreksi sesuai dengan standar jurnalistik yang berlaku.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Disclaimer dan Batasan Tanggung Jawab</h2>
              <p className="text-gray-700 mb-4">
                Naramakna menyajikan informasi berdasarkan sumber yang dipercaya. Namun:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Kami tidak bertanggung jawab atas kerugian yang timbul dari penggunaan informasi di website</li>
                <li>Konten opini merupakan pandangan penulis, bukan kebijakan redaksi</li>
                <li>Link eksternal di luar tanggung jawab editorial kami</li>
                <li>Ketersediaan layanan dapat terganggu karena maintenance atau masalah teknis</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Layanan Iklan</h2>
              <p className="text-gray-700 mb-4">
                Naramakna menampilkan iklan untuk mendukung operasional. Konten iklan merupakan 
                tanggung jawab pengiklan dan tidak mencerminkan endorsement dari redaksi. 
                Kami menerapkan standar iklan yang etis dan relevan dengan konten editorial.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Privasi dan Data Pengguna</h2>
              <p className="text-gray-700 mb-4">
                Perlindungan data pengguna merupakan prioritas kami. Detail penggunaan data 
                dijelaskan dalam <a href="/privacy-policy-2/" className="text-blue-600 hover:text-blue-800">
                Kebijakan Privasi</a> yang terpisah.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Perubahan Syarat dan Ketentuan</h2>
              <p className="text-gray-700 mb-4">
                Naramakna berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan 
                diinformasikan melalui website dan berlaku efektif setelah dipublikasikan. 
                Penggunaan berkelanjutan website setelah perubahan dianggap sebagai persetujuan.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Hukum yang Berlaku</h2>
              <p className="text-gray-700 mb-4">
                Syarat dan ketentuan ini diatur oleh hukum Republik Indonesia. Segala sengketa 
                yang timbul akan diselesaikan melalui musyawarah atau melalui pengadilan yang 
                berwenang di Indonesia.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Kontak</h2>
              <p className="text-gray-700 mb-4">
                Untuk pertanyaan mengenai syarat dan ketentuan ini, silakan hubungi:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Naramakna Media</strong></p>
                <p className="text-gray-700">Email: legal@naramakna.id</p>
                <p className="text-gray-700">Website: naramakna.id</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;