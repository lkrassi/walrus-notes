import React, { useEffect, useRef } from 'react';
import useResizableSplit from 'widgets/hooks/useResizableSplit';
import { AnimatePresence } from 'framer-motion';
import { syncScroll } from '../../lib/syncScroll';
import { useIsDesktop } from 'widgets/hooks';
import { useGetNotesQuery } from 'app/store/api';

import type { Note } from 'shared/model/types/layouts';

import NoteContentEditorSplit from './NoteContentEditorSplit';
import NoteContentPreview from './NoteContentPreview';

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
  const { leftWidth, onDividerPointerDown, min, max } = useResizableSplit({
    storageKey: 'wn.note.split',
  });
  const isDesktop = useIsDesktop();

  // prevent calling getNotes with empty layoutId
  useGetNotesQuery({ layoutId: layoutId || '' }, { skip: !layoutId });

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

  useEffect(() => {
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

  useEffect(() => {
    prevIsEditingRef.current = isEditing;
  }, [isEditing]);

  return (
    <AnimatePresence mode='wait' initial={false}>
      {isEditing ? (
        <NoteContentEditorSplit
          key='editing'
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
        />
      ) : (
        <NoteContentPreview
          key='preview'
          payload={payload}
          layoutId={layoutId}
          note={note}
          isEditing={isEditing}
          enterFromRight={closingEditor}
        />
      )}
    </AnimatePresence>
  );
};

export default NoteContent;
