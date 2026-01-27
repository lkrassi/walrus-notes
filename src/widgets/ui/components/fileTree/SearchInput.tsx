import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from 'shared/lib/cn';
import { useDebounced } from 'widgets/hooks/useDebounced';
import { useLocalization } from '../../../hooks';

type SearchInputProps = {
  onSearchChange: (value: string) => void;
  className?: string;
};

export const SearchInput = ({
  onSearchChange,
  className,
}: SearchInputProps) => {
  const [value, setValue] = useState('');
  const debounced = useDebounced(value, 300);
  const { t } = useLocalization();

  useEffect(() => {
    onSearchChange(debounced.trim());
  }, [debounced, onSearchChange]);

  return (
    <div
      className={cn(
        'flex',
        'items-center',
        'gap-2',
        'px-2',
        'py-1',
        'rounded-md',
        'text-sm',
        'w-full',
        'bg-gray-50',
        'dark:bg-gray-800',
        'border',
        'border-transparent',
        className || ''
      )}
    >
      <Search className={cn('h-8', 'w-4', 'text-gray-400')} />
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={t ? t('fileTree:searchPlaceholder') : 'Поиск...'}
        className={cn(
          'flex-1',
          'bg-transparent',
          'outline-none',
          'text-sm',
          'text-text',
          'dark:text-dark-text'
        )}
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className={cn('text-xl', 'text-gray-400', 'hover:text-gray-600')}
          title={t ? t('fileTree:clearSearch') : 'Очистить'}
        >
          ×
        </button>
      )}
    </div>
  );
};
