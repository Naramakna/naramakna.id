import React, { useState } from 'react';
import { useCategories } from '../../../hooks/useCategories';

interface CategoryFilterProps {
  selectedCategory?: string;
  onCategoryChange: (categorySlug: string | null) => void;
  className?: string;
  showAll?: boolean;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
  className = '',
  showAll = true
}) => {
  const { categories, loading, error } = useCategories();
  const [showMore, setShowMore] = useState(false);

  if (loading) {
    return (
      <div className={`flex space-x-2 ${className}`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded-full px-4 py-2 w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    console.warn('CategoryFilter Error:', error);
    return null; // Silent fallback
  }

  // Smart filtering: hanya kategori dengan content dan minimal 1 post
  const smartCategories = categories
    .filter(cat => cat.count >= 1) // Minimal 1 post (reduced from 2)
    .sort((a, b) => b.count - a.count) // Sort by popularity
    .slice(0, 15); // Maksimal 15 kategori utama (increased from 8)

  // Kategori utama - yang paling populer dan general
  const mainCategories = smartCategories.slice(0, 6);
  
  // Kategori tambahan untuk "Show More"
  const moreCategories = smartCategories.slice(6);
  
  // Kategori yang ditampilkan tergantung state showMore
  const displayCategories = showMore ? smartCategories : mainCategories;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {showAll && (
        <button
          onClick={() => onCategoryChange(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
            !selectedCategory
              ? 'bg-naramakna-gold text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Semua
        </button>
      )}
      
      {displayCategories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.slug)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
            selectedCategory === category.slug
              ? 'bg-naramakna-gold text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {category.name}
          {category.count > 0 && (
            <span className="ml-2 text-xs opacity-75">
              ({category.count})
            </span>
          )}
        </button>
      ))}
      
      {/* Show More/Less Button */}
      {moreCategories.length > 0 && (
        <button
          onClick={() => setShowMore(!showMore)}
          className="px-4 py-2 rounded-full text-sm font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors duration-200"
        >
          {showMore ? (
            <>
              <span>Lebih Sedikit</span>
              <svg className="w-4 h-4 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </>
          ) : (
            <>
              <span>+{moreCategories.length} Lagi</span>
              <svg className="w-4 h-4 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>
      )}
    </div>
  );
};