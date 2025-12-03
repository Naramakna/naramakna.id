import React from 'react';
import { LogoFooter } from '../../atoms/LogoFooter';

export const Footer: React.FC = () => {
  // Data untuk fitur unggulan (4 layanan)
  const featuredServices = [
    { name: 'Polling', href: '/polling' },
    { name: 'Creative Storytelling', href: '/tentang-kami' },
    { name: 'Strategic Publishing', href: '/tentang-kami' },
    { name: 'Video Story', href: '/video-story' }
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
    <footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left Column - Logo & Contact Info */}
          <div className="space-y-1">
            {/* Logo */}
            <div className="flex items-center">
              <LogoFooter size="md" />
            </div>
            
            {/* Contact Information */}
            <div className="space-y-4">
              {/* Address */}
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-300 text-sm leading-relaxed text-left">
                  Jl. Sanggar Kencana Utama No. 1C, Sanggar Hurip Estate, Jatisari, Buahbatu, Kota Bandung, Jawa Barat 40286
                </p>
              </div>
              
              {/* Phone */}
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:089791328020" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm">
                  0897 9132 802
                </a>
              </div>
              
              {/* Email */}
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:redaksi@naramakna.id" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm">
                  redaksi@naramakna.id
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Navigation Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Fitur Unggulan */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Fitur Unggulan</h3>
              <div className="space-y-2">
                {featuredServices.map((service, index) => (
                  <a
                    key={index}
                    href={service.href}
                    className="block text-sm text-gray-300 hover:text-yellow-400 transition-colors duration-200"
                  >
                    {service.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Informasi */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Informasi</h3>
              <div className="space-y-2">
                {companyLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="block text-sm text-gray-300 hover:text-yellow-400 transition-colors duration-200"
                  >
                    {link.title}
                  </a>
                ))}
              </div>
            </div>

            {/* Ikuti Kami */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4">Ikuti Kami</h3>
              <div className="space-y-2">
                {socialMediaLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-gray-300 hover:text-yellow-400 transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-xs text-gray-400">
              © 2024 Naramakna.id. All rights reserved.
            </p>
            <div className="flex space-x-4 text-xs text-gray-400">
              <a href="/privacy" className="hover:text-yellow-400 transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-yellow-400 transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};