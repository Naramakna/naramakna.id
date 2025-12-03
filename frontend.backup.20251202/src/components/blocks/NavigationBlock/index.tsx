// src/components/blocks/NavigationBlock/index.tsx
import React from 'react';
import { X } from 'lucide-react';
import { NavigationMenu, type NavItem } from '../../molecules/NavigationMenu';

interface NavigationBlockProps {
  isOpen: boolean;
  onClose: () => void;
}

const NavigationBlock: React.FC<NavigationBlockProps> = ({ isOpen, onClose }) => {
  const categories: NavItem[] = [
    { 
      label: 'News', 
      href: '#news',
      dropdown: [
        { label: 'Breaking News', href: '#breaking' },
        { label: 'Politik', href: '#politik' },
        { label: 'Ekonomi', href: '#ekonomi' },
        { label: 'Internasional', href: '#internasional' }
      ]
    },
    { 
      label: 'Entertainment', 
      href: '#entertainment',
      dropdown: [
        { label: 'Musik', href: '#musik' },
        { label: 'Film', href: '#film' },
        { label: 'Selebriti', href: '#selebriti' },
        { label: 'TV', href: '#tv' }
      ]
    },
    { 
      label: 'Tekno & Sains', 
      href: '#tekno',
      dropdown: [
        { label: 'Teknologi', href: '#teknologi' },
        { label: 'Sains', href: '#sains' },
        { label: 'Gadget', href: '#gadget' },
        { label: 'Internet', href: '#internet' }
      ]
    },
    { label: 'Bisnis', href: '#bisnis' },
    { label: 'Bola & Sports', href: '#sports' },
    { label: 'Otomotif', href: '#otomotif' },
    { label: 'Woman', href: '#woman' },
    { label: 'Food & Travel', href: '#food-travel' },
    { label: 'Mom', href: '#mom' },
    { label: 'Bolanita', href: '#bolanita' },
    { 
      label: 'Lainnya', 
      href: '#lainnya',
      dropdown: [
        { label: 'Lifestyle', href: '#lifestyle' },
        { label: 'Kesehatan', href: '#kesehatan' },
        { label: 'Pendidikan', href: '#pendidikan' },
        { label: 'Agama', href: '#agama' }
      ]
    }
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden lg:block">
        <NavigationMenu items={categories} />
      </div>

      {/* Mobile Navigation Overlay */}
      <div className={`lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {/* Mobile Menu Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Menu</h3>
              <button 
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Items */}
          <div className="p-4 space-y-1 overflow-y-auto">
            {categories.map((category, index) => (
              <a
                key={index}
                href={category.href}
                className="block py-3 px-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md border-b border-gray-100 transition-colors"
                onClick={onClose}
              >
                {category.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default NavigationBlock;