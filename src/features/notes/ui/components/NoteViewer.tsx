import cn from 'shared/lib/cn';
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

export const NoteViewer = ({
  note,
  layoutId,
  onNoteUpdated,
}: NoteViewerProps) => {
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
    hasLocalChanges,
    hasServerDraft,
    isSaving,
    isPending,
    handleDiscard,
  } = useNoteEditor(note, onNoteUpdated);

  return (
    <div
      className={cn(
        'relative',
        'flex',
        'h-full',
        'w-full',
        'flex-col',
        'bg-gradient'
      )}
    >
      <NoteHeader
        isEditing={isEditing}
        title={title}
        isLoading={isLoading}
        hasLocalChanges={hasLocalChanges}
        hasServerDraft={hasServerDraft}
        isSaving={isSaving}
        isPending={isPending}
        onTitleChange={setTitle}
        onEdit={handleEdit}
        onSave={async () => {
          await handleSave();
        }}
        onCancel={async () => {
          await handleCancel();
        }}
        onDiscardConfirm={async () => {
          await handleDiscard();
        }}
      />

      <div className={cn('flex-1', 'overflow-hidden')}>
        <NoteContent
          isEditing={isEditing}
          payload={payload}
          isLoading={isLoading}
          onPayloadChange={setPayload}
          note={note}
          layoutId={layoutId}
        />
      </div>
    </div>
  );
};
