import { Suspense, lazy, memo, type FC } from 'react';
import { Skeleton } from 'shared';
import { cn } from 'shared/lib/cn';
import type { PreviewPanelProps } from './types';

const MarkdownPreview = lazy(() =>
  import('../MarkdownPreview').then(m => ({ default: m.MarkdownPreview }))
);

export const PreviewPanel: FC<PreviewPanelProps> = memo(function PreviewPanel({
  payload,
  isEditing,
  isDesktop,
  note,
  layoutId,
  previewRef,
}) {
  return (
    <div
      className={cn(
        'flex-1',
        'h-full',
        'min-h-0',
        isEditing && 'border-border',
        isEditing && 'dark:border-dark-border',
        isEditing && (isDesktop ? 'border-l' : 'border-t'),
        'p-4',
        'bg-transparent',
        !isDesktop && 'basis-1/2',
        !isDesktop && 'min-h-0'
      )}
    >
      <Suspense
        fallback={
          <div className={cn('h-full', 'space-y-3')}>
            <Skeleton className='h-7 w-3/5' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-11/12' />
            <Skeleton className='h-4 w-5/6' />
            <Skeleton className='h-4 w-full' />
          </div>
        }
      >
        <MarkdownPreview
          ref={previewRef}
          content={payload}
          note={note}
          layoutId={layoutId}
          showRelated={!isEditing}
        />
      </Suspense>
    </div>
  );
});
