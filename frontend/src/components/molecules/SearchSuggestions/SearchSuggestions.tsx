import React, { useState, useEffect, useCallback } from 'react';
import { Search, Hash, Tag, Clock } from 'lucide-react';
import { buildApiUrl } from '../../../config/api';

interface SearchSuggestionsProps {
  query: string;
  onSelectSuggestion: (suggestion: string) => void;
  onSelectCategory: (category: string) => void;
  onSelectTag: (tag: string) => void;
  className?: string;
  isVisible?: boolean;
}

interface SuggestionData {
  suggestions: string[];
  categories: Array<{ name: string; slug: string; count: number; total_views: number }>;
  tags: Array<{ name: string; slug: string; count: number; total_views: number }>;
}

// Helper function to format views
const formatViews = (views: number): string => {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M views`;
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K views`;
  } else {
    return `${views} views`;
  }
};

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  query,
  onSelectSuggestion,
  onSelectCategory,
  onSelectTag,
  className = '',
  isVisible = true
}) => {
  const [suggestions, setSuggestions] = useState<SuggestionData>({
    suggestions: [],
    categories: [],
    tags: []
  });
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const recent = localStorage.getItem('naramakna_search_history');
    if (recent) {
      setRecentSearches(JSON.parse(recent));
    }
  }, []);

  // Fetch suggestions from API
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions({ suggestions: [], categories: [], tags: [] });
      return;
    }

    setLoading(true);
    try {
      const url = buildApiUrl(`content/search/suggestions?query=${encodeURIComponent(searchQuery)}&limit=20`);
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSuggestions(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced suggestions fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, fetchSuggestions]);
  
  if (!isVisible || (!query && recentSearches.length === 0)) {
    return null;
  }

  const hasAnySuggestions = 
    suggestions.suggestions.length > 0 || 
    suggestions.categories.length > 0 || 
    suggestions.tags.length > 0;

  return (
    <div data-suggestions
         className={`absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-xl z-[9999] max-h-80 md:max-h-96 overflow-y-auto ${className}`}
         style={{ 
           maxHeight: window.innerWidth <= 768 ? '60vh' : window.innerHeight < 700 ? '50vh' : '24rem',
           boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)',
           marginTop: '2px'
         }}>
      {/* Recent searches when no query */}
      {!query && recentSearches.length > 0 && (
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Clock size={14} />
            <span>Pencarian terakhir</span>
          </div>
          {recentSearches.slice(0, 5).map((search, index) => (
            <button
              key={index}
              onClick={() => onSelectSuggestion(search)}
              className="block w-full text-left px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded transition-colors touch-manipulation"
            >
              {search}
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {loading && query && (
        <div className="p-4 text-center text-gray-500">
          <div className="animate-spin w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full mx-auto"></div>
          <span className="text-sm mt-2">Mencari...</span>
        </div>
      )}

      {/* No suggestions found */}
      {!loading && query && !hasAnySuggestions && (
        <div className="p-4 text-center text-gray-500">
          <Search size={20} className="mx-auto mb-2 text-gray-400" />
          <p className="text-sm">Tidak ada saran untuk "{query}"</p>
        </div>
      )}

      {/* Article suggestions */}
      {!loading && suggestions.suggestions.length > 0 && (
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Search size={14} />
            <span>Artikel</span>
          </div>
          {suggestions.suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSelectSuggestion(suggestion)}
              className="block w-full text-left px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded transition-colors truncate touch-manipulation"
              title={suggestion}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Category suggestions */}
      {!loading && suggestions.categories.length > 0 && (
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Hash size={14} />
            <span>Kategori</span>
          </div>
          {suggestions.categories.map((category, index) => (
            <button
              key={index}
              onClick={() => onSelectCategory(category.slug)}
              className="flex items-center justify-between w-full text-left px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded transition-colors touch-manipulation"
            >
              <span className="font-medium">{category.name}</span>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {category.total_views ? formatViews(category.total_views) : `${category.count || 0} posts`}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Tag suggestions */}
      {!loading && suggestions.tags.length > 0 && (
        <div className="p-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Tag size={14} />
            <span>Tag</span>
          </div>
          {suggestions.tags.map((tag, index) => (
            <button
              key={index}
              onClick={() => onSelectTag(tag.slug)}
              className="flex items-center justify-between w-full text-left px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 rounded transition-colors touch-manipulation"
            >
              <div>
                <span className="text-yellow-500">#</span>
                <span>{tag.name}</span>
              </div>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {tag.total_views ? formatViews(tag.total_views) : `${tag.count || 0} posts`}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Search action */}
      {query && (
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={() => onSelectSuggestion(query)}
            className="flex items-center gap-2 w-full px-3 py-3 text-sm text-yellow-500 hover:bg-yellow-500 hover:text-white active:bg-yellow-600 rounded transition-colors touch-manipulation"
          >
            <Search size={14} />
            <span>Cari "{query}"</span>
          </button>
        </div>
      )}
    </div>
  );
};
