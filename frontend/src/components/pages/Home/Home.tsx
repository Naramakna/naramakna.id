// Halaman utama/homepage dengan feed artikel dan video
import React from 'react';
import { Navbar } from '../../organisms/Navbar';
import { AdSection } from '../../organisms/AdSection/AdSection';
import { VideoSection } from '../../organisms/VideoSection/VideoSection';
import { PollingMain } from '../../organisms/PollingMain';
import { useSEO } from '../../../hooks/useSEO';
import { DynamicCategorySections } from '../../organisms/DynamicCategorySections/DynamicCategorySections';
import { MainContentSection } from '../../organisms/MainContentSection/MainContentSection';
import { PopupAd } from '../../organisms/PopupAd';

export const Home: React.FC = () => {
  // SEO for homepage
  useSEO({
    title: 'Naramakna - Berita Terkini Indonesia & Dunia',
    description: 'Portal berita terpercaya dengan informasi terkini dari Indonesia dan dunia. Dapatkan berita politik, ekonomi, olahraga, hiburan, teknologi, dan lifestyle terupdate setiap hari.',
    keywords: [
      'berita indonesia', 'berita terkini', 'portal berita', 'naramakna',
      'berita politik', 'berita ekonomi', 'berita olahraga', 'berita hiburan',
      'berita teknologi', 'berita dunia', 'breaking news', 'news indonesia'
    ],
    image: `${typeof window !== 'undefined' ? window.location.origin : ''}/LogoNaramakna.png`,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    type: 'website',
    locale: 'id_ID'
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar Component */}
      <Navbar />

      {/* Hero Banner - Fast rotation (3 seconds) */}
      <AdSection 
        placement="hero-banner" 
        size='header' 
        rotationInterval={3000}
      />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* MainContentSection  */}
        <MainContentSection />

        {/* Mid Content Banner - Normal rotation (5 seconds) */}
        <AdSection 
          placement="mid-content" 
          size='header' 
          rotationInterval={5000}
        />

        {/* Video Section */}
        <VideoSection />
        
        {/* Polling Section */}
        <PollingMain />

        {/* YouTube Section */}
        {/* <TikTokSection limit={8} /> */}

        {/* Bottom Banner - Slow rotation (10 seconds) */}
        <AdSection 
          placement="bottom-content" 
          size='regular' 
          rotationInterval={10000}
        />
        
        {/* Dynamic Category Sections */}
        <DynamicCategorySections />
      </div>
      
      {/* Popup Ad - Only on homepage */}
      <PopupAd />
    </div>
  );
};
