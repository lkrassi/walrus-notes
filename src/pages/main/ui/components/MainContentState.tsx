import { useGetMyLayoutsQuery } from '@/entities';
import { cn, getLoadingState } from '@/shared/lib/core';
import { Button, Skeleton } from '@/shared/ui';
import { FileText } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderCard } from './FolderCard';

interface MainContentStateProps {
  variant: 'empty' | 'unsupported';
  isMobile?: boolean;
  onCreateClick?: (event: MouseEvent<HTMLElement>) => void;
  onFolderClick?: (layoutId: string, title: string) => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const cardHoverVariants = {
  rest: { scale: 1, boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)' },
  hover: { scale: 1.01, boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)' },
};

export const MainContentState = ({
  variant,
  isMobile = false,
  onCreateClick,
  onFolderClick,
}: MainContentStateProps) => {
  const { t } = useTranslation();
  const { data: layoutsResponse, isLoading: isLayoutsLoading } =
    useGetMyLayoutsQuery(undefined, {
      skip: !isMobile || variant !== 'empty',
    });
  const { isInitialLoading: isInitialLayoutsLoading } = getLoadingState(
    isLayoutsLoading,
    layoutsResponse
  );

  const nonMainLayouts = (layoutsResponse?.data || []).filter(l => !l.isMain);

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

  if (variant === 'empty' && isMobile) {
    if (isInitialLayoutsLoading) {
      return (
        <div
          className={cn(
            'bg-bg',
            'dark:bg-dark-bg',
            'h-full',
            'overflow-y-auto',
            'p-3',
            'space-y-3',
            'flex',
            'flex-col',
            'justify-center'
          )}
        >
          <Skeleton className='h-11 w-full rounded-lg' />
          <div className='space-y-2'>
            <Skeleton className='h-22 w-full rounded-xl' />
            <Skeleton className='h-22 w-full rounded-xl' />
            <Skeleton className='h-22 w-full rounded-xl' />
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
          'space-y-3',
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
            {nonMainLayouts.map(layout => (
              <FolderCard
                key={layout.id}
                layout={layout}
                onFolderClick={onFolderClick}
                itemVariants={itemVariants}
                cardHoverVariants={cardHoverVariants}
              />
            ))}
          </div>
        ) : (
          <div className={cn('text-center', 'py-8')}>
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
        <div className={cn('muted-text', 'mx-auto', 'mb-4', 'h-16', 'w-16')}>
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
        <p className={cn('muted-text')}>{t('main:selectItemDescription')}</p>
      </div>
    </div>
  );
};
