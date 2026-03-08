import { cn } from '@/shared/lib/core';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MainContentStateProps {
  variant: 'empty' | 'unsupported';
}

export const MainContentState = ({ variant }: MainContentStateProps) => {
  const { t } = useTranslation();

  if (variant === 'unsupported') {
    return (
      <div className={cn('flex', 'h-full', 'items-center', 'justify-center')}>
        <div className={cn('text-center')}>
          <p className={cn('text-secondary', 'dark:text-dark-secondary')}>
            Неподдерживаемый тип вкладки
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-bg',
        'dark:bg-dark-bg',
        'flex',
        'h-full',
        'items-center',
        'justify-center'
      )}
    >
      <div className={cn('text-center')}>
        <div
          className={cn(
            'text-secondary',
            'dark:text-dark-secondary',
            'mx-auto',
            'mb-4',
            'h-16',
            'w-16'
          )}
        >
          <FileText className='h-15 w-15' />{' '}
        </div>
        <h3
          className={cn(
            'text-text',
            'dark:text-dark-text',
            'mb-2',
            'text-xl',
            'font-semibold'
          )}
        >
          {t('main:selectFileOrFolder')}
        </h3>
        <p className={cn('text-secondary', 'dark:text-dark-secondary')}>
          {t('main:selectItemDescription')}
        </p>
      </div>
    </div>
  );
};
