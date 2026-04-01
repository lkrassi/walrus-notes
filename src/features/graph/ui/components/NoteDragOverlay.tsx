import type { Note } from '@/entities/note';
import { cn } from '@/shared/lib/core';
import { memo } from 'react';
import { NotePreview } from './NotePreview';

interface NoteDragOverlayProps {
  note: Note | null;
  isCompact?: boolean;
  previewSize?: {
    width: number;
    height: number;
  } | null;
}

export const NoteDragOverlay = memo(function NoteDragOverlay({
  note,
  isCompact = false,
  previewSize = null,
}: NoteDragOverlayProps) {
  if (!note) return null;

  const dynamicStyle =
    previewSize && previewSize.width > 0 && previewSize.height > 0
      ? {
          width: `${Math.round(previewSize.width)}px`,
          height: `${Math.round(previewSize.height)}px`,
        }
      : isCompact
        ? {
            width: '124px',
            height: '96px',
          }
        : undefined;

  return (
    <div
      className={cn('pointer-events-none')}
      style={dynamicStyle ?? undefined}
    >
      <NotePreview
        note={note}
        isDrag={true}
        isSmall={isCompact}
        className={cn(
          isCompact ? 'h-full w-full max-w-none min-w-0' : '',
          previewSize ? 'max-w-none min-w-0' : ''
        )}
      />
    </div>
  );
});
