import { cn } from '@/shared/lib/core';
import { Grip, Network } from 'lucide-react';
import type { FC } from 'react';

interface GraphStatusOverlayProps {
  canEdit: boolean;
  isRefreshing: boolean;
  nodesCount: number;
  edgesCount: number;
  t: (key: string, options?: Record<string, unknown>) => string;
}

export const GraphStatusOverlay: FC<GraphStatusOverlayProps> = ({
  canEdit,
  isRefreshing,
  nodesCount,
  edgesCount,
  t,
}) => {
  return (
    <>
      <div className='pointer-events-none absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2'>
        <div className='border-border/75 dark:border-dark-border/70 bg-bg/80 dark:bg-dark-bg/80 text-text dark:text-dark-text inline-flex items-center gap-1.5 border px-2 py-1 text-xs font-medium tracking-widest uppercase'>
          <Network className='h-3.5 w-3.5' />
          {t('notes:graphStatsNotes', { count: nodesCount })}
        </div>
        <div className='border-border/75 dark:border-dark-border/70 bg-bg/80 dark:bg-dark-bg/80 text-text dark:text-dark-text inline-flex items-center gap-1.5 border px-2 py-1 text-xs font-medium tracking-widest uppercase'>
          <Grip className='h-3.5 w-3.5' />
          {t('notes:graphStatsLinks', { count: edgesCount })}
        </div>
        {!canEdit && (
          <div className='border-border/75 dark:border-dark-border/70 bg-bg/80 dark:bg-dark-bg/80 text-muted-foreground dark:text-dark-muted-foreground inline-flex items-center gap-1.5 border px-2 py-1 text-[11px] font-medium tracking-widest uppercase'>
            {t('notes:graphViewOnly')}
          </div>
        )}
      </div>

      {isRefreshing && (
        <div
          className={cn(
            'pointer-events-none',
            'absolute',
            'top-3',
            'right-3',
            'z-20'
          )}
          aria-hidden
        >
          <div className='bg-secondary/70 dark:bg-dark-secondary/70 h-2 w-2 animate-pulse rounded-full' />
        </div>
      )}
    </>
  );
};
