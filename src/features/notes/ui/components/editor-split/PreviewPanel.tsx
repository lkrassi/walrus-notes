import { Suspense, lazy, memo, type FC } from 'react';
import { Loader } from 'shared';
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
          <div
            className={cn('flex', 'items-center', 'justify-center', 'h-full')}
          >
            <Loader size='md' />
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
