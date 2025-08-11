import { useState, useEffect, useCallback } from 'react';
import { articlesAPI } from '../services/api/articles';
import type { Article } from '../services/api/articles';

interface UseTrendingParams {
  limit?: number;
  category?: string;
  type?: string;
}

interface TrendingResponse {
  posts: Article[];
  totalItems: number;
  criteria: string;
}

interface UseTrendingResult {
  data: TrendingResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useTrending = (params: UseTrendingParams = {}): UseTrendingResult => {
  const [data, setData] = useState<TrendingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract individual params to avoid object reference issues
  const { limit, category, type } = params;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await articlesAPI.getTrending({ limit, category, type });
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || 'Failed to fetch trending content');
        console.warn('Trending API Error:', result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Trending fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [limit, category, type]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh
  };
};