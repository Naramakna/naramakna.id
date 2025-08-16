import React from 'react';
import { Navbar } from '../../components/organisms/Navbar';
import { AdSection } from '../../components/organisms/AdSection/AdSection';
import { Footer } from '../../components/organisms/Footer';
import { SocialMediaSection } from '../../components/organisms/SocialMediaSection';
import { PartnershipAreasSection } from '../../components/organisms/PartnershipAreasSection';

export const Partnership: React.FC = () => {
  const socialMediaLinks = [
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/naramakna.id',
      type: 'instagram' as const,
      color: 'from-pink-500 to-purple-600',
      bgColor: 'bg-gradient-to-r from-pink-500 to-purple-600'
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/naramakna.id',
      type: 'facebook' as const,
      color: 'from-blue-600 to-blue-700',
      bgColor: 'bg-gradient-to-r from-blue-600 to-blue-700'
    },
    {
      name: 'X (Twitter)',
      url: 'https://x.com/naramakna.id',
      type: 'twitter' as const,
      color: 'from-gray-800 to-gray-900',
      bgColor: 'bg-gradient-to-r from-gray-800 to-gray-900'
    },
    {
      name: 'WhatsApp',
      url: 'https://wa.me/628979132802',
      type: 'whatsapp' as const,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-gradient-to-r from-green-500 to-green-600'
    }
  ];

  const partnershipAreas = [
    {
      title: 'Content Collaboration',
      description: 'Kolaborasi konten dengan penulis, influencer, dan content creator untuk menghasilkan artikel berkualitas tinggi',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      color: 'bg-blue-500'
    },
    {
      title: 'Media Partnership',
      description: 'Kemitraan media untuk cross-posting, guest posting, dan kolaborasi editorial',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      color: 'bg-green-500'
    },
    {
      title: 'Event Collaboration',
      description: 'Kolaborasi event, webinar, dan workshop untuk meningkatkan engagement dan reach',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'bg-purple-500'
    },
    {
      title: 'Brand Partnership',
      description: 'Kemitraan brand untuk sponsored content, product reviews, dan campaign collaboration',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      color: 'bg-orange-500'
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
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-1 bg-orange-400 rounded-full"></div>
              <div className="w-8 h-1 bg-orange-500 mx-2 rounded-full"></div>
              <div className="w-4 h-1 bg-orange-600 rounded-full"></div>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 to-orange-800 bg-clip-text text-transparent mb-4">
              Informasi Kerja Sama
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Mari berkolaborasi untuk menciptakan konten berkualitas dan membangun ekosistem media yang sehat
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <SocialMediaSection
          title="Hubungi Tim Kami"
          description="Kami siap mendiskusikan peluang kolaborasi yang menarik"
          socialMediaLinks={socialMediaLinks}
          className="mb-12"
        />

        {/* Partnership Areas */}
        <PartnershipAreasSection
          title="Area Kerja Sama"
          description="Berbagai peluang kolaborasi yang bisa kita eksplorasi bersama"
          areas={partnershipAreas}
          className="mb-12"
        />

        {/* Why Partner With Us */}
        <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100 mb-12 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 w-64 h-64 bg-gradient-to-r from-orange-100 to-blue-100 rounded-full opacity-20 -translate-y-32 -translate-x-32"></div>
          <div className="relative">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                Mengapa Bermitra dengan Kami?
              </h3>
              <p className="text-gray-600 text-lg">Keunggulan yang membuat Naramakna.id menjadi partner yang tepat</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Reach yang Luas</h4>
                <p className="text-gray-600">Jangkau ribuan pembaca aktif yang peduli akan kualitas konten</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Kredibilitas Tinggi</h4>
                <p className="text-gray-600">Standar jurnalistik yang ketat dan reputasi yang terpercaya</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Tim Profesional</h4>
                <p className="text-gray-600">Tim berpengalaman dengan keahlian di berbagai bidang</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 rounded-2xl shadow-xl text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10 rounded-2xl"></div>
          <div className="relative">
            <h3 className="text-2xl font-bold mb-4">Siap Memulai Kolaborasi?</h3>
            <p className="text-lg mb-6 opacity-90">
              Mari diskusikan ide dan peluang kerja sama yang bisa kita wujudkan bersama
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://wa.me/628979132802"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-orange-600 px-8 py-3 rounded-full font-semibold hover:bg-orange-50 transition-colors duration-300 shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.87 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                Hubungi via WhatsApp
              </a>
              <a 
                href="mailto:marketing@naramakna.id"
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-orange-600 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Kirim Email
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};
