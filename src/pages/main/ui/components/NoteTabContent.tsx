import type { DashboardTab } from '@/entities';
import type { Note } from '@/entities/note';
import { NoteViewer } from '@/features/notes';

interface NoteTabContentProps {
  activeTab: DashboardTab;
  onNoteUpdated: (noteId: string, updates: Partial<Note>) => void;
}

export const NoteTabContent = ({
  activeTab,
  onNoteUpdated,
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
      onNoteUpdated={updatedNote =>
        onNoteUpdated(updatedNote.id, {
          title: updatedNote.title,
          payload: updatedNote.payload,
          draft: updatedNote.draft,
        })
      }
    />
  );
};
