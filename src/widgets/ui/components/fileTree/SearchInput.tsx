import { cn } from '@/shared/lib/core';
import { useDebounced } from '@/shared/lib/react/hooks';
import { useLocalization } from '@/widgets/hooks';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

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
        'gap-1.5',
        'px-2',
        'py-0.5',
        'rounded-none',
        'text-xs',
        'w-full',
        'bg-surface-2',
        'border',
        'border-border',
        className || ''
      )}
    >
      <Search className={cn('h-3.5', 'w-3.5', 'text-muted-foreground')} />
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={t ? t('fileTree:searchPlaceholder') : 'Поиск...'}
        className={cn(
          'flex-1',
          'h-5',
          'bg-transparent',
          'outline-none',
          'text-xs',
          'text-foreground'
        )}
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className={cn(
            'text-xl',
            'text-muted-foreground',
            'hover:text-foreground'
          )}
          title={t ? t('fileTree:clearSearch') : 'Очистить'}
        >
          ×
        </button>
      )}
    </div>
  );
};
