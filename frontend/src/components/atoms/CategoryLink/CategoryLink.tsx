import React from 'react';
import type { CategoryLinkProps } from './CategoryLink.types';

const CategoryLink: React.FC<CategoryLinkProps> = ({ 
  category, 
  isActive = false, 
  className = '',
  onClick 
}) => {
  const baseClasses = 'px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200';
  const activeClasses = isActive 
    ? 'bg-blue-600 text-white' 
    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50';
  
  const combinedClasses = `${baseClasses} ${activeClasses} ${className}`;

  const handleClick = () => {
    if (onClick) {
      onClick(category);
    } else {
      window.location.href = `/kategori/${category.slug}`;
    }
  };

  return (
    <button
      onClick={handleClick}
      className={combinedClasses}
      type="button"
    >
      {category.name}
      {category.count > 0 && (
        <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
          {category.count}
        </span>
      )}
    </button>
  );
};

export default CategoryLink;