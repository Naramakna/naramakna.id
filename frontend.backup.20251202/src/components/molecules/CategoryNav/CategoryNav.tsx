// frontend/src/components/molecules/CategoryNav/CategoryNav.tsx
import React from 'react';

export interface CategoryItem {
  label: string;
  href: string;
  variant?: 'default' | 'primary' | 'secondary';
  active?: boolean;
}

export interface CategoryNavProps {
  items: CategoryItem[];
  className?: string;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  items,
  className = '',
}) => {
  const getVariantClasses = (variant: string = 'default', active: boolean = false) => {
    const baseClasses = 'px-3 py-1.5 text-sm font-medium rounded-full transition-colors whitespace-nowrap flex-shrink-0';
    
    const variantClasses = {
      default: active 
        ? 'bg-gray-900 text-white' 
        : 'text-gray-700 hover:text-gray-900',
      primary: 'bg-blue-500 text-white hover:bg-blue-600',
      secondary: 'bg-[#19b3a6] text-white hover:bg-[#17a398]',
    };
    
    return `${baseClasses} ${variantClasses[variant as keyof typeof variantClasses]}`;
  };

  return (
    <div className={`flex items-center gap-3 overflow-x-auto scrollbar-hide ${className}`}>
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          className={getVariantClasses(item.variant, item.active)}
        >
          {item.label}
        </a>
      ))}
    </div>
  );
};

export default CategoryNav;