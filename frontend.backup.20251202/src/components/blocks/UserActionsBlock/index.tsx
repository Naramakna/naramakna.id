// src/components/blocks/UserActionsBlock/index.tsx
import React from 'react';
import { Home } from 'lucide-react';
import Button from '../../ui/Button';
import IconButton from '../../ui/IconButton';

interface UserActionsBlockProps {
  onMenuToggle: () => void;
}

const UserActionsBlock: React.FC<UserActionsBlockProps> = ({ onMenuToggle }) => {
  return (
    <div className="flex items-center space-x-4">
      {/* Desktop Actions */}
      <div className="hidden md:flex items-center space-x-3">
        <a 
          href="#" 
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200 px-2 py-1 rounded-md hover:bg-gray-50"
        >
          <Home className="w-5 h-5 mr-1" />
          <span className="font-medium">Home</span>
        </a>
        <Button variant="outline" size="sm">
          Masuk
        </Button>
        <Button size="sm">
          Buat Tulisan
        </Button>
      </div>

      {/* Mobile Menu Button */}
      <IconButton 
        onClick={onMenuToggle}
        className="lg:hidden"
        variant="ghost"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </IconButton>
    </div>
  );
};

export default UserActionsBlock;