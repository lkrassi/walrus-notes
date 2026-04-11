import { useTabs, type DashboardTab } from '@/entities';
import { GraphHeader } from '@/features/graph';
import { cn } from '@/shared/lib/core';
import { lazy, Suspense, useCallback, useState } from 'react';
import { useGraphNoteOpenContext } from './GraphNoteOpenContext';

const NotesGraph = lazy(() =>
  import('@/features/graph').then(m => ({
    default: m.NotesGraph,
  }))
);

interface GraphTabContentProps {
  activeTab: DashboardTab;
}

export const GraphTabContent = ({ activeTab }: GraphTabContentProps) => {
  const { onNoteOpen, onNoteOpenPinned } = useGraphNoteOpenContext();
  const { updateLayout } = useTabs();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const handleLayoutUpdated = useCallback(
    (updatedLayoutId: string, data?: { title?: string; color?: string }) => {
      updateLayout(updatedLayoutId, {
        title: data?.title,
        color: data?.color,
      });
    },
    [updateLayout]
  );

  const layoutId =
    activeTab.item.type === 'layout'
      ? activeTab.item.id
      : activeTab.item.layoutId;

  const layoutColor =
    activeTab.item.type === 'layout' ? activeTab.item.color : undefined;
  const isAllNotesGraph = activeTab.item.isMain === true;

  if (!layoutId) {
    return (
      <div className={cn('flex', 'h-full', 'items-center', 'justify-center')}>
        <div className={cn('text-center')}>
          <p className={cn('text-secondary', 'dark:text-dark-secondary')}>
            Ошибка: не указан layoutId
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative',
        'flex',
        'h-full',
        'w-full',
        'flex-col',
        'min-h-0',
        'overflow-hidden',
        'bg-bg',
        'dark:bg-dark-bg',
        isFullscreen && 'fixed inset-0 z-100'
      )}
    >
      <GraphHeader
        layoutId={layoutId}
        layoutTitle={activeTab.item.title}
        layoutColor={layoutColor}
        isAllNotes={isAllNotesGraph}
        isMain={activeTab.item.isMain === true}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onLayoutUpdated={handleLayoutUpdated}
      />
      <div className={cn('flex-1', 'min-h-0', 'overflow-hidden')}>
        <Suspense fallback={null}>
          <NotesGraph
            layoutId={layoutId}
            onNoteOpen={onNoteOpen}
            onNoteOpenPinned={onNoteOpenPinned}
            allowNodeDrag={activeTab.item.isMain !== true}
            isMain={activeTab.item.isMain === true}
          />
        </Suspense>
      </div>
    </div>
  );
};
