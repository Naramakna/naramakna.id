import React from 'react';
import { PartnershipArea } from '../../molecules/PartnershipArea';

interface PartnershipAreaData {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface PartnershipAreasSectionProps {
  title: string;
  description: string;
  areas: PartnershipAreaData[];
  className?: string;
}

export const PartnershipAreasSection: React.FC<PartnershipAreasSectionProps> = ({
  title,
  description,
  areas,
  className = ''
}) => {
  return (
    <div className={`bg-gradient-to-br from-white to-orange-50 p-10 rounded-2xl shadow-xl border border-orange-100 relative overflow-hidden ${className}`}>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-blue-200 to-transparent rounded-full opacity-20 -translate-y-20 -translate-x-20"></div>
      <div className="relative">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-lg">{description}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {areas.map((area, index) => (
            <PartnershipArea
              key={index}
              title={area.title}
              description={area.description}
              icon={area.icon}
              color={area.color}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
