import type { DashboardTab } from '@/entities';
import type { Note } from '@/entities/note';
import { NoteViewer } from '@/features/notes';
import { Skeleton } from '@/shared';
import { cn } from '@/shared/lib/core';

interface NoteTabContentProps {
  activeTab: DashboardTab;
  onNoteUpdated: (noteId: string, updates: Partial<Note>) => void;
  onTabClose: (tabId: string) => void;
}

export const NoteTabContent = ({
  activeTab,
  onNoteUpdated,
  onTabClose,
}: NoteTabContentProps) => {
  const note = activeTab.item.note;

  if (!note) {
    return (
      <div
        className={cn(
          'h-full',
          'border-border dark:border-dark-border',
          'space-y-3 rounded-xl border p-4'
        )}
      >
        <Skeleton className='h-7 w-2/5' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-11/12' />
        <Skeleton className='h-[65%] w-full rounded-xl' />
      </div>
    );
  }

  return (
    <NoteViewer
      key={note.id}
      note={note}
      layoutId={activeTab.item.parentId || note.layoutId || ''}
      openedFromSidebar={!!activeTab.item.openedFromSidebar}
      onNoteUpdated={updatedNote =>
        onNoteUpdated(updatedNote.id, {
          title: updatedNote.title,
          payload: updatedNote.payload,
          draft: updatedNote.draft,
        })
      }
      onNoteDeleted={() => {
        onTabClose(activeTab.id);
      }}
    />
  );
};
