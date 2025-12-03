// src/components/ui/NavLink/NavLink.tsx
import React from 'react';

export interface NavLinkProps {
  children: React.ReactNode;
  href?: string;
  active?: boolean;
  className?: string;
  onClick?: () => void;
  hasDropdown?: boolean;
}

export const NavLink: React.FC<NavLinkProps> = ({
  children,
  href = '#',
  active = false,
  className = '',
  onClick,
  hasDropdown = false,
}) => {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`
        inline-flex items-center px-3 py-2 text-sm font-medium transition-colors
        hover:text-[#db9942] focus:outline-none focus:text-[#db9942]
        ${active ? 'text-[#db9942] border-b-2 border-[#db9942]' : 'text-gray-700'}
        ${className}
      `}
    >
      {children}
      {hasDropdown && (
        <svg
          className="ml-1 h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      )}
    </a>
  );
};

export default NavLink;