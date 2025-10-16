import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Input } from 'shared';
import { useLocalization } from 'widgets/hooks';

interface SearchInputProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  suggestions: string[];
}

export const SearchInput = ({
  searchQuery,
  onSearchChange,
  suggestions,
}: SearchInputProps) => {
  const { t } = useLocalization();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return suggestions
      .filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 10); // Ограничиваем до 10 вариантов
  }, [searchQuery, suggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
    setSelectedSuggestionIndex(-1);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    onSearchChange(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (
          selectedSuggestionIndex >= 0 &&
          selectedSuggestionIndex < filteredSuggestions.length
        ) {
          handleSuggestionSelect(filteredSuggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  return (
    <div className='relative'>
      <Search className='text-secondary dark:text-dark-secondary absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 z-10' />
      <Input
        type='text'
        placeholder={t('common:search.placeholder')}
        value={searchQuery}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        onFocus={() => setShowSuggestions(searchQuery.length > 0)}
        className='pl-10 text-xs w-full'
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className='absolute top-full right-0 left-0 z-10 mt-1 max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800'>
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionSelect(suggestion)}
              className={`w-full px-3 py-2 text-left text-sm dark:text-white ${
                index === selectedSuggestionIndex
                  ? 'bg-blue-100 dark:bg-blue-900'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
