import React, { useState, useEffect, useRef } from 'react';

export interface SearchBarProps {
  /**
   * Callback when search is triggered
   */
  onSearch: (query: string) => void;
  
  /**
   * Default search query
   */
  initialValue?: string;
  
  /**
   * Placeholder text
   */
  placeholder?: string;
  
  /**
   * Debounce time in milliseconds
   */
  debounceMs?: number;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * SearchBar component with debounce for filtering data
 */
const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  initialValue = '',
  placeholder = 'Search...',
  debounceMs = 300,
  className = '',
}) => {
  const [query, setQuery] = useState(initialValue);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    return () => {
      // Clear timeout on unmount
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    debounceTimeout.current = setTimeout(() => {
      onSearch(value);
    }, debounceMs);
  };
  
  const handleClear = () => {
    setQuery('');
    onSearch('');
  };
  
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg
          className="w-4 h-4 text-neutral-500"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 20 20"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
          />
        </svg>
      </div>
      
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        className="w-full p-2.5 pl-10 pr-10 bg-white border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-neutral-900"
        placeholder={placeholder}
      />
      
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-500 hover:text-neutral-700 transition-colors"
          aria-label="Clear search"
        >
          <svg
            className="w-4 h-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SearchBar;