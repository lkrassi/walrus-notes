import { type FC, type RefObject, useEffect, useRef, useState } from 'react';
import { useIsDesktop } from 'widgets/hooks';
import { useAppSelector } from 'widgets/hooks/redux';
import { useResizableSplit } from 'widgets/hooks/useResizableSplit';

import type { Note } from 'shared/model/types/layouts';
import type { AwarenessUser } from '../../model/useYjsCollaboration';
import type { CollaborativeNoteEditorHandle } from './CollaborativeNoteEditor';

import { NoteContentEditorSplit } from './editor-split';

interface NoteContentProps {
  isEditing: boolean;
  payload: string;
  isLoading: boolean;
  onPayloadChange: (payload: string) => void;
  note?: Note;
  layoutId?: string;
  hasLocalChanges?: boolean;
  hasServerDraft?: boolean;
  isSaving?: boolean;
  isPending?: boolean;
  isFullscreen?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onDiscardConfirm?: () => void;
  onInsertImage?: (url: string) => void;
  onExport?: () => void;
  onImport?: (content: string) => void;
  onToggleFullscreen?: () => void;
  enableCollaboration?: boolean;
  onOnlineUsersChange?: (users: Map<number, AwarenessUser>) => void;
  collaborativeEditorRef?: RefObject<CollaborativeNoteEditorHandle | null>;
}

export const NoteContent: FC<NoteContentProps> = ({
  isEditing,
  payload,
  isLoading,
  onPayloadChange,
  note,
  layoutId,
  hasLocalChanges,
  hasServerDraft,
  isSaving,
  isPending,
  isFullscreen,
  onEdit,
  onSave,
  onCancel,
  onDiscardConfirm,
  onInsertImage,
  onExport,
  onImport,
  onToggleFullscreen,
  enableCollaboration = true,
  onOnlineUsersChange,
  collaborativeEditorRef,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const prevIsEditingRef = useRef<boolean>(isEditing);
  const [_onlineUsers, setOnlineUsers] = useState<Map<number, AwarenessUser>>(
    new Map()
  );
  const profile = useAppSelector(state => state.user.profile);
  const userId = profile?.id || '';
  const userName = profile?.username || 'Anonymous';
  const { leftWidth, onDividerPointerDown, min, max, isResizing } =
    useResizableSplit({
      storageKey: 'wn.note.split',
    });
  const isDesktop = useIsDesktop();

  const focusAndScrollToEnd = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.focus();
      const length = textarea.value.length;
      textarea.setSelectionRange(length, length);
      textarea.scrollTop = textarea.scrollHeight;
    }
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      focusAndScrollToEnd();
    }
    return undefined;
  }, [isEditing]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      if (textarea.selectionStart === textarea.value.length) {
        textarea.scrollTop = textarea.scrollHeight;
      }
    }
  }, [payload, isEditing]);

  const wasEditing = prevIsEditingRef.current;
  const openingEditor = !wasEditing && isEditing;
  const closingEditor = wasEditing && !isEditing;
  void closingEditor;

  useEffect(() => {
    prevIsEditingRef.current = isEditing;
  }, [isEditing]);

  const handleOnlineUsersChange = (users: Map<number, AwarenessUser>) => {
    setOnlineUsers(users);
    if (onOnlineUsersChange) {
      onOnlineUsersChange(users);
    }
  };

  return (
    <NoteContentEditorSplit
      payload={payload}
      onPayloadChange={onPayloadChange}
      isLoading={isLoading}
      textareaRef={textareaRef}
      previewRef={previewRef}
      leftWidth={leftWidth}
      min={min}
      max={max}
      onDividerPointerDown={onDividerPointerDown}
      isDesktop={isDesktop}
      note={note}
      layoutId={layoutId}
      enterFromLeft={openingEditor}
      isEditing={isEditing}
      isResizing={isResizing}
      hasLocalChanges={hasLocalChanges}
      hasServerDraft={hasServerDraft}
      isSaving={isSaving}
      isPending={isPending}
      isFullscreen={isFullscreen}
      onEdit={onEdit}
      onSave={onSave}
      onCancel={onCancel}
      onDiscardConfirm={onDiscardConfirm}
      onInsertImage={onInsertImage}
      onExport={onExport}
      onImport={onImport}
      onToggleFullscreen={onToggleFullscreen}
      enableCollaboration={enableCollaboration}
      userId={userId}
      userName={userName}
      onOnlineUsersChange={handleOnlineUsersChange}
      collaborativeEditorRef={collaborativeEditorRef}
    />
  );
};
