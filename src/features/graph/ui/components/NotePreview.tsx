import React, { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import cn from 'shared/lib/cn';
import type { Note } from 'shared/model/types/layouts';
import useNotePreview from './hooks/useNotePreview';

interface NotePreviewProps {
  note: Note;
  visible: boolean;
  size?: 'md' | 'lg';
  anchorRect?: DOMRect | null;
}

const stripTags = (s = '') =>
  s
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export const NotePreview: React.FC<NotePreviewProps> = ({
  note,
  visible,
  size = 'lg',
  anchorRect = null,
}) => {
  if (!note || !anchorRect || !visible) return null;

  const { wrapperClass, titleClass, textClass, defaults } =
    useNotePreview(size);

  const raw = stripTags(note.payload || '');
  const maxChars = defaults.maxChars;
  const hasContent = raw.length > 0;
  const text = hasContent
    ? raw.length > maxChars
      ? raw.slice(0, maxChars).trim() + '…'
      : raw
    : '';

  const elRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    if (!anchorRect) return;

    const margin = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const estimatedWidth =
      elRef.current?.offsetWidth ?? (size === 'lg' ? 384 : 320);
    const estimatedHeight = elRef.current?.offsetHeight ?? 200;

    let left = Math.round(anchorRect.right + margin);
    let top = Math.round(anchorRect.top);

    if (left + estimatedWidth + margin > viewportWidth) {
      left = Math.round(anchorRect.left - estimatedWidth - margin);
    }

    if (top + estimatedHeight + margin > viewportHeight) {
      top = Math.max(margin, viewportHeight - estimatedHeight - margin);
    }

    setPos({ left, top });
  }, [anchorRect, size]);

  const content = (
    <div
      ref={elRef}
      role='dialog'
      aria-hidden={!visible}
      className={cn(wrapperClass)}
      style={
        pos
          ? { position: 'fixed', left: pos.left, top: pos.top, zIndex: 9999 }
          : { position: 'fixed', zIndex: 9999 }
      }
    >
      <h4 className={titleClass}>{note.title}</h4>
      {hasContent ? (
        <p className={textClass}>{text}</p>
      ) : (
        <p className={cn('muted-text', 'italic', 'text-sm')}>нет содержимого</p>
      )}
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(content, document.body)
    : null;
};

export default NotePreview;
