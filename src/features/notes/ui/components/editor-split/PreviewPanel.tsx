import { cn } from '@/shared/lib/core';
import { Suspense, lazy, memo, type FC } from 'react';
import { DraftSyncBadge } from '../DraftSyncBadge';
import type { PreviewPanelProps } from './types';

const MarkdownPreview = lazy(() =>
  import('../MarkdownPreview').then(m => ({
    default: m.MarkdownPreview,
  }))
);

export const PreviewPanel: FC<PreviewPanelProps> = memo(function PreviewPanel({
  payload,
  isEditing,
  isDesktop,
  note,
  layoutId,
  previewRef,
  canWrite,
  hasLocalChanges,
  hasServerDraft,
  isSaving,
  isPending,
  isSynced,
  lastSavedAt,
}) {
  return (
    <div
      className={cn(
        'flex-1',
        'relative',
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
      <div
        className={cn(
          'pointer-events-none',
          'absolute',
          'right-4',
          'top-4',
          'z-10'
        )}
      >
        <DraftSyncBadge
          isEditing={isEditing}
          canWrite={Boolean(canWrite)}
          hasLocalChanges={hasLocalChanges}
          hasServerDraft={hasServerDraft}
          isSaving={isSaving}
          isPending={isPending}
          isSynced={isSynced}
          lastSavedAt={lastSavedAt}
        />
      </div>
      <Suspense fallback={null}>
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
