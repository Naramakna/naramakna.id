import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Icon } from '../../atoms/Icon';

interface DropdownItem {
  label: string;
  href: string;
  description?: string;
}

interface NavigationItemProps {
  label: string;
  href?: string;
  hasDropdown?: boolean;
  dropdownItems?: DropdownItem[];
  className?: string;
  onClick?: () => void;
}

const NavigationItem: React.FC<NavigationItemProps> = ({
  label,
  href,
  hasDropdown = false,
  dropdownItems = [],
  className = '',
  onClick,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMouseEnter = () => {
    if (hasDropdown) {
      setIsDropdownOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (hasDropdown) {
      setIsDropdownOpen(false);
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    if (hasDropdown) {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const content = (
    <span className="flex items-center gap-1">
      {label}
      {hasDropdown && (
        <Icon 
          icon={ChevronDown} 
          size={14} 
          className={`transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
        />
      )}
    </span>
  );

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={dropdownRef}
    >
      {href && !hasDropdown ? (
        <a
          href={href}
          className="px-4 py-3 text-sm font-medium text-gray-700 hover:text-naramakna-gold hover:bg-gray-50 transition-all duration-200 rounded"
          onClick={handleClick}
        >
          {content}
        </a>
      ) : (
        <button
          className="px-4 py-3 text-sm font-medium text-gray-700 hover:text-naramakna-gold hover:bg-gray-50 transition-all duration-200 rounded flex items-center"
          onClick={handleClick}
        >
          {content}
        </button>
      )}

      {hasDropdown && isDropdownOpen && dropdownItems.length > 0 && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[280px]">
          <div className="py-2">
            {dropdownItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-naramakna-gold transition-colors duration-200"
              >
                <div className="font-medium">{item.label}</div>
                {item.description && (
                  <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavigationItem;