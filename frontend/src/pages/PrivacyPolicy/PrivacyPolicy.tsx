import React from 'react';
import { Navbar } from '../../components/organisms/Navbar';
import { Footer } from '../../components/organisms/Footer';
import { useSEO } from '../../hooks/useSEO';

export const PrivacyPolicy: React.FC = () => {
  useSEO({
    title: 'Kebijakan Privasi | Naramakna',
    description: 'Kebijakan privasi dan perlindungan data pengguna portal berita Naramakna.id. Transparansi penggunaan data dan hak pengguna.',
    keywords: ['kebijakan privasi', 'privacy policy', 'perlindungan data', 'naramakna'],
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
              Kebijakan Privasi Naramakna
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
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Pendahuluan</h2>
              <p className="text-gray-700 mb-4">
                Naramakna.id ("kami", "kita", atau "Naramakna") menghormati privasi pengguna dan berkomitmen 
                untuk melindungi data pribadi Anda. Kebijakan privasi ini menjelaskan bagaimana kami 
                mengumpulkan, menggunakan, menyimpan, dan melindungi informasi Anda ketika menggunakan 
                layanan portal berita kami.
              </p>
              <p className="text-gray-700 mb-4">
                Dengan menggunakan website Naramakna.id, Anda menyetujui pengumpulan dan penggunaan 
                informasi sesuai dengan kebijakan ini.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Informasi yang Kami Kumpulkan</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Informasi yang Anda Berikan</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Data registrasi akun (nama, email, kata sandi)</li>
                <li>Informasi profil yang Anda tambahkan secara sukarela</li>
                <li>Komentar dan interaksi di platform</li>
                <li>Pesan atau komunikasi yang Anda kirim kepada kami</li>
                <li>Data langganan newsletter atau notifikasi</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Informasi yang Dikumpulkan Otomatis</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Alamat IP dan lokasi geografis umum</li>
                <li>Informasi perangkat (jenis perangkat, sistem operasi, browser)</li>
                <li>Data penggunaan (halaman yang dikunjungi, waktu kunjungan, durasi)</li>
                <li>Cookies dan teknologi pelacakan serupa</li>
                <li>Referrer URL (dari mana Anda mengakses website kami)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Informasi dari Pihak Ketiga</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Data dari login media sosial (jika Anda memilih untuk login via sosial media)</li>
                <li>Informasi dari layanan analitik (Google Analytics)</li>
                <li>Data dari platform periklanan untuk targeting yang relevan</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Bagaimana Kami Menggunakan Informasi</h2>
              <p className="text-gray-700 mb-4">
                Kami menggunakan informasi yang dikumpulkan untuk tujuan berikut:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Menyediakan dan meningkatkan layanan berita dan konten</li>
                <li>Personalisasi konten dan rekomendasi artikel</li>
                <li>Mengelola akun pengguna dan autentikasi</li>
                <li>Memungkinkan fitur interaktif (komentar, like, share)</li>
                <li>Mengirim newsletter dan notifikasi yang relevan</li>
                <li>Analisis penggunaan untuk pengembangan platform</li>
                <li>Keamanan dan pencegahan penyalahgunaan</li>
                <li>Kepatuhan terhadap kewajiban hukum</li>
                <li>Komunikasi layanan pelanggan</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Pembagian Informasi</h2>
              <p className="text-gray-700 mb-4">
                Kami tidak menjual data pribadi Anda kepada pihak ketiga. Namun, kami dapat membagikan 
                informasi dalam situasi berikut:
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Penyedia Layanan</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Layanan hosting dan infrastruktur cloud</li>
                <li>Platform analitik (Google Analytics)</li>
                <li>Layanan email dan notifikasi</li>
                <li>Sistem keamanan dan monitoring</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Kewajiban Hukum</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Permintaan resmi dari penegak hukum</li>
                <li>Kepatuhan terhadap perintah pengadilan</li>
                <li>Perlindungan hak, properti, atau keselamatan</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 Dengan Persetujuan</h3>
              <p className="text-gray-700 mb-4">
                Pembagian data lainnya hanya dilakukan dengan persetujuan eksplisit dari Anda.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cookies dan Teknologi Pelacakan</h2>
              <p className="text-gray-700 mb-4">
                Kami menggunakan cookies dan teknologi serupa untuk:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Cookies Esensial:</strong> Untuk fungsi dasar website dan keamanan</li>
                <li><strong>Cookies Analitik:</strong> Untuk memahami penggunaan dan kinerja website</li>
                <li><strong>Cookies Personalisasi:</strong> Untuk menyimpan preferensi Anda</li>
                <li><strong>Cookies Iklan:</strong> Untuk menampilkan iklan yang relevan</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Anda dapat mengatur preferensi cookies melalui pengaturan browser Anda. Namun, 
                menonaktifkan cookies tertentu dapat memengaruhi fungsionalitas website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Keamanan Data</h2>
              <p className="text-gray-700 mb-4">
                Kami menerapkan langkah-langkah keamanan teknis dan organisasi untuk melindungi 
                data Anda, termasuk:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Enkripsi data sensitif (HTTPS/SSL)</li>
                <li>Kontrol akses terbatas ke data pribadi</li>
                <li>Monitoring keamanan sistem secara berkala</li>
                <li>Backup data reguler dan recovery plan</li>
                <li>Pelatihan privasi untuk tim internal</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Meskipun demikian, tidak ada sistem yang 100% aman. Kami mendorong Anda untuk 
                menjaga kerahasiaan informasi akun Anda.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Hak Pengguna</h2>
              <p className="text-gray-700 mb-4">
                Sesuai dengan peraturan perlindungan data yang berlaku, Anda memiliki hak:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Akses:</strong> Meminta salinan data pribadi yang kami simpan</li>
                <li><strong>Pembetulan:</strong> Memperbaiki data yang tidak akurat atau tidak lengkap</li>
                <li><strong>Penghapusan:</strong> Meminta penghapusan data pribadi Anda</li>
                <li><strong>Portabilitas:</strong> Meminta data dalam format yang dapat dipindahkan</li>
                <li><strong>Pembatasan:</strong> Membatasi pemrosesan data pribadi Anda</li>
                <li><strong>Keberatan:</strong> Menolak pemrosesan untuk tujuan tertentu</li>
                <li><strong>Penarikan Persetujuan:</strong> Mencabut persetujuan yang telah diberikan</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Untuk menggunakan hak-hak ini, silakan hubungi kami melalui privacy@naramakna.id
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Retensi Data</h2>
              <p className="text-gray-700 mb-4">
                Kami menyimpan data pribadi Anda selama diperlukan untuk:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Penyediaan layanan yang Anda gunakan</li>
                <li>Kepatuhan terhadap kewajiban hukum</li>
                <li>Penyelesaian sengketa dan penegakan perjanjian</li>
                <li>Tujuan arsip, penelitian, atau statistik yang sah</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Secara umum, data akun disimpan selama akun aktif dan hingga 2 tahun setelah 
                penghapusan akun untuk tujuan backup dan keamanan.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Transfer Data Internasional</h2>
              <p className="text-gray-700 mb-4">
                Beberapa penyedia layanan kami dapat beroperasi di luar Indonesia. Dalam kasus 
                transfer data internasional, kami memastikan tingkat perlindungan yang memadai 
                melalui:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Klausul kontraktual standar</li>
                <li>Sertifikasi keamanan internasional</li>
                <li>Kepatuhan terhadap framework privasi yang diakui</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Privasi Anak</h2>
              <p className="text-gray-700 mb-4">
                Layanan kami tidak ditujukan untuk anak di bawah 13 tahun. Kami tidak sengaja 
                mengumpulkan informasi pribadi dari anak di bawah 13 tahun. Jika Anda mengetahui 
                bahwa anak Anda telah memberikan informasi pribadi kepada kami, silakan hubungi 
                kami untuk penghapusan.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Perubahan Kebijakan</h2>
              <p className="text-gray-700 mb-4">
                Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Perubahan 
                material akan diberitahukan melalui:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Pemberitahuan di website</li>
                <li>Email notifikasi (untuk perubahan signifikan)</li>
                <li>Pembaruan tanggal "terakhir diperbarui"</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Penggunaan berkelanjutan setelah perubahan dianggap sebagai persetujuan terhadap 
                kebijakan yang diperbarui.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Kontak</h2>
              <p className="text-gray-700 mb-4">
                Jika Anda memiliki pertanyaan, kekhawatiran, atau permintaan terkait privasi, 
                silakan hubungi kami:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Tim Privasi Naramakna</strong></p>
                <p className="text-gray-700">Email: privacy@naramakna.id</p>
                <p className="text-gray-700">Email alternatif: legal@naramakna.id</p>
                <p className="text-gray-700">Website: naramakna.id</p>
                <p className="text-gray-700 mt-2">
                  <em>Kami akan merespons pertanyaan privasi dalam 30 hari kerja.</em>
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Dasar Hukum</h2>
              <p className="text-gray-700 mb-4">
                Kebijakan privasi ini disusun berdasarkan:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Undang-Undang No. 19 Tahun 2016 tentang Perubahan atas UU ITE</li>
                <li>Peraturan Menteri Komunikasi dan Informatika</li>
                <li>Standar internasional perlindungan data (GDPR sebagai referensi)</li>
                <li>Kode etik jurnalistik dan media digital Indonesia</li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;