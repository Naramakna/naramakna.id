import React from 'react';
import { NavigationItem } from '../../molecules/NavigationItem';

interface ServiceNavigationProps {
  className?: string;
}

const ServiceNavigation: React.FC<ServiceNavigationProps> = ({
  className = '',
}) => {
  const services = [
    { label: 'Breaking News', href: '/breaking-news', color: 'text-red-600' },
    { label: 'Halal Living', href: '/halal-living', color: 'text-green-600' },
    { label: 'Green Initiative', href: '/green-initiative', color: 'text-green-700' },
    { label: 'Video Story', href: '/video-story', color: 'text-blue-600' },
    { label: 'Trending', href: '/trending', color: 'text-orange-600' },
    { label: 'naramaknaPLUS', href: '/naramakna-plus', color: 'text-purple-600' },
    { label: 'Opini & Cerita', href: '/opini-cerita', color: 'text-gray-600' },
  ];

  return (
    <nav className={`bg-gray-50 border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center py-2">
          {/* Desktop Services */}
          <div className="hidden md:flex items-center space-x-0">
            {services.map((service) => (
              <a
                key={service.label}
                href={service.href}
                className={`px-3 py-1.5 text-xs font-medium ${service.color} hover:bg-white hover:shadow-sm rounded-full transition-all duration-200`}
              >
                {service.label}
              </a>
            ))}
          </div>

          {/* Mobile Services - Horizontal Scroll */}
          <div className="md:hidden w-full">
            <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
              {services.map((service) => (
                <a
                  key={service.label}
                  href={service.href}
                  className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium ${service.color} hover:bg-white rounded-full`}
                >
                  {service.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ServiceNavigation;