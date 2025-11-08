import cn from 'shared/lib/cn';

export const useNotePreview = (size: 'md' | 'lg' = 'lg') => {
  const base = cn('p-4', 'rounded-lg', 'shadow-xl', 'border', 'text-sm');

  const sizes = {
    md: 'w-80 max-w-sm',
    lg: 'w-96 max-w-md',
  } as const;

  const wrapperClass = cn(
    base,
    sizes[size],
    'dark:bg-dark-bg bg-white',
    'border-border dark:border-dark-border'
  );
  const titleClass = cn(
    'font-semibold',
    'mb-2',
    'text-base',
    'text-text dark:text-dark-text',
    'line-clamp-2'
  );
  const textClass = cn(
    'muted-text',
    'leading-relaxed',
    'text-sm',
    'text-text dark:text-dark-text',
    'line-clamp-6'
  );

  const defaults = {
    maxChars: size === 'lg' ? 800 : 400,
  };

  return { wrapperClass, titleClass, textClass, defaults } as const;
};

export default useNotePreview;
