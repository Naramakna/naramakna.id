import React from 'react';

interface SocialStatsProps {
  mengikuti: number;
  pengikut: number;
}

export const SocialStats: React.FC<SocialStatsProps> = ({
  mengikuti,
  pengikut
}) => {
  return (
    <div className="flex justify-center space-x-6 mb-4">
      <div className="text-center">
        <span className="font-semibold text-gray-900">{mengikuti}</span>
        <span className="text-gray-600 text-sm ml-1">Mengikuti</span>
      </div>
      <div className="text-center">
        <span className="font-semibold text-gray-900">{pengikut}</span>
        <span className="text-gray-600 text-sm ml-1">Pengikut</span>
      </div>
    </div>
  );
};
