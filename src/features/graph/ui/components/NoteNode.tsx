import { motion } from 'framer-motion';
import React, { useRef, useState } from 'react';
import { Handle, Position } from 'reactflow';
import cn from 'shared/lib/cn';
import type { Note } from 'shared/model/types/layouts';
import { useIsMobile } from 'widgets/hooks';

interface NoteNodeProps {
  data: {
    note: Note;
    onNoteClick?: (noteId: string) => void;
    selected?: boolean;
    layoutColor?: string;
    isRelatedToSelected?: boolean;
  };
  selected: boolean;
}

const NoteNodeInner = ({ data, selected: _selected }: NoteNodeProps) => {
  const resolvedColor = data.layoutColor ?? '#6b7280';
  const isMobile = useIsMobile();

  const [isDragging, setIsDragging] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const pointerMoveHandlerRef = useRef<((e: PointerEvent) => void) | null>(
    null
  );
  const pointerUpHandlerRef = useRef<((e: PointerEvent) => void) | null>(null);

  const handleSize = isMobile ? 20 : 15;
  const handleStyle = {
    background: resolvedColor,
    border: '2px solid white',
    width: handleSize,
    height: handleSize,
    cursor: 'crosshair',
  };

  return (
    <motion.button
      onPointerDown={e => {
        pointerStartRef.current = { x: e.clientX, y: e.clientY };

        const moveHandler = (moveEvent: PointerEvent) => {
          if (!pointerStartRef.current) return;
          const dx = Math.abs(moveEvent.clientX - pointerStartRef.current.x);
          const dy = Math.abs(moveEvent.clientY - pointerStartRef.current.y);
          const threshold = 6;
          if (dx > threshold || dy > threshold) {
            setIsDragging(true);
          }
        };
        const upHandler = (upEvent: PointerEvent) => {
          if (pointerStartRef.current) {
            const dx = Math.abs(upEvent.clientX - pointerStartRef.current.x);
            const dy = Math.abs(upEvent.clientY - pointerStartRef.current.y);
            const threshold = 6;
            const moved = dx > threshold || dy > threshold;
            if (!isDragging && !moved) {
              data.onNoteClick?.(data.note.id);
            }
          }

          pointerStartRef.current = null;
          setIsDragging(false);
          try {
            try {
              btnRef.current?.getBoundingClientRect();
            } catch (_e) {}
          } catch (_e) {}
          if (pointerMoveHandlerRef.current)
            window.removeEventListener(
              'pointermove',
              pointerMoveHandlerRef.current
            );
          if (pointerUpHandlerRef.current)
            window.removeEventListener(
              'pointerup',
              pointerUpHandlerRef.current
            );
          pointerMoveHandlerRef.current = null;
          pointerUpHandlerRef.current = null;
        };

        pointerMoveHandlerRef.current = moveHandler;
        pointerUpHandlerRef.current = upHandler;
        window.addEventListener('pointermove', moveHandler);
        window.addEventListener('pointerup', upHandler);
      }}
      ref={btnRef}
      className={cn(
        'relative',
        'max-w-40',
        'min-w-40',
        'cursor-pointer',
        'rounded-xl',
        'p-2',
        'text-left',
        'bg-white',
        'text-black',
        'dark:bg-gray-800',
        'dark:text-white',
        'border-2'
      )}
      style={{
        borderColor: resolvedColor,
      }}
      title='Клик по ЛКМ для открытия заметки'
      animate={{
        opacity: data.isRelatedToSelected !== false ? 1 : 0.5,
      }}
      transition={{ duration: 0.18 }}
    >
      <Handle
        type='source'
        position={Position.Right}
        id='source-right'
        style={handleStyle}
        className={cn('z-10')}
      />
      <Handle
        type='source'
        position={Position.Left}
        id='source-left'
        style={handleStyle}
        className={cn('z-10')}
      />
      <Handle
        type='source'
        position={Position.Top}
        id='source-top'
        style={handleStyle}
        className={cn('z-10')}
      />
      <Handle
        type='source'
        position={Position.Bottom}
        id='source-bottom'
        style={handleStyle}
        className={cn('z-10')}
      />

      <Handle
        type='target'
        position={Position.Right}
        id='target-right'
        style={handleStyle}
        className={cn('z-10')}
      />
      <Handle
        type='target'
        position={Position.Left}
        id='target-left'
        style={handleStyle}
        className={cn('z-10')}
      />
      <Handle
        type='target'
        position={Position.Top}
        id='target-top'
        style={handleStyle}
        className={cn('z-10')}
      />
      <Handle
        type='target'
        position={Position.Bottom}
        id='target-bottom'
        style={handleStyle}
        className={cn('z-10')}
      />

      <h3
        className={cn(
          'm-3',
          'line-clamp-2',
          'overflow-hidden',
          'text-center',
          'font-semibold',
          'text-ellipsis'
        )}
      >
        {data.note.title}
      </h3>
    </motion.button>
  );
};

export const NoteNodeComponent = React.memo(
  NoteNodeInner,
  (prev: NoteNodeProps, next: NoteNodeProps) => {
    if (prev.selected !== next.selected) return false;
    if (prev.data.note?.id !== next.data.note?.id) return false;
    if (prev.data.isRelatedToSelected !== next.data.isRelatedToSelected)
      return false;
    const prevColor = prev.data.layoutColor ?? null;
    const nextColor = next.data.layoutColor ?? null;
    if (prevColor !== nextColor) return false;
    return true;
  }
);
