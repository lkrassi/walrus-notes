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
        'h-9',
        'w-full',
        'items-center',
        'gap-2',
        'rounded-lg',
        'border',
        'border-border/85',
        'bg-surface-2/80',
        'px-2.5',
        'text-xs',
        className || ''
      )}
    >
      <Search className={cn('h-3.5', 'w-3.5', 'text-muted-foreground')} />
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={t ? t('fileTree:searchPlaceholder') : 'Поиск...'}
        className={cn(
          'h-full',
          'flex-1',
          'bg-transparent',
          'text-sm',
          'text-foreground',
          'outline-none',
          'placeholder:text-muted-foreground'
        )}
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className={cn(
            'inline-flex',
            'h-5',
            'w-5',
            'items-center',
            'justify-center',
            'rounded-sm',
            'text-sm',
            'text-muted-foreground',
            'transition-colors',
            'hover:bg-interactive-hover',
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
