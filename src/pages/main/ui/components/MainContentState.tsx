import { cn } from '@/shared/lib/core';
import { Button, Loader } from '@/shared/ui';
import { FileText, Network, Sparkles } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useMainContentLayoutsData } from '../../model/useMainContentLayoutsData';
import { FolderCard } from './FolderCard';

interface MainContentStateProps {
  variant: 'empty' | 'unsupported' | 'graphUnavailable';
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

  if (variant === 'graphUnavailable') {
    return (
      <div
        className={cn(
          'relative',
          'h-full',
          'overflow-y-auto',
          'bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.14),transparent_42%),linear-gradient(180deg,rgba(11,15,21,0.04),transparent_35%)]',
          'p-4',
          'md:p-6'
        )}
      >
        <div
          className={cn(
            'mx-auto',
            'flex',
            'min-h-full',
            'max-w-2xl',
            'items-center'
          )}
        >
          <div
            className={cn(
              'w-full',
              'rounded-3xl',
              'border',
              'border-border/80',
              'bg-surface/85',
              'p-5',
              'shadow-[0_24px_70px_rgba(0,0,0,0.12)]',
              'backdrop-blur'
            )}
          >
            <div
              className={cn(
                'mb-4',
                'flex',
                'items-center',
                'justify-between',
                'gap-4'
              )}
            >
              <div
                className={cn(
                  'flex',
                  'h-14',
                  'w-14',
                  'items-center',
                  'justify-center',
                  'rounded-2xl',
                  'bg-primary/12',
                  'text-primary'
                )}
              >
                <Network className='h-7 w-7' />
              </div>
              <div
                className={cn(
                  'rounded-full',
                  'border',
                  'border-border/70',
                  'bg-bg/80',
                  'px-3',
                  'py-1.5',
                  'text-xs',
                  'font-medium',
                  'text-muted-foreground'
                )}
              >
                Mobile workspace
              </div>
            </div>

            <h3 className={cn('text-2xl', 'font-semibold', 'tracking-tight')}>
              {t('main:graphUnavailableTitle')}
            </h3>
            <p
              className={cn(
                'mt-2',
                'max-w-xl',
                'text-sm',
                'leading-6',
                'text-muted-foreground'
              )}
            >
              {t('main:graphUnavailableDescription')}
            </p>

            <div
              className={cn('mt-5', 'flex', 'flex-col', 'gap-3', 'sm:flex-row')}
            >
              <Button
                onClick={event =>
                  onCreateClick?.(event as MouseEvent<HTMLElement>)
                }
                variant='submit'
                className={cn('w-full', 'sm:w-auto')}
              >
                {t('main:createNote')}
              </Button>
              <div
                className={cn(
                  'flex',
                  'items-center',
                  'gap-2',
                  'rounded-2xl',
                  'border',
                  'border-border/70',
                  'bg-bg/70',
                  'px-4',
                  'py-3',
                  'text-sm',
                  'text-muted-foreground'
                )}
              >
                <Sparkles className='text-primary h-4 w-4 shrink-0' />
                <span>{t('main:graphUnavailableHint')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'empty' && isMobile) {
    if (isInitialLoading) {
      return (
        <div
          className={cn(
            'h-full overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.12),transparent_40%),linear-gradient(180deg,rgba(11,15,21,0.03),transparent_35%)] p-4'
          )}
        >
          <Loader className='min-h-full' />
        </div>
      );
    }

    return (
      <div
        className={cn(
          'h-full',
          'overflow-y-auto',
          'bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.12),transparent_40%),linear-gradient(180deg,rgba(11,15,21,0.03),transparent_35%)]',
          'p-4',
          'space-y-4',
          'flex',
          'flex-col',
          'justify-center'
        )}
      >
        <div
          className={cn(
            'rounded-3xl',
            'border',
            'border-border/80',
            'bg-surface/85',
            'p-5',
            'shadow-[0_24px_70px_rgba(0,0,0,0.12)]',
            'backdrop-blur'
          )}
        >
          <div
            className={cn(
              'mb-4',
              'flex',
              'items-center',
              'justify-between',
              'gap-4'
            )}
          >
            <div
              className={cn(
                'flex',
                'h-14',
                'w-14',
                'items-center',
                'justify-center',
                'rounded-2xl',
                'bg-primary/12',
                'text-primary'
              )}
            >
              <FileText className='h-7 w-7' />
            </div>
            <div
              className={cn(
                'rounded-full',
                'border',
                'border-border/70',
                'bg-bg/80',
                'px-3',
                'py-1.5',
                'text-xs',
                'font-medium',
                'text-muted-foreground'
              )}
            >
              {t('main:whatToCreate')}
            </div>
          </div>

          <h3 className={cn('text-2xl', 'font-semibold', 'tracking-tight')}>
            {t('main:mobileWorkspaceTitle')}
          </h3>
          <p
            className={cn(
              'mt-2',
              'max-w-xl',
              'text-sm',
              'leading-6',
              'text-muted-foreground'
            )}
          >
            {t('main:mobileWorkspaceDescription')}
          </p>

          <Button
            onClick={event => onCreateClick?.(event as MouseEvent<HTMLElement>)}
            variant='submit'
            className={cn('mt-5', 'w-full')}
          >
            {t('main:whatToCreate')}
          </Button>
        </div>

        {nonMainLayouts.length > 0 ? (
          <div className={cn('space-y-3')}>
            <div
              className={cn('grid', 'grid-cols-1', 'gap-3', 'sm:grid-cols-2')}
            >
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
              'bg-surface/85',
              'text-center',
              'rounded-3xl',
              'border',
              'py-10',
              'px-5'
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
