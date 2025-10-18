import React from 'react';
import { Search } from 'lucide-react';
import { Input } from 'shared';
import { useLocalization, useDebounce } from 'widgets/hooks';

interface SearchInputProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  debounceDelay?: number;
}

export const SearchInput = ({
  searchQuery,
  onSearchChange,
  debounceDelay = 300,
}: SearchInputProps) => {
  const { t } = useLocalization();
  const debouncedSearchQuery = useDebounce(searchQuery, debounceDelay);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  // Возвращаем debounced значение для использования в родительском компоненте
  React.useEffect(() => {
    // Можно добавить дополнительную логику для debounced поиска
  }, [debouncedSearchQuery]);

  return (
    <div className='relative'>
      <Search className='text-secondary dark:text-dark-secondary absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2' />
      <Input
        type='text'
        placeholder={t('common:search.placeholder')}
        value={searchQuery}
        onChange={handleInputChange}
        className='w-full pl-10 text-xs'
      />
    </div>
  );
};
