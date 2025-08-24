import React from 'react';
import { PollingGallery } from '../PollingGallery/PollingGallery';

interface PollingSectionProps {
  className?: string;
}

export const PollingSection: React.FC<PollingSectionProps> = ({
  className = ''
}) => {
  return (
    <div className={`bg-gray-50 py-8 ${className}`}>
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex items-center mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
            <h2 className="text-xl font-semibold text-gray-900">Polling</h2>
          </div>
        </div>

        {/* Polling Gallery */}
        <PollingGallery />
      </div>
    </div>
  );
}; 