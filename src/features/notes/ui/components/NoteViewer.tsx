import type { Note } from 'shared/model/types/layouts';
import { useNoteEditor } from 'widgets/hooks/useNoteEditor';
import { NoteContent } from './NoteContent';
import { NoteHeader } from './NoteHeader';

interface NoteViewerProps {
  note: Note;
  layoutId?: string;
  onNoteUpdated?: (note: Note) => void;
  onNoteDeleted?: (noteId: string) => void;
}

export const NoteViewer = ({ note, onNoteUpdated }: NoteViewerProps) => {
  const {
    isEditing,
    title,
    payload,
    isLoading,
    setTitle,
    setPayload,
    handleEdit,
    handleCancel,
    handleSave,
  } = useNoteEditor(note, onNoteUpdated);

  return (
    <div className='flex h-full w-full flex-col'>
      <NoteHeader
        isEditing={isEditing}
        title={title}
        isLoading={isLoading}
        onTitleChange={setTitle}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      <div className='flex-1 overflow-hidden'>
        <NoteContent
          isEditing={isEditing}
          payload={payload}
          isLoading={isLoading}
          onPayloadChange={setPayload}
        />
      </div>
    </div>
  );
};
