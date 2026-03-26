import { getLayoutAccess, useGetMyLayoutsQuery } from '@/entities';
import type { Note } from '@/entities/note';
import { cn } from '@/shared/lib/core';
import { memo } from 'react';
import { useNoteViewerState } from '../../model';
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
  const { data: layoutsResponse } = useGetMyLayoutsQuery(undefined);
  const currentLayout = (layoutsResponse?.data || []).find(l => l.id === layoutId);
  const canWrite = currentLayout ? getLayoutAccess(currentLayout).canWrite : true;
  const {
    noteId,
    isEditing,
    title,
    payload,
    isLoading,
    setPayload,
    handleEdit,
    hasLocalChanges,
    hasServerDraft,
    isSaving,
    isPending,
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
  } = useNoteViewerState({ note, canWrite, onNoteUpdated });

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
        noteId={noteId}
        isEditing={isEditing}
        title={title}
        isLoading={isLoading}
        hasLocalChanges={hasLocalChanges}
        hasServerDraft={hasServerDraft}
        isSaving={isSaving}
        isPending={isPending}
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
      </div>
    </div>
  );
});
