import React, { useState } from 'react';
import { TrendingSection } from '../TrendingSection';
import { CategoryFilter } from '../../molecules/CategoryFilter';

interface TrendingSectionWithFilterProps {
  className?: string;
  showFilter?: boolean;
  limit?: number;
}

export const TrendingSectionWithFilter: React.FC<TrendingSectionWithFilterProps> = ({
  className = '',
  showFilter = true,
  limit = 5
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryChange = (categorySlug: string | null) => {
    setSelectedCategory(categorySlug);
  };

  return (
    <div className={className}>
      {/* Category Filter */}
      {showFilter && (
        <div className="mb-4">
          <CategoryFilter
            selectedCategory={selectedCategory || undefined}
            onCategoryChange={handleCategoryChange}
            className="mb-0"
            showAll={true}
          />
        </div>
      )}
      
      {/* Trending Section - Now uses views-based trending data */}
      <TrendingSection 
        limit={limit}
        category={selectedCategory || undefined}
        className=""
      />
    </div>
  );
};