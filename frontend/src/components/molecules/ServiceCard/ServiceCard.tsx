import React from 'react';
import { ServiceIcon } from '../../atoms/ServiceIcon';

interface ServiceCardProps {
  title: string;
  description: string;
  type: 'data' | 'creative' | 'publishing';
  color: string;
  className?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  type,
  color,
  className = ''
}) => {
  return (
    <div className={`group bg-gradient-to-br ${color} p-8 rounded-xl border border-orange-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${className}`}>
      <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
        <ServiceIcon type={type} />
      </div>
      <h4 className="text-xl font-bold text-gray-900 mb-3 text-center">{title}</h4>
      <p className="text-gray-600 text-center leading-relaxed">{description}</p>
    </div>
  );
};
