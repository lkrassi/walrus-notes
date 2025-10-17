import { Search } from 'lucide-react';
import { Input } from 'shared';
import { useLocalization } from 'widgets/hooks';

interface SearchInputProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const SearchInput = ({
  searchQuery,
  onSearchChange,
}: SearchInputProps) => {
  const { t } = useLocalization();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

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
