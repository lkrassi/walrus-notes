import {
  getLayoutAccess,
  useGetMyLayoutsQuery,
  useGetNotesQuery,
} from '@/entities';
import type { Note } from '@/entities/note';
import { cn } from '@/shared/lib/core';
import { memo } from 'react';
import { useSelector } from 'react-redux';
import { useNoteViewerState } from '../../model';
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
  const resolvedLayoutId = layoutId || note.layoutId || '';
  const { data: layoutsResponse } = useGetMyLayoutsQuery(undefined);
  const { data: notesResponse, isFetching: isNotesFetching } = useGetNotesQuery(
    { layoutId: resolvedLayoutId, page: 1 },
    { skip: !resolvedLayoutId }
  );

  const liveNote = notesResponse?.data?.find(n => n.id === note.id);
  const effectiveNote = liveNote ?? note;

  const storeDraft = useSelector(
    (s: { drafts?: Record<string, string> }) => s.drafts?.[note.id] ?? ''
  );

  const currentLayout = (layoutsResponse?.data || []).find(
    l => l.id === resolvedLayoutId
  );
  const canWrite = currentLayout
    ? getLayoutAccess(currentLayout).canWrite
    : true;

  const hasAnyDraft = !!(
    storeDraft?.trim() ||
    effectiveNote.draft?.trim() ||
    note.draft?.trim()
  );

  const shouldDelayContent =
    canWrite && !!resolvedLayoutId && isNotesFetching && !hasAnyDraft;

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
        )}
      </div>
    </div>
  );
});
