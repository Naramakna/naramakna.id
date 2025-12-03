import React from 'react';
import { NavHeader } from '../../molecules/NavHeader/NavHeader';
import { NavKategori } from '../../molecules/NavKategori/NavKategori';
import { NavService } from '../../molecules/NavService/NavService';

export const Navbar: React.FC = () => {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* NavHeader Component */}
      <NavHeader />

      {/* Categories Navigation - More Compact */}
      <div className="border-t border-gray-100">
        <NavKategori />
      </div>

      {/* Services Navigation - More Compact */}
      <div className="border-t border-gray-100">
        <NavService />
      </div>
    </div>
  );
};