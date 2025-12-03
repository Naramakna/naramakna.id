import React from 'react';
import { ServiceCard } from '../../molecules/ServiceCard';

interface Service {
  title: string;
  description: string;
  type: 'data' | 'creative' | 'publishing';
  color: string;
}

interface ServicesSectionProps {
  title: string;
  description: string;
  services: Service[];
  className?: string;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  title,
  description,
  services,
  className = ''
}) => {
  return (
    <div className={`bg-white p-10 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden ${className}`}>
      <div className="absolute top-0 left-1/2 w-64 h-64 bg-gradient-to-r from-orange-100 to-blue-100 rounded-full opacity-20 -translate-y-32 -translate-x-32"></div>
      <div className="relative">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
            </svg>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-lg">{description}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              title={service.title}
              description={service.description}
              type={service.type}
              color={service.color}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
