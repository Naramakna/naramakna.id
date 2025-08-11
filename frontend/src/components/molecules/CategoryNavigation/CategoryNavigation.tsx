import React, { useState, useEffect } from 'react';
import CategoryLink from '../../atoms/CategoryLink/CategoryLink';
import type { CategoryNavigationProps } from './CategoryNavigation.types';
import type { Category } from '../../atoms/CategoryLink/CategoryLink.types';

const CategoryNavigation: React.FC<CategoryNavigationProps> = ({ 
  activeSlug = '',
  showAdditional = false,
  className = '',
  onCategorySelect 
}) => {
  const [categories, setCategories] = useState<{
    priority: Category[];
    additional: Category[];
  }>({ priority: [], additional: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/category/navigation', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const result = await response.json();
      if (result.success) {
        setCategories(result.data);
      } else {
        throw new Error(result.message || 'Failed to load categories');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="flex space-x-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded w-20"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-600 text-sm ${className}`}>
        {error}
      </div>
    );
  }

  const handleCategoryClick = (category: Category) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  return (
    <nav className={`category-navigation ${className}`}>
      {/* Priority Categories (Navbar) */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.priority.map((category) => (
          <CategoryLink
            key={category.slug}
            category={category}
            isActive={activeSlug === category.slug}
            onClick={handleCategoryClick}
          />
        ))}
      </div>

      {/* Additional Categories (expandable) */}
      {showAdditional && categories.additional.length > 0 && (
        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags Populer</h3>
          <div className="flex flex-wrap gap-2">
            {categories.additional.map((category) => (
              <CategoryLink
                key={category.slug}
                category={category}
                isActive={activeSlug === category.slug}
                onClick={handleCategoryClick}
                className="text-xs"
              />
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default CategoryNavigation;