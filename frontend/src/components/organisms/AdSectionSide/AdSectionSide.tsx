import React from 'react';

interface AdSectionSideProps {
  className?: string;
}

export const AdSectionSide: React.FC<AdSectionSideProps> = ({
  className = ''
}) => {
  return (
    <div className={`w-[300px] h-[250px] bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center sticky top-32 ${className}`}>
      {/* Dummy Ad Content */}
      <div className="text-center p-4">
        <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-3 flex items-center justify-center">
          <span className="text-white text-xs font-bold">AD</span>
        </div>
        <p className="text-gray-600 text-sm font-medium">Advertisement</p>
        <p className="text-gray-500 text-xs mt-1">300 x 250</p>
        <p className="text-gray-400 text-xs mt-2">Dummy Ad Space</p>
      </div>
    </div>
  );
};
