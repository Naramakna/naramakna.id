// src/components/sections/FooterSection/index.tsx
import React from 'react';
import Logo from '../../ui/Logo';

const FooterSection: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: {
      title: 'Perusahaan',
      links: [
        { label: 'Tentang Kami', href: '#about' },
        { label: 'Tim Redaksi', href: '#team' },
        { label: 'Karir', href: '#career' },
        { label: 'Kontak', href: '#contact' }
      ]
    },
    content: {
      title: 'Konten',
      links: [
        { label: 'Berita Terkini', href: '#news' },
        { label: 'Entertainment', href: '#entertainment' },
        { label: 'Teknologi', href: '#tech' },
        { label: 'Olahraga', href: '#sports' }
      ]
    },
    legal: {
      title: 'Legal',
      links: [
        { label: 'Kebijakan Privasi', href: '#privacy' },
        { label: 'Syarat & Ketentuan', href: '#terms' },
        { label: 'Pedoman Media', href: '#guidelines' },
        { label: 'Koreksi Berita', href: '#corrections' }
      ]
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <div className="bg-white p-2 rounded-md inline-block">
                <Logo />
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              PT Solusi Komunikasi Terapan - Portal berita terpercaya dengan 
              komitmen menyajikan informasi berkualitas untuk masyarakat Indonesia.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                📘
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                🐦
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                📷
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">YouTube</span>
                📹
              </a>
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} PT Solusi Komunikasi Terapan. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              Made with ❤️ for Indonesia
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;