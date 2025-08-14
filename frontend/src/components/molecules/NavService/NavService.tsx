import React from 'react';

interface NavServiceProps {
  className?: string;
}

export const NavService: React.FC<NavServiceProps> = ({ className = '' }) => {
  // Layanan
  const services = [
    { name: 'Breaking News', href: '#' },
    { name: 'Video Story', href: '/video-story' },
    { name: 'Polling', href: '/polling' },
    { name: 'Trending', href: '#' },
  ];

  return (
    <div className={`bg-gray-50 border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-6 h-10 overflow-x-auto scrollbar-hide">
          {services.map((service, index) => (
            <a
              key={index}
              href={service.href}
              className={`text-xs font-medium whitespace-nowrap transition-colors duration-200 flex-shrink-0 px-3 py-1 rounded-full ${
                service.name === 'Breaking News' 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : service.name === 'Video Story'
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : service.name === 'Polling'
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'text-gray-600 hover:text-yellow-500 hover:bg-white'
              }`}
            >
              {service.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}; 