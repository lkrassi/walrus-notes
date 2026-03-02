import { memo, useEffect, useRef, useState } from 'react';
import { cn } from 'shared/lib/cn';
import type { Note } from 'shared/model/types/layouts';
import { useAppSelector } from 'widgets/hooks/redux';
import { useExportNote } from 'widgets/hooks/useExportNote';
import { useNoteEditor } from 'widgets/hooks/useNoteEditor';
import type { AwarenessUser } from '../../model/useYjsCollaboration';
import type { CollaborativeNoteEditorHandle } from './CollaborativeNoteEditor';
import { NoteContent } from './NoteContent';
import { NoteHeader } from './NoteHeader';

interface NoteViewerProps {
  note: Note;
  layoutId?: string;
  onNoteUpdated?: (note: Note) => void;
  onNoteDeleted?: (noteId: string) => void;
  openedFromSidebar?: boolean;
}

export const NoteViewer = memo(function NoteViewer({
  note,
  layoutId,
  onNoteUpdated,
  openedFromSidebar: _openedFromSidebar,
}: NoteViewerProps) {
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
  const collaborativeEditorRef = useRef<CollaborativeNoteEditorHandle>(null);

  const autoOpenedRef = useRef(false);
  useEffect(() => {
    autoOpenedRef.current = false;
  }, [note.id]);

  useEffect(() => {
    if (autoOpenedRef.current) return;
    if (hasLocalChanges || hasServerDraft) {
      handleEdit();
      autoOpenedRef.current = true;
    }
  }, [hasLocalChanges, hasServerDraft, handleEdit]);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Map<number, AwarenessUser>>(
    new Map()
  );

  const profile = useAppSelector(state => state.user.profile);
  const currentUserId = profile?.id || '';

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
        noteId={note.id}
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

          if (collaborativeEditorRef.current) {
            collaborativeEditorRef.current.insertText(snippet);
          } else {
            setPayload(prev =>
              prev && prev.trim().length > 0 ? `${prev}\n\n${snippet}` : snippet
            );
          }
        }}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onExport={() => exportNote(title, payload)}
        onImport={content => {
          setPayload(() => content);
          if (!isEditing) handleEdit();
        }}
        onlineUsers={onlineUsers}
        currentUserId={currentUserId}
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

            if (collaborativeEditorRef.current) {
              collaborativeEditorRef.current.insertText(snippet);
            } else {
              setPayload(prev =>
                prev && prev.trim().length > 0
                  ? `${prev}\n\n${snippet}`
                  : snippet
              );
            }
          }}
          onExport={() => exportNote(title, payload)}
          onImport={content => {
            setPayload(() => content);
            if (!isEditing) handleEdit();
          }}
          onToggleFullscreen={toggleFullscreen}
          onOnlineUsersChange={setOnlineUsers}
          collaborativeEditorRef={collaborativeEditorRef}
        />
      </div>
    </div>
  );
});
