// src/components/blocks/ServiceBlock/index.tsx
import React from 'react';

interface Service {
  icon: string;
  label: string;
  href: string;
  description?: string;
}

const ServiceBlock: React.FC = () => {
  const services: Service[] = [
    { 
      icon: '📺', 
      label: 'Breaking News', 
      href: '#breaking-news',
      description: 'Berita terkini dan terpercaya'
    },
    { 
      icon: '🎬', 
      label: 'Video Story', 
      href: '#video-story',
      description: 'Konten video menarik'
    },
    { 
      icon: '📸', 
      label: 'Galeri Foto', 
      href: '#galeri-foto',
      description: 'Koleksi foto terbaik'
    },
    { 
      icon: '📍', 
      label: 'Kabar Daerah', 
      href: '#kabar-daerah',
      description: 'Berita dari seluruh Indonesia'
    },
    { 
      icon: '📊', 
      label: 'Polling', 
      href: '#polling',
      description: 'Survei dan polling interaktif'
    },
    { 
      icon: '🌙', 
      label: 'Zodiak', 
      href: '#zodiak',
      description: 'Ramalan bintang harian'
    }
  ];

  return (
    <div className="hidden md:flex items-center justify-center space-x-8 py-3 bg-gray-50 border-b">
      {services.map((service, index) => (
        <a
          key={index}
          href={service.href}
          className="flex flex-col items-center text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 group"
          title={service.description}
        >
          <span className="text-2xl mb-1 group-hover:scale-110 transition-transform duration-200">
            {service.icon}
          </span>
          <span className="font-medium">{service.label}</span>
        </a>
      ))}
    </div>
  );
};

export default ServiceBlock;