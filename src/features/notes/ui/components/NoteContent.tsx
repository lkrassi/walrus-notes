import React, { useEffect, useRef, useLayoutEffect } from 'react';
import useResizableSplit from 'widgets/hooks/useResizableSplit';
import {} from /* AnimatePresence */ 'framer-motion';
import { syncScroll } from '../../lib/syncScroll';
import { useIsDesktop } from 'widgets/hooks';

import type { Note } from 'shared/model/types/layouts';

import NoteContentEditorSplit from './NoteContentEditorSplit';
// NoteContentPreview is no longer used because the editor split handles both modes
// keep the file in tree for reference
// import NoteContentPreview from './NoteContentPreview';

interface NoteContentProps {
  isEditing: boolean;
  payload: string;
  isLoading: boolean;
  onPayloadChange: (payload: string) => void;
  note?: Note;
  layoutId?: string;
}

export const NoteContent: React.FC<NoteContentProps> = ({
  isEditing,
  payload,
  isLoading,
  onPayloadChange,
  note,
  layoutId,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const prevIsEditingRef = useRef<boolean>(isEditing);
  const { leftWidth, onDividerPointerDown, min, max, isResizing } =
    useResizableSplit({
      storageKey: 'wn.note.split',
    });
  const isDesktop = useIsDesktop();

  // Note: fetching notes is handled by parent components (file tree / list).
  // Avoid calling `useGetNotesQuery` here to prevent duplicate requests when
  // the parent already loaded notes for the current `layoutId`.

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
    />
  );
};

export default NoteContent;
