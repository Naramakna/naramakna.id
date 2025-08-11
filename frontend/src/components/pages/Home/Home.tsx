// Halaman utama/homepage dengan feed artikel dan video
import React from 'react';
import { Navbar } from '../../organisms/Navbar';
import { AdSection } from '../../organisms/AdSection/AdSection';
import { PollingSection } from '../../organisms/PollingSection/PollingSection';
import { VideoSection } from '../../organisms/VideoSection/VideoSection';

import { DynamicCategorySections } from '../../organisms/DynamicCategorySections/DynamicCategorySections';
import { MainContentSection } from '../../organisms/MainContentSection/MainContentSection';

export const Home: React.FC = () => {
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
        <PollingSection />

        {/* Bottom Banner - Slow rotation (10 seconds) */}
        <AdSection 
          placement="bottom-content" 
          size='regular' 
          rotationInterval={10000}
        />
        
        {/* Dynamic Category Sections */}
        <DynamicCategorySections />
      </div>
    </div>
  );
};
