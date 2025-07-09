
import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
  image?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const filtered = options.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.value.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchQuery, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="flex h-12 w-full items-center justify-between rounded-xl border border-green-500/30 bg-gradient-to-r from-green-900/20 to-emerald-900/20 backdrop-blur-sm px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:border-green-400/50 transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          {selectedOption?.image && (
            <img 
              src={selectedOption.image} 
              alt={selectedOption.label}
              className="w-6 h-6 rounded-full border border-green-500/30"
            />
          )}
          <span className="text-white font-medium">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 text-green-400 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 max-h-80 overflow-hidden rounded-xl border border-green-500/30 bg-gradient-to-b from-gray-900 to-black backdrop-blur-xl shadow-2xl shadow-green-500/10">
          <div className="flex items-center border-b border-green-500/20 px-4 py-3 bg-gradient-to-r from-green-900/10 to-emerald-900/10">
            <Search className="h-4 w-4 text-green-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-400"
            />
          </div>
          <div className="max-h-60 overflow-y-auto scrollbar-hide">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <div className="text-gray-400 text-sm">No tokens found</div>
                <div className="text-gray-500 text-xs mt-1">Try searching with a different term</div>
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-white hover:bg-gradient-to-r hover:from-green-900/20 hover:to-emerald-900/20 focus:bg-gradient-to-r focus:from-green-900/20 focus:to-emerald-900/20 focus:outline-none transition-all duration-150"
                >
                  {option.image && (
                    <img 
                      src={option.image} 
                      alt={option.label}
                      className="w-6 h-6 rounded-full border border-green-500/30"
                    />
                  )}
                  <div className="flex-1 text-left">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-400">{option.value}</div>
                  </div>
                  {option.value === value && (
                    <Check className="h-4 w-4 text-green-400" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
