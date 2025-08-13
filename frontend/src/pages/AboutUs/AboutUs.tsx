import React from 'react';
import { Navbar } from '../../components/organisms/Navbar';
import { AdSection } from '../../components/organisms/AdSection/AdSection';
import { Logo } from '../../components/atoms/Logo';

export const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      {/* Navbar */}
      <Navbar />
      
      {/* Header Ad Section */}
      <AdSection />
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-100 to-transparent opacity-30 rounded-full blur-3xl"></div>
          <div className="relative">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-1 bg-orange-400 rounded-full"></div>
              <div className="w-8 h-1 bg-orange-500 mx-2 rounded-full"></div>
              <div className="w-4 h-1 bg-orange-600 rounded-full"></div>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-orange-600 mb-4 tracking-wide text-center">
              <div className="flex justify-center">
                <Logo size="lg" />
              </div>
            </h2>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="space-y-8 text-gray-700 leading-relaxed">
          {/* Introduction */}
          <div className="bg-white/80 backdrop-blur-sm p-10 rounded-2xl shadow-xl border border-orange-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200 to-transparent rounded-full opacity-20 -translate-y-16 translate-x-16"></div>
            <div className="relative">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Siapa Kami?</h3>
              </div>
              
              <p className="text-lg mb-6 text-gray-600 leading-relaxed">
                <span className="font-semibold text-orange-600">Naramakna.id</span> adalah platform media digital yang lahir dari kebutuhan akan ruang dialog yang lebih bermakna di era informasi yang serba cepat. Kami hadir bukan hanya sebagai penyampai berita, melainkan sebagai <span className="bg-orange-100 px-2 py-1 rounded font-medium">katalis perubahan sosial</span> yang mendorong masyarakat untuk berpikir lebih kritis dan mendalam.
              </p>
              
              <p className="text-lg mb-6 text-gray-600 leading-relaxed">
                Di tengah tsunami informasi digital yang sering kali membingungkan, kami berperan sebagai <span className="font-semibold text-blue-600">kompas intelektual</span> yang membantu pembaca menavigasi kompleksitas isu-isu kontemporer. Kami percaya bahwa setiap peristiwa memiliki lapisan makna yang lebih dalam, yang layak untuk dieksplorasi bersama.
              </p>
              
              <div className="bg-gradient-to-r from-orange-50 to-blue-50 p-6 rounded-xl border-l-4 border-orange-500 mb-6">
                <p className="text-lg text-gray-700 font-medium italic">
                  "Media bukan sekadar jendela informasi, tetapi cermin yang merefleksikan kedalaman pemahaman kita terhadap dunia."
                </p>
              </div>
              
              <p className="text-lg mb-6 text-gray-600 leading-relaxed">
                Melalui pendekatan <span className="font-semibold text-green-600">jurnalisme data yang humanis</span>, kami menyajikan fakta dalam kemasan yang tidak hanya informatif, tetapi juga inspiratif. Setiap artikel yang kami terbitkan melewati proses kurasi yang ketat untuk memastikan akurasi, relevansi, dan dampak positif bagi masyarakat.
              </p>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                Dengan tagline <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent font-bold">"Cerdas Memaknai"</span>, kami berkomitmen menjadi bagian dari ekosistem media yang sehat, di mana kebenaran, empati, dan dialog konstruktif menjadi fondasi utama dalam setiap karya jurnalistik kami.
              </p>
            </div>
          </div>
          
          {/* Vision & Mission */}
          <div className="bg-gradient-to-br from-white to-orange-50 p-10 rounded-2xl shadow-xl border border-orange-100 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-blue-200 to-transparent rounded-full opacity-20 -translate-y-20 -translate-x-20"></div>
            <div className="relative">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">
                  Visi & Misi
                </h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white/70 p-8 rounded-xl shadow-md border border-orange-100">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">V</span>
                    </div>
                    <h4 className="text-2xl font-bold text-orange-600">Visi</h4>
                  </div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Menjadi <span className="font-semibold text-orange-600">media digital terdepan</span> yang menginspirasi transformasi sosial melalui narasi bermakna, menciptakan ekosistem informasi yang sehat, kritis, dan inklusif untuk Indonesia yang lebih cerdas dan berempati.
                  </p>
                </div>
                
                <div className="bg-white/70 p-8 rounded-xl shadow-md border border-blue-100">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">M</span>
                    </div>
                    <h4 className="text-2xl font-bold text-blue-600">Misi</h4>
                  </div>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Menghadirkan <strong>jurnalisme data yang mendalam</strong> dan mudah dipahami untuk memperkaya wawasan publik</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Memfasilitasi <strong>partisipasi aktif masyarakat</strong> dalam membangun narasi bersama yang konstruktif</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Menjembatani kesenjangan antara <strong>kebijakan dan realitas</strong> melalui perspektif yang berimbang</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>Menjaga <strong>integritas informasi</strong> dan melawan disinformasi dengan standar jurnalistik tertinggi</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Services */}
          <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 w-64 h-64 bg-gradient-to-r from-orange-100 to-blue-100 rounded-full opacity-20 -translate-y-32 -translate-x-32"></div>
            <div className="relative">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  Layanan Unggulan Kami
                </h3>
                <p className="text-gray-600 text-lg">Solusi komprehensif untuk kebutuhan media digital Anda</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Riset & Analisis Data */}
                <div className="group bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-xl border border-orange-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3 text-center">Data Intelligence</h4>
                  <p className="text-gray-600 text-center leading-relaxed">
                    Riset mendalam dengan metodologi ilmiah dan analisis data yang akurat untuk menghasilkan <span className="font-semibold text-orange-600">insight berkualitas tinggi</span>
                  </p>
                </div>
                
                {/* Digital Kreatif */}
                <div className="group bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl border border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3 text-center">Creative Storytelling</h4>
                  <p className="text-gray-600 text-center leading-relaxed">
                    Kreativitas digital yang memadukan <span className="font-semibold text-blue-600">seni visual</span> dengan narasi powerful untuk engagement maksimal
                  </p>
                </div>
                
                {/* Branding & Publishing */}
                <div className="group bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl border border-green-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3 text-center">Strategic Publishing</h4>
                  <p className="text-gray-600 text-center leading-relaxed">
                    Strategi branding holistik dan sistem publishing yang <span className="font-semibold text-green-600">terukur dan berkelanjutan</span> untuk impact jangka panjang
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 rounded-2xl shadow-xl text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10 rounded-2xl"></div>
            <div className="relative">
              <h3 className="text-2xl font-bold mb-4">Mari Bersama Membangun Narasi yang Bermakna</h3>
              <p className="text-lg mb-6 opacity-90">
                Bergabunglah dengan komunitas pembaca cerdas yang peduli akan kualitas informasi dan kedalaman makna
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="https://whatsapp.com/channel/0029Vb61Apy0wajqHt7lQz3l"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-orange-600 px-6 py-3 rounded-full font-semibold hover:bg-orange-50 transition-colors duration-300 shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  Ikuti Konten Kami
                </a>
                <a 
                  href="https://wa.me/628979132802"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-2 border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-orange-600 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  Hubungi Tim Kami
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};