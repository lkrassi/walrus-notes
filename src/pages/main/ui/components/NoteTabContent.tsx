import type { DashboardTab } from '@/entities';
import type { Note } from '@/entities/note';
import { NoteViewer } from '@/features/notes';

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
    return null;
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
