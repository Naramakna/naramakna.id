// Halaman utama/homepage dengan feed artikel dan video
import React, { lazy, Suspense } from 'react';
import { Navbar } from '../../organisms/Navbar';
import { useSEO } from '../../../hooks/useSEO';

// Lazy load SEMUA komponen untuk Speed Index optimization  
const AdSection = lazy(() => import('../../organisms/AdSection/AdSection').then(module => ({ default: module.AdSection })));
const MainContentSection = lazy(() => import('../../organisms/MainContentSection/MainContentSection').then(module => ({ default: module.MainContentSection })));
const VideoSection = lazy(() => import('../../organisms/VideoSection/VideoSection').then(module => ({ default: module.VideoSection })));
// const PollingMain = lazy(() => import('../../organisms/PollingMain').then(module => ({ default: module.PollingMain })));
import { PollingMain } from '../../organisms/PollingMain';
const DynamicCategorySections = lazy(() => import('../../organisms/DynamicCategorySections/DynamicCategorySections').then(module => ({ default: module.DynamicCategorySections })));
const PopupAd = lazy(() => import('../../organisms/PopupAd').then(module => ({ default: module.PopupAd })));
const Footer = lazy(() => import('../../organisms/Footer').then(module => ({ default: module.Footer })));

export const Home: React.FC = () => {
  // SEO for homepage
  useSEO({
    title: 'Naramakna - Cerdas Memaknai',
    description: 'Naramakna.id - Platform media digital yang menghadirkan informasi berkualitas dan perspektif mendalam untuk membantu Anda cerdas dalam memaknai berbagai peristiwa dan isu terkini.',
    keywords: [
      'naramakna', 'cerdas memaknai', 'media digital', 'informasi berkualitas',
      'perspektif mendalam', 'analisis berita', 'wawasan', 'edukasi',
      'pemahaman', 'insight', 'naramakna.id', 'platform media'
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

      {/* Hero Banner - Above the fold, immediate load */}
      <div className="pt-4">
        <Suspense fallback={<div className="hero-banner-skeleton"></div>}>
          <AdSection 
            placement="hero-banner" 
            size='header' 
            rotationInterval={3000}
          />
        </Suspense>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* MainContentSection - Now lazy loaded for Speed Index */}
        <Suspense fallback={<div className="category-skeleton bg-gray-100 animate-pulse rounded-lg"></div>}>
          <MainContentSection />
        </Suspense>

        {/* Below the fold content - lazy loaded */}
        <Suspense fallback={<div className="hero-banner-skeleton"></div>}>
          <AdSection 
            placement="mid-content" 
            size='header' 
            rotationInterval={5000}
          />
        </Suspense>

        {/* tiktok video */}
        {/* <Suspense fallback={<div className="video-section-skeleton bg-gray-100 animate-pulse rounded-lg"></div>}>
          <VideoSection />
        </Suspense> */}
        
        <PollingMain />

        <Suspense fallback={<div className="category-skeleton bg-gray-100 animate-pulse rounded-lg"></div>}>
          <DynamicCategorySections
            excludeCategories={['otomotif', 'data-bicara']}
          />
        </Suspense>
      </div>
      
      <Suspense fallback={null}>
        <PopupAd />
      </Suspense>

      <Suspense fallback={<div className="footer-skeleton"></div>}>
        <Footer />
      </Suspense>
    </div>
  );
};
