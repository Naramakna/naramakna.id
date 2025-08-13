import React from 'react';
import { HelpCategoryIcon } from '../../atoms/HelpCategoryIcon';

interface HelpCategory {
  id: string;
  name: string;
  type: 'umum' | 'akun' | 'artikel' | 'teknis';
}

interface HelpCategoriesProps {
  categories: HelpCategory[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  className?: string;
}

export const HelpCategories: React.FC<HelpCategoriesProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  className = ''
}) => {
  return (
    <div className={`bg-white p-6 rounded-2xl shadow-xl border border-gray-100 sticky top-8 ${className}`}>
      <h3 className="text-xl font-bold text-gray-900 mb-4">Kategori Bantuan</h3>
      <div className="space-y-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
              activeCategory === category.id
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-gray-50 text-gray-700 hover:bg-orange-50 hover:text-orange-600'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6">
                <HelpCategoryIcon type={category.type} />
              </div>
              <span className="font-medium">{category.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
