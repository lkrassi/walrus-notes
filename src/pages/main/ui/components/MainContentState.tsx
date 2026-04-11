import { cn } from '@/shared/lib/core';
import { Button, Skeleton } from '@/shared/ui';
import { FileText } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useMainContentLayoutsData } from '../../model/useMainContentLayoutsData';
import { FolderCard } from './FolderCard';

interface MainContentStateProps {
  variant: 'empty' | 'unsupported';
  isMobile?: boolean;
  onCreateClick?: (event: MouseEvent<HTMLElement>) => void;
  onFolderClick?: (layoutId: string, title: string) => void;
}

export const MainContentState = ({
  variant,
  isMobile = false,
  onCreateClick,
  onFolderClick,
}: MainContentStateProps) => {
  const { t } = useTranslation();
  const { data, isInitialLoading } = useMainContentLayoutsData({
    isMobile,
    variant,
  });

  const nonMainLayouts = data?.nonMainLayouts || [];

  if (variant === 'unsupported') {
    return (
      <div className={cn('grid', 'h-full', 'place-items-center', 'p-6')}>
        <div
          className={cn(
            'max-w-md',
            'rounded-xl',
            'border',
            'border-border/80',
            'bg-surface/70',
            'px-6',
            'py-5',
            'text-center'
          )}
        >
          <p className={cn('text-muted-foreground')}>
            Неподдерживаемый тип вкладки
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'empty' && isMobile) {
    if (isInitialLoading) {
      return (
        <div
          className={cn(
            'bg-bg',
            'dark:bg-dark-bg',
            'h-full',
            'overflow-y-auto',
            'p-3',
            'space-y-4',
            'flex',
            'flex-col',
            'justify-center'
          )}
        >
          <div className={cn('rounded-xl', 'border', 'border-border', 'p-4')}>
            <Skeleton className='mb-3 h-6 w-2/3 rounded-md' />
            <Skeleton className='h-4 w-full rounded-md' />
          </div>
          <Skeleton className='h-11 w-full rounded-lg' />
          <div className='grid grid-cols-2 gap-2'>
            <Skeleton className='h-24 w-full rounded-lg' />
            <Skeleton className='h-24 w-full rounded-lg' />
            <Skeleton className='h-24 w-full rounded-lg' />
            <Skeleton className='h-24 w-full rounded-lg' />
          </div>
        </div>
      );
    }

    return (
      <div
        className={cn(
          'bg-bg',
          'dark:bg-dark-bg',
          'h-full',
          'overflow-y-auto',
          'p-3',
          'space-y-4',
          'flex',
          'flex-col',
          'justify-center'
        )}
      >
        <Button
          onClick={event => onCreateClick?.(event as MouseEvent<HTMLElement>)}
          variant='submit'
          className={cn('bg-primary w-full')}
        >
          {t('main:whatToCreate')}
        </Button>

        {nonMainLayouts.length > 0 ? (
          <div className={cn('space-y-2')}>
            <div className={cn('grid', 'grid-cols-2', 'gap-2')}>
              {nonMainLayouts.map(layout => (
                <FolderCard
                  key={layout.id}
                  layout={layout}
                  onFolderClick={onFolderClick}
                />
              ))}
            </div>
          </div>
        ) : (
          <div
            className={cn(
              'border-border',
              'bg-surface',
              'text-center',
              'rounded-xl',
              'border',
              'py-8',
              'px-4'
            )}
          >
            <h3
              className={cn(
                'text-text',
                'dark:text-dark-text',
                'mb-2',
                'text-lg',
                'font-semibold'
              )}
            >
              {t('main:noFolders')}
            </h3>
            <p className={cn('muted-text')}>
              {t('main:createFolderDescription')}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('grid', 'h-full', 'place-items-center', 'p-6')}>
      <div
        className={cn(
          'w-full',
          'max-w-xl',
          'rounded-2xl',
          'border',
          'border-border/80',
          'bg-surface/70',
          'px-8',
          'py-10',
          'text-center'
        )}
      >
        <div
          className={cn(
            'mx-auto',
            'mb-5',
            'flex',
            'h-14',
            'w-14',
            'items-center',
            'justify-center',
            'rounded-xl',
            'bg-primary/12',
            'text-primary'
          )}
        >
          <FileText className='h-7 w-7' />
        </div>
        <h3 className={cn('mb-2', 'text-xl', 'font-semibold')}>
          {t('main:selectFileOrFolder')}
        </h3>
        <p className={cn('text-muted-foreground')}>
          {t('main:selectItemDescription')}
        </p>
      </div>
    </div>
  );
};
