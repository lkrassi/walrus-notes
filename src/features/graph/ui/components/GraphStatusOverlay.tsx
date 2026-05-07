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
        <div className='status-chip text-xs'>
          <Network className='h-3.5 w-3.5' />
          {t('notes:graphStatsNotes', { count: nodesCount })}
        </div>
        <div className='status-chip text-xs'>
          <Grip className='h-3.5 w-3.5' />
          {t('notes:graphStatsLinks', { count: edgesCount })}
        </div>
        {!canEdit && (
          <div className='status-chip text-muted-foreground dark:text-dark-muted-foreground text-[11px]'>
            {t('notes:graphViewOnly')}
          </div>
        )}
      </div>

      {isRefreshing && (
        <div
          className='pointer-events-none absolute top-3 right-3 z-20'
          aria-hidden
        >
          <div className='bg-secondary/70 dark:bg-dark-secondary/70 h-2 w-2 animate-pulse rounded-full' />
        </div>
      )}
    </>
  );
};
