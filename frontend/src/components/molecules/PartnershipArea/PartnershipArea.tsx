import React from 'react';

interface PartnershipAreaProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  className?: string;
}

export const PartnershipArea: React.FC<PartnershipAreaProps> = ({
  title,
  description,
  icon,
  color,
  className = ''
}) => {
  return (
    <div className={`bg-white/70 p-8 rounded-xl shadow-md border border-orange-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${className}`}>
      <div className="flex items-start mb-4">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mr-4 shadow-lg flex-shrink-0`}>
          {icon}
        </div>
        <div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">{title}</h4>
          <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};
