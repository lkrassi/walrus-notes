import { cn } from '@/shared/lib/core';
import { useDebounced } from '@/shared/lib/react/hooks';
import { FormInput } from '@/shared/ui';
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
    <div className={cn('relative w-full', className)}>
      <FormInput
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={t ? t('fileTree:searchPlaceholder') : 'Поиск...'}
        icon={<Search className='text-muted-foreground h-3.5 w-3.5' />}
        className='border-border/85 bg-surface-2/80 h-9 py-0 pr-8 text-sm'
      />
      {value && (
        <button
          type='button'
          onClick={() => setValue('')}
          className='input-clear-btn absolute top-1/2 right-2 -translate-y-1/2'
          title={t ? t('fileTree:clearSearch') : 'Очистить'}
        >
          ×
        </button>
      )}
    </div>
  );
};
