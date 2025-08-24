import React from 'react';
import { Navbar } from '../../components/organisms/Navbar';
import { AdSection } from '../../components/organisms/AdSection/AdSection';
import { Footer } from '../../components/organisms/Footer';
import { PollingGallery } from '../../components/organisms/PollingGallery/PollingGallery';

export const Polling: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />
      
      {/* Header Ad Section */}
      <AdSection />
      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Polling
          </h1>
          <p className="text-gray-600 text-lg">
            Berikan suara dan lihat pendapat masyarakat
          </p>
        </div>
        
        {/* Polling Gallery */}
        <PollingGallery />
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};
