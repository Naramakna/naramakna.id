import React, { useState, useEffect, useCallback } from 'react';
import { useCategories } from '../../../hooks/useCategories';
import { CategoryNewsSection } from '../CategoryNewsSection';
import { AdSection } from '../AdSection';

interface DynamicCategorySectionsProps {
  className?: string;
  minPostCount?: number; // Minimum posts required to show category
  maxSections?: number; // Maximum number of sections to display
  excludeCategories?: string[]; // Categories to exclude (already shown elsewhere)
}

export const DynamicCategorySections: React.FC<DynamicCategorySectionsProps> = ({
  className = '',
  minPostCount = 1, // Show categories with at least 1 post (reduced from 2)
  maxSections = Number.MAX_SAFE_INTEGER, // Unlimited sections for infinite scroll
  excludeCategories = []
}) => {
  // ALL HOOKS MUST BE CALLED FIRST - React Rules of Hooks
  const { categories, loading, error } = useCategories();
  const [visibleSections, setVisibleSections] = useState(10); // Start with 10 sections
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Filter and sort categories - safe to compute even if categories is empty
  const eligibleCategories = categories
    .filter(cat => 
      cat.count >= minPostCount && 
      !excludeCategories.includes(cat.slug)
    )
    .sort((a, b) => b.count - a.count); // Sort by popularity

  // Categories currently visible
  const displayedCategories = eligibleCategories.slice(0, visibleSections);
  const hasMoreCategories = visibleSections < eligibleCategories.length;

  // Infinite scroll handler - ALWAYS define, conditional logic inside
  const handleScroll = useCallback(() => {
    if (isLoadingMore || !hasMoreCategories || loading || error) return;

    const scrollPosition = window.innerHeight + window.scrollY;
    const documentHeight = document.documentElement.offsetHeight;
    
    // Load more when user is near bottom (500px from bottom)
    if (scrollPosition >= documentHeight - 500) {
      setIsLoadingMore(true);
      
      // Simulate loading delay
      setTimeout(() => {
        setVisibleSections(prev => Math.min(prev + 5, eligibleCategories.length)); // Load 5 more sections
        setIsLoadingMore(false);
      }, 800); // 800ms delay for smooth UX
    }
  }, [isLoadingMore, hasMoreCategories, eligibleCategories.length, loading, error]);

  // Add scroll event listener - ALWAYS set up, conditional logic inside callback
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // CONDITIONAL RENDERING AFTER ALL HOOKS
  if (loading) {
    return (
      <div className={`space-y-8 ${className}`}>
        {/* Loading skeleton */}
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-300 rounded w-48 mb-6"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="h-64 bg-gray-300 rounded"></div>
                  <div className="h-64 bg-gray-300 rounded"></div>
                  <div className="h-64 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !categories.length || eligibleCategories.length === 0) {
    return null; // Silent fail, no sections
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {displayedCategories.map((category, index) => (
        <React.Fragment key={category.slug}>
          {/* Category News Section */}
          <CategoryNewsSection 
            category={category.slug}
            categoryDisplayName={category.name}
          />
          
          {/* Insert ad after every 3rd section */}
          {(index + 1) % 3 === 0 && (
            <AdSection position="top" size="regular" />
          )}
        </React.Fragment>
      ))}
      
      {/* Loading indicator when loading more content */}
      {isLoadingMore && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Memuat kategori lainnya...</span>
        </div>
      )}
      
      {/* End indicator when all categories are loaded */}
      {!hasMoreCategories && eligibleCategories.length > 10 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Semua kategori telah dimuat ({eligibleCategories.length} kategori)</p>
        </div>
      )}
      
      {/* Final ad section at the bottom */}
      <AdSection position="bottom" size="header" />
    </div>
  );
};