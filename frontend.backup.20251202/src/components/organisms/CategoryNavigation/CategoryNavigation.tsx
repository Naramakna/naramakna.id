import React from 'react';
import { NavigationItem } from '../../molecules/NavigationItem';

interface CategoryNavigationProps {
  className?: string;
}

const CategoryNavigation: React.FC<CategoryNavigationProps> = ({
  className = '',
}) => {
  const categories = [
    { label: 'News', href: '/news' },
    { label: 'Entertainment', href: '/entertainment' },
    { label: 'Tekno & Sains', href: '/tekno-sains' },
    { label: 'Bisnis', href: '/bisnis' },
    { label: 'Bola & Sports', href: '/bola-sports' },
    { label: 'Otomotif', href: '/otomotif' },
    { label: 'Woman', href: '/woman' },
    { label: 'Food & Travel', href: '/food-travel' },
    { label: 'Mom', href: '/mom' },
    { label: 'Bolanita', href: '/bolanita' },
  ];

  const lainnyaDropdownItems = [
    { 
      label: 'Video Story', 
      href: '/video-story',
      description: 'Cerita dalam bentuk video pendek'
    },
    { 
      label: 'Galeri Foto', 
      href: '/galeri-foto',
      description: 'Koleksi foto terbaik'
    },
    { 
      label: 'Kabar Daerah', 
      href: '/kabar-daerah',
      description: 'Berita dari berbagai daerah'
    },
    { 
      label: 'Polling', 
      href: '/polling',
      description: 'Survei dan polling terkini'
    },
    { 
      label: 'Zodiak', 
      href: '/zodiak',
      description: 'Ramalan bintang harian'
    },
  ];

  return (
    <nav className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-start">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-0">
            {categories.map((category) => (
              <NavigationItem
                key={category.label}
                label={category.label}
                href={category.href}
              />
            ))}
            
            {/* Lainnya with Dropdown */}
            <NavigationItem
              label="Lainnya"
              hasDropdown
              dropdownItems={lainnyaDropdownItems}
            />
          </div>

          {/* Mobile Navigation - Horizontal Scroll */}
          <div className="lg:hidden w-full">
            <div className="flex items-center space-x-0 overflow-x-auto scrollbar-hide">
              {categories.slice(0, 6).map((category) => (
                <NavigationItem
                  key={category.label}
                  label={category.label}
                  href={category.href}
                  className="whitespace-nowrap"
                />
              ))}
              <NavigationItem
                label="Lainnya"
                hasDropdown
                dropdownItems={[
                  ...categories.slice(6),
                  ...lainnyaDropdownItems
                ]}
                className="whitespace-nowrap"
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default CategoryNavigation;