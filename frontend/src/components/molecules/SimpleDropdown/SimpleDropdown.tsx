import React, { useState, useRef, useEffect } from 'react';

interface SimpleDropdownItem {
  title: string;
  href: string;
}

interface SimpleDropdownProps {
  trigger: React.ReactNode;
  items: SimpleDropdownItem[];
  className?: string;
}

export const SimpleDropdown: React.FC<SimpleDropdownProps> = ({
  trigger,
  items,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleItemClick = (href: string) => {
    window.location.href = href;
    setIsOpen(false);
  };

  const getDropdownPosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      return {
        top: rect.bottom + window.scrollY + 4, // 4px gap
        left: rect.left + window.scrollX,
      };
    }
    return { top: 0, left: 0 };
  };

  return (
    <>
      <div className={`relative ${className}`} ref={triggerRef}>
        <div
          className="cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {trigger}
        </div>
      </div>

      {isOpen && (
        <div 
          className="fixed bg-white border border-gray-200 rounded-lg shadow-xl min-w-24"
          style={{ 
            ...getDropdownPosition(),
            zIndex: 99999 
          }}
          ref={dropdownRef}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="py-2">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => handleItemClick(item.href)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-yellow-500 transition-colors duration-200"
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
