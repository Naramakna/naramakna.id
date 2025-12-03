import React, { useState, useRef, useEffect } from 'react';

interface DropdownItem {
  title: string;
  description?: string;
  href?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

interface NavDropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  className?: string;
}

export const NavDropdown: React.FC<NavDropdownProps> = ({
  trigger,
  items,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleItemClick = (item: DropdownItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      window.location.href = item.href;
    }
    setIsOpen(false);
  };

  // Data untuk kolom tengah (Company/Information Links)
  const companyLinks = [
    'Tentang Kami',
    'Cara Menulis di naramakna',
    'Informasi Kerja Sama',
    'Bantuan',
    'Iklan'
  ];

  // Data untuk kolom kanan (Social Media Links)
  const socialMediaLinks = [
    'Instagram',
    'Facebook',
    'Tiktok',
    'Youtube',
    'Whatsapp',
    'X'
  ];

  return (
    <div className={`relative ${className}`} ref={triggerRef}>
      <div
        className="cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
      >
        {trigger}
      </div>

      {isOpen && (
        <>
          {/* Dark overlay for page content */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            style={{ top: '120px' }} // Start below NavHeader + NavKategori
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown positioned below NavKategori */}
          <div 
            className="fixed z-40 bg-white shadow-2xl border border-gray-200 w-full"
            style={{ 
              top: '120px', // Below NavHeader + NavKategori
              left: 0,
              right: 0
            }}
            ref={dropdownRef}
            onMouseLeave={() => setIsOpen(false)}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="grid grid-cols-3 gap-8">
                
                {/* Left Column - Icons and Features */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Fitur Unggulan</h3>
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                        onClick={() => handleItemClick(item)}
                      >
                        <div className="flex-shrink-0">
                          {item.icon}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.title}</div>
                          {item.description && (
                            <div className="text-xs text-gray-500">{item.description}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Middle Column - Company/Information Links */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Informasi</h3>
                  <div className="space-y-2">
                    {companyLinks.map((link, index) => (
                      <a
                        key={index}
                        href="#"
                        className="block text-sm text-gray-600 hover:text-yellow-500 transition-colors duration-200"
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Right Column - Social Media Links */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Ikuti Kami</h3>
                  <div className="space-y-2">
                    {socialMediaLinks.map((link, index) => (
                      <a
                        key={index}
                        href="#"
                        className="block text-sm text-gray-600 hover:text-yellow-500 transition-colors duration-200"
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};