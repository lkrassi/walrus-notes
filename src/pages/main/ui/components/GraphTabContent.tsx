import type { DashboardTab } from '@/entities';
import type { Note } from '@/entities/note';
import { cn } from '@/shared/lib/core';
import { lazy, Suspense } from 'react';

const NotesGraph = lazy(() =>
  import('@/features/graph').then(m => ({
    default: m.NotesGraph,
  }))
);

interface GraphTabContentProps {
  activeTab: DashboardTab;
  onNoteOpen: (noteData: { noteId: string; note: Note }) => void;
}

export const GraphTabContent = ({
  activeTab,
  onNoteOpen,
}: GraphTabContentProps) => {
  const layoutId =
    activeTab.item.type === 'layout'
      ? activeTab.item.id
      : activeTab.item.layoutId;

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
    <Suspense fallback={null}>
      <NotesGraph
        layoutId={layoutId}
        onNoteOpen={onNoteOpen}
        allowNodeDrag={activeTab.item.isMain !== true}
        isMain={activeTab.item.isMain === true}
      />
    </Suspense>
  );
};
