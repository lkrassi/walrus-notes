import { useEffect, useRef, useState } from 'react';
import { cn } from 'shared/lib/cn';
import type { Note } from 'shared/model/types/layouts';
import { useExportNote } from 'widgets/hooks/useExportNote';
import { useNoteEditor } from 'widgets/hooks/useNoteEditor';
import { NoteContent } from './NoteContent';
import { NoteHeader } from './NoteHeader';

interface NoteViewerProps {
  note: Note;
  layoutId?: string;
  onNoteUpdated?: (note: Note) => void;
  onNoteDeleted?: (noteId: string) => void;
  openedFromSidebar?: boolean;
}

export const NoteViewer = ({
  note,
  layoutId,
  onNoteUpdated,
  openedFromSidebar: _openedFromSidebar,
}: NoteViewerProps) => {
  const {
    isEditing,
    title,
    payload,
    isLoading,
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

  const { exportNote } = useExportNote();

  const autoOpenedRef = useRef(false);
  useEffect(() => {
    if (autoOpenedRef.current) return;
    if (hasLocalChanges || hasServerDraft) {
      handleEdit();
      autoOpenedRef.current = true;
    }
  }, [hasLocalChanges, hasServerDraft, handleEdit]);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  return (
    <div
      className={cn(
        'relative',
        'flex',
        'h-full',
        'w-full',
        'flex-col',
        'bg-bg',
        'dark:bg-dark-bg',
        isFullscreen && 'fixed inset-0 z-100'
      )}
    >
      {' '}
      <NoteHeader
        isEditing={isEditing}
        title={title}
        isLoading={isLoading}
        hasLocalChanges={hasLocalChanges}
        hasServerDraft={hasServerDraft}
        isSaving={isSaving}
        isPending={isPending}
        onEdit={handleEdit}
        onSave={async (overrideTitle?: string) => {
          await handleSave(overrideTitle);
        }}
        onCancel={async () => {
          await handleCancel();
        }}
        onDiscardConfirm={async () => {
          await handleDiscard();
        }}
        onInsertImage={url => {
          const alt = 'image';
          const snippet = `![${alt}](${url})`;
          const next =
            payload && payload.trim().length > 0
              ? `${payload}\n\n${snippet}`
              : snippet;
          setPayload(next);
        }}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onExport={() => exportNote(title, payload)}
        onImport={content => {
          setPayload(content);
          if (!isEditing) handleEdit();
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
          hasLocalChanges={hasLocalChanges}
          hasServerDraft={hasServerDraft}
          isSaving={isSaving}
          isPending={isPending}
          isFullscreen={isFullscreen}
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
          onInsertImage={url => {
            const alt = 'image';
            const snippet = `![${alt}](${url})`;
            const next =
              payload && payload.trim().length > 0
                ? `${payload}\n\n${snippet}`
                : snippet;
            setPayload(next);
          }}
          onExport={() => exportNote(title, payload)}
          onImport={content => {
            setPayload(content);
            if (!isEditing) handleEdit();
          }}
          onToggleFullscreen={toggleFullscreen}
        />
      </div>
    </div>
  );
};
