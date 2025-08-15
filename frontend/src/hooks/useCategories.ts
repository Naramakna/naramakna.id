import { useState, useEffect, useCallback } from 'react';
import { articlesAPI } from '../services/api/articles';
import type { Category } from '../services/api/articles';

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get ONLY main categories for homepage sections
      const response = await articlesAPI.getCategories({
        limit: 50,      // Reasonable limit for main categories
        minCount: 0,    // Include categories with at least 0 posts
        mainCategoriesOnly: true  // Filter to main categories only
      });
      
      if (response.success) {
        setCategories(response.data.categories);
      } else {
        setError(response.message || 'Failed to fetch categories');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const refetch = useCallback(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch
  };
};