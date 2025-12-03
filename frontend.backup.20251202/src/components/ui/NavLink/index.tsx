// src/components/ui/NavLink/index.tsx
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownItem {
  label: string;
  href: string;
}

interface NavLinkProps {
  children: React.ReactNode;
  href?: string;
  hasDropdown?: boolean;
  dropdownItems?: DropdownItem[];
  className?: string;
  isActive?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ 
  children, 
  href = "#", 
  hasDropdown = false, 
  dropdownItems = [],
  className = '',
  isActive = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div 
      className="relative group"
      onMouseEnter={() => hasDropdown && setIsOpen(true)}
      onMouseLeave={() => hasDropdown && setIsOpen(false)}
    >
      <a 
        href={href}
        className={`flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 ${
          isActive ? 'text-blue-600 font-medium' : ''
        } ${className}`}
      >
        {children}
        {hasDropdown && <ChevronDown className="ml-1 w-4 h-4" />}
      </a>
      
      {hasDropdown && dropdownItems.length > 0 && (
        <div className={`absolute top-full left-0 bg-white shadow-lg rounded-md py-2 w-48 z-50 transition-all duration-200 ${
          isOpen ? 'opacity-100 visible transform translate-y-0' : 'opacity-0 invisible transform -translate-y-2'
        }`}>
          {dropdownItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors duration-150"
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default NavLink;