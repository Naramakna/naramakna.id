// frontend/src/components/molecules/SearchBar/SearchBar.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { SearchSuggestions } from '../SearchSuggestions';

export interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Cari berita, topik, atau kata kunci...',
  onSearch,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    // Prevent scroll when suggestions are open on mobile
    const preventScroll = (e: TouchEvent) => {
      if (showSuggestions && window.innerWidth <= 768) {
        // Allow scrolling within suggestions container
        const target = e.target as Element;
        if (!target.closest('[data-suggestions]')) {
          e.preventDefault();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: false });
    document.addEventListener('touchmove', preventScroll, { passive: false });
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('touchmove', preventScroll);
    };
  }, [showSuggestions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
    if (onSearch) {
      onSearch('');
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(suggestion);
    }
  };

  const handleSelectCategory = (category: string) => {
    setShowSuggestions(false);
    // Navigate to search with category filter
    window.location.href = `/search?category=${encodeURIComponent(category)}`;
  };

  const handleSelectTag = (tag: string) => {
    setShowSuggestions(false);
    // Navigate to search with tag
    window.location.href = `/search?q=${encodeURIComponent('#' + tag)}`;
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Don't show suggestions on mobile
    if (!isMobile) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow clicks (increased for mobile)
    setTimeout(() => {
      setShowSuggestions(false);
    }, 500);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className={`relative flex items-center transition-all duration-200 ${
          isFocused ? 'ring-2 ring-naramakna-gold ring-opacity-50' : ''
        } rounded-lg border border-gray-300 bg-white`}>
          <Search className="absolute left-3 h-4 w-4 text-gray-400" />
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={`w-full pl-10 pr-10 ${isMobile ? 'py-3 text-base' : 'py-2.5 text-sm'} border-0 rounded-lg focus:outline-none focus:ring-0 placeholder-gray-500`}
            autoComplete="off"
          />
          
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </form>

      {/* Search Suggestions - Only show on desktop */}
      {!isMobile && (
        <SearchSuggestions
          query={query}
          onSelectSuggestion={handleSelectSuggestion}
          onSelectCategory={handleSelectCategory}
          onSelectTag={handleSelectTag}
          isVisible={showSuggestions}
        />
      )}
    </div>
  );
};

export default SearchBar;