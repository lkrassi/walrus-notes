import { useEffect, useLayoutEffect, useRef } from 'react';
import { useIsDesktop } from 'widgets/hooks';
import { useResizableSplit } from 'widgets/hooks/useResizableSplit';
import { syncScroll } from '../../lib/syncScroll';

import type { Note } from 'shared/model/types/layouts';

import { NoteContentEditorSplit } from './NoteContentEditorSplit';

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
}

export const NoteContent: React.FC<NoteContentProps> = ({
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
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const prevIsEditingRef = useRef<boolean>(isEditing);
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
      const timer = setTimeout(focusAndScrollToEnd, 10);
      return () => clearTimeout(timer);
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

  useLayoutEffect(() => {
    if (!isEditing) return undefined;
    const ta = textareaRef.current;
    const pv = previewRef.current;

    const clean = syncScroll(ta, pv);
    return () => {
      try {
        clean();
      } catch (_e) {}
    };
  }, [isEditing]);

  const wasEditing = prevIsEditingRef.current;
  const openingEditor = !wasEditing && isEditing;
  const closingEditor = wasEditing && !isEditing;
  void closingEditor;

  useEffect(() => {
    prevIsEditingRef.current = isEditing;
  }, [isEditing]);

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
    />
  );
};
