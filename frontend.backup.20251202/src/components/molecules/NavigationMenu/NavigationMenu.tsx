// frontend/src/components/molecules/NavigationMenu/NavigationMenu.tsx
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { NavLink } from '../../atoms/NavLink';

export interface NavItem {
  label: string;
  href: string;
  active?: boolean;
  dropdown?: NavItem[];
}

export interface NavigationMenuProps {
  items: NavItem[];
  className?: string;
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({
  items,
  className = '',
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleMouseEnter = (label: string) => {
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  return (
    <nav className={`flex items-center space-x-8 ${className}`}>
      {items.map((item) => (
        <div
          key={item.label}
          className="relative"
          onMouseEnter={() => item.dropdown && handleMouseEnter(item.label)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center">
            <NavLink
              href={item.href}
              active={item.active}
              className="text-sm lg:text-base font-medium flex items-center"
            >
              {item.label}
              {item.dropdown && (
                <ChevronDown 
                  size={16} 
                  className={`ml-1 transition-transform duration-200 ${
                    activeDropdown === item.label ? 'rotate-180' : ''
                  }`}
                />
              )}
            </NavLink>
          </div>

          {/* Dropdown Menu */}
          {item.dropdown && activeDropdown === item.label && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2">
              {item.dropdown.map((dropdownItem) => (
                <a
                  key={dropdownItem.label}
                  href={dropdownItem.href}
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#db9942] transition-colors"
                >
                  {dropdownItem.label}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
};

export default NavigationMenu;