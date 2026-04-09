import type { Note } from '@/entities/note';
import { cn } from '@/shared/lib/core';
import { memo } from 'react';
import { useNoteViewerData, useNoteViewerState } from '../../model';
import { NoteContent } from './NoteContent';
import { NoteHeader } from './NoteHeader';

interface NoteViewerProps {
  note: Note;
  layoutId?: string;
  onNoteUpdated?: (note: Note) => void;
}

export const NoteViewer = memo(function NoteViewer({
  note,
  layoutId,
  onNoteUpdated,
}: NoteViewerProps) {
  const { resolvedLayoutId, effectiveNote, canWrite, shouldDelayContent } =
    useNoteViewerData({
      note,
      layoutId,
    });

  const {
    noteId,
    isEditing,
    title,
    isLoading,
    setPayload,
    handleEdit,
    hasLocalChanges,
    hasServerDraft,
    isSaving,
    isPending,
    isSynced,
    lastSavedAt,
    isFullscreen,
    onlineUsers,
    currentUserId,
    collaborativeEditorRef,
    setOnlineUsers,
    toggleFullscreen,
    handleInsertImage,
    handleExport,
    handleImport,
    handleSaveAction,
    handleCancelAction,
    handleDiscardAction,
    payload,
  } = useNoteViewerState({ note: effectiveNote, canWrite, onNoteUpdated });

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
      {!shouldDelayContent && (
        <NoteHeader
          noteId={noteId}
          isEditing={isEditing}
          title={title}
          isLoading={isLoading}
          hasLocalChanges={hasLocalChanges}
          hasServerDraft={hasServerDraft}
          onEdit={handleEdit}
          onSave={handleSaveAction}
          onCancel={handleCancelAction}
          onDiscardConfirm={handleDiscardAction}
          onInsertImage={handleInsertImage}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onExport={handleExport}
          onImport={handleImport}
          onlineUsers={onlineUsers}
          currentUserId={currentUserId}
          canWrite={canWrite}
        />
      )}
      <div className={cn('flex-1', 'overflow-hidden')}>
        {shouldDelayContent ? (
          <div className={cn('h-full', 'w-full', 'bg-bg', 'dark:bg-dark-bg')} />
        ) : (
          <NoteContent
            isEditing={isEditing}
            payload={payload}
            isLoading={isLoading}
            onPayloadChange={setPayload}
            note={effectiveNote}
            layoutId={resolvedLayoutId}
            canWrite={canWrite}
            hasLocalChanges={hasLocalChanges}
            hasServerDraft={hasServerDraft}
            isSaving={isSaving}
            isPending={isPending}
            isSynced={isSynced}
            lastSavedAt={lastSavedAt}
            isFullscreen={isFullscreen}
            onEdit={handleEdit}
            onSave={handleSaveAction}
            onCancel={handleCancelAction}
            onDiscardConfirm={handleDiscardAction}
            onInsertImage={handleInsertImage}
            onExport={handleExport}
            onImport={handleImport}
            onToggleFullscreen={toggleFullscreen}
            onOnlineUsersChange={setOnlineUsers}
            collaborativeEditorRef={collaborativeEditorRef}
          />
        )}
      </div>
    </div>
  );
});
