// src/components/blocks/SearchBlock/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import { SearchSuggestions } from '../../molecules/SearchSuggestions';
import { ArticleCard } from '../../molecules/ArticleCard/ArticleCard';
import { LoadingSpinner } from '../../atoms/LoadingSpinner/LoadingSpinner';
import { articlesAPI } from '../../../services/api/articles';
import { useCategories } from '../../../hooks/useCategories';
import type { Article } from '../../../types/article';

const SearchBlock: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    sortBy: 'relevance' as const
  });
  const [isFocused, setIsFocused] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const { categories } = useCategories();

  // Handle search
  const performSearch = async (query: string, searchFilters = filters) => {
    if (!query.trim()) {
      setResults([]);
      setTotalResults(0);
      return;
    }

    setLoading(true);
    try {
      const params = {
        search: query,
        page: 1,
        limit: 12,
        ...searchFilters
      };

      const response = await articlesAPI.getFeed(params);
      
      if (response.success) {
        setResults(response.data.posts);
        setTotalResults(response.data.pagination?.totalItems || 0);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change with debouncing
  useEffect(() => {
    if (searchQuery.trim() && showModal) {
      const timer = setTimeout(() => {
        performSearch(searchQuery);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, showModal, filters]);

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
  };

  // Handle search submit
  const handleSearch = (query: string) => {
    if (query.trim()) {
      setSearchQuery(query);
      setShowModal(true);
      performSearch(query);
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    if (searchQuery) {
      performSearch(searchQuery, updatedFilters);
    }
  };

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowModal(false);
        setIsFocused(false);
      }
    };

    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  const handleSelectSuggestion = (suggestion: string) => {
    handleSearch(suggestion);
  };

  const handleSelectCategory = (category: string) => {
    // Set category filter and open modal with current search
    const newFilters = { ...filters, category };
    setFilters(newFilters);
    setShowModal(true);
    setIsFocused(false);
    
    if (searchQuery) {
      performSearch(searchQuery, newFilters);
    } else {
      // If no search query, search for the category
      setSearchQuery(category);
      performSearch(category, newFilters);
    }
  };

  const handleSelectTag = (tag: string) => {
    // Search with hashtag and open modal
    const hashtagQuery = '#' + tag;
    setSearchQuery(hashtagQuery);
    setShowModal(true);
    setIsFocused(false);
    performSearch(hashtagQuery);
  };

  return (
    <>
      <div className="flex items-center">
        {/* Desktop Search */}
        <div className="hidden md:block w-80">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari artikel, berita, video..."
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                // Delay to allow click on suggestions
                setTimeout(() => setIsFocused(false), 200);
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(searchQuery);
                }
              }}
              className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="w-5 h-5 text-gray-500" />
            </div>
            
            {/* Search Suggestions */}
            {isFocused && (
              <div className="absolute top-full left-0 right-0 z-50">
                <SearchSuggestions
                  query={searchQuery}
                  onSelectSuggestion={handleSelectSuggestion}
                  onSelectCategory={handleSelectCategory}
                  onSelectTag={handleSelectTag}
                  isVisible={isFocused}
                />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Toggle */}
        <button 
          onClick={() => setShowModal(true)}
          className="md:hidden p-2 text-gray-700 hover:text-yellow-500 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Search Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-4 md:pt-20">
          <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Cari artikel, berita, video..."
                    value={searchQuery}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        performSearch(searchQuery);
                      }
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${
                    showFilters ? 'bg-yellow-500 text-white border-yellow-500' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Filter size={16} />
                  <span className="hidden sm:inline">Filter</span>
                  <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
                
                <button
                  onClick={() => setShowModal(false)}
                  className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange({ type: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="">Semua Konten</option>
                    <option value="post">Artikel</option>
                    <option value="youtube_video">Video YouTube</option>
                    <option value="tiktok_video">Video TikTok</option>
                  </select>

                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange({ category: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="">Semua Kategori</option>
                    {categories.slice(0, 15).map((category) => (
                      <option key={category.slug} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="relevance">Relevansi</option>
                    <option value="date">Terbaru</option>
                    <option value="views">Terpopuler</option>
                  </select>
                </div>
              )}

              {/* Search Stats */}
              {searchQuery && (
                <div className="mt-4 text-sm text-gray-600">
                  {loading ? 'Mencari...' : `${totalResults} hasil untuk "${searchQuery}"`}
                </div>
              )}
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {loading && (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              )}

              {!loading && searchQuery && results.length === 0 && (
                <div className="text-center py-8">
                  <Search size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Tidak ada hasil untuk "{searchQuery}"</p>
                </div>
              )}

              {!loading && results.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      showExcerpt={true}
                      className="h-full"
                      onClick={() => setShowModal(false)}
                    />
                  ))}
                </div>
              )}

              {!loading && !searchQuery && (
                <div className="text-center py-8">
                  <Search size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Mulai mengetik untuk mencari...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchBlock;