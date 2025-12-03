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
  items: _items,
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

  const _handleItemClick = (item: DropdownItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      window.location.href = item.href;
    }
    setIsOpen(false);
  };

  // Data untuk fitur unggulan (4 layanan)
  const featuredServices = [
    {
      name: 'Polling',
      description: 'Survei & opini publik',
      icon: (
        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      href: '/polling'
    },
    {
      name: 'Creative Storytelling',
      description: 'Digital kreatif & visual',
      icon: (
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      href: '/tentang-kami'
    },
    {
      name: 'Strategic Publishing',
      description: 'Branding & publishing',
      icon: (
        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      href: '/tentang-kami'
    },
    {
      name: 'Video Story',
      description: 'Konten video menarik',
      icon: (
        <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      href: '/video-story'
    }
  ];

  // Data untuk kolom tengah (Company/Information Links)
  const companyLinks = [
    { title: 'Tentang Kami', href: '/tentang-kami' },
    { title: 'Cara Menulis di naramakna', href: '/cara-menulis' },
    { title: 'Informasi Kerja Sama', href: '/kerja-sama' },
    { title: 'Bantuan', href: '/bantuan' }
  ];

  // Data untuk kolom kanan (Social Media Links)
  const socialMediaLinks = [
    { name: 'Instagram', href: 'https://www.instagram.com/naramakna.id?igsh=ejNla2VjeDdwaWd5' },
    { name: 'Facebook', href: 'https://m.facebook.com/naramakna.id/' },
    { name: 'X (Twitter)', href: 'https://x.com/apcomsolutions?s=21' },
    { name: 'WhatsApp', href: 'https://wa.me/628979132802' }
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
            <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                
                {/* Left Column - Fitur Unggulan Grid 2x2 */}
                <div className="md:col-span-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <div className="w-1 h-6 bg-naramakna-gold rounded-full mr-3"></div>
                    Fitur Unggulan
                  </h3>
                  <div className="grid grid-cols-2 gap-3 lg:gap-4">
                    {featuredServices.map((service, index) => (
                      <a
                        key={index}
                        href={service.href}
                        className="group p-3 lg:p-4 rounded-xl hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 cursor-pointer transition-all duration-300 border border-gray-100 hover:border-naramakna-gold/30 hover:shadow-lg"
                      >
                        <div className="flex flex-col items-center text-center space-y-2 lg:space-y-3">
                          <div className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300 p-2 rounded-full bg-white group-hover:shadow-md">
                            {service.icon}
                          </div>
                          <div>
                            <div className="text-sm lg:text-base font-semibold text-gray-900 group-hover:text-naramakna-gold transition-colors duration-300 leading-tight">
                              {service.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 leading-tight">
                              {service.description}
                            </div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Middle Column - Company/Information Links */}
                <div className="md:col-span-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <div className="w-1 h-6 bg-naramakna-gold rounded-full mr-3"></div>
                    Informasi
                  </h3>
                  <div className="space-y-3">
                    {companyLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.href}
                        className="group flex items-center text-gray-600 hover:text-naramakna-gold transition-colors duration-300 py-2 px-3 rounded-lg hover:bg-gray-50"
                      >
                        <div className="w-2 h-2 bg-gray-300 group-hover:bg-naramakna-gold rounded-full mr-3 transition-colors duration-300"></div>
                        <span className="text-sm lg:text-base font-medium">
                          {link.title}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Right Column - Social Media Links */}
                <div className="md:col-span-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <div className="w-1 h-6 bg-naramakna-gold rounded-full mr-3"></div>
                    Ikuti Kami
                  </h3>
                  <div className="space-y-3">
                    {socialMediaLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center text-gray-600 hover:text-naramakna-gold transition-colors duration-300 py-2 px-3 rounded-lg hover:bg-gray-50"
                      >
                        <div className="w-2 h-2 bg-gray-300 group-hover:bg-naramakna-gold rounded-full mr-3 transition-colors duration-300"></div>
                        <span className="text-sm lg:text-base font-medium">
                          {link.name}
                        </span>
                        <svg className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
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