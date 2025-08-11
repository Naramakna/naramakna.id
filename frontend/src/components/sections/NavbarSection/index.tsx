// src/components/sections/NavbarSection/index.tsx
import React from 'react';
import { NavHeader } from '../../molecules/NavHeader/NavHeader';
import { Navbar } from '../../organisms/Navbar';

const NavbarSection: React.FC = () => {
  return (
    <div className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Header dengan Logo, Search, dan User Actions */}
      <NavHeader />
      
      {/* Navbar dengan Menu Kategori dan Layanan */}
      <Navbar />
    </div>
  );
};

export default NavbarSection;