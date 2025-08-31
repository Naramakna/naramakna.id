import { useState, useEffect } from 'react';
import { articlesAPI, type Article } from '../services/api/articles';

interface UseRelatedArticlesProps {
  currentArticleId?: string;
  category?: string;
  limit?: number;
}

export const useRelatedArticles = ({ 
  currentArticleId, 
  category,
  limit = 6 
}: UseRelatedArticlesProps) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedArticles = async () => {
      try {
        setLoading(true);
        setError(null);

        // First try to get articles from same category if available
        let response;
        if (category) {
          response = await articlesAPI.getFeed({
            limit: limit + 1, // Get one extra to exclude current article if it appears
            category: category,
            sortBy: 'date',
            sortOrder: 'desc'
          });
        } else {
          // Fallback to trending articles
          response = await articlesAPI.getTrending({
            limit: limit + 1
          });
        }

        if (response.success && response.data.posts) {
          // Filter out current article if it appears in results
          const filteredArticles = response.data.posts
            .filter(article => article.id !== currentArticleId)
            .slice(0, limit); // Take only the requested limit

          setArticles(filteredArticles);
        } else {
          throw new Error(response.message || 'Failed to fetch related articles');
        }
      } catch (err) {
        console.error('Failed to fetch related articles:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedArticles();
  }, [currentArticleId, category, limit]);

  return { articles, loading, error };
};