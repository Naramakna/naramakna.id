// frontend/src/components/molecules/SearchBar/SearchBar.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { SearchSuggestions } from '../SearchSuggestions';

interface SearchBarProps {
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
  const searchRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow clicks
    setTimeout(() => setShowSuggestions(false), 200);
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
            className="w-full pl-10 pr-10 py-2.5 text-sm border-0 rounded-lg focus:outline-none focus:ring-0 placeholder-gray-500"
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

      {/* Search Suggestions */}
      <SearchSuggestions
        query={query}
        onSelectSuggestion={handleSelectSuggestion}
        onSelectCategory={handleSelectCategory}
        onSelectTag={handleSelectTag}
        isVisible={showSuggestions}
      />
    </div>
  );
};