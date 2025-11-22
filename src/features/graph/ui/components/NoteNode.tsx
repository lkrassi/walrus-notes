import { motion } from 'framer-motion';
import React, { useRef, useState } from 'react';
import { Handle, Position } from 'reactflow';
import cn from 'shared/lib/cn';
import type { Note } from 'shared/model/types/layouts';
import { generateColorFromId } from '../../model/utils/graphUtils';

interface NoteNodeProps {
  data: {
    note: Note;
    onNoteClick?: (noteId: string) => void;
    selected?: boolean;
    isRelatedToSelected?: boolean;
    nodeColor?: string;
  };
  selected: boolean;
}

const NoteNodeInner = ({ data, selected }: NoteNodeProps) => {
  const resolvedColor = data.nodeColor || generateColorFromId(data.note.id);
  const [hover, setHover] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const pointerMoveHandlerRef = useRef<((e: PointerEvent) => void) | null>(
    null
  );
  const pointerUpHandlerRef = useRef<((e: PointerEvent) => void) | null>(null);

  const handleStyle = {
    background: resolvedColor,
    border: '2px solid white',
    width: 15,
    height: 15,
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
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn(
        'relative',
        'max-w-40',
        'min-w-40',
        'cursor-pointer',
        'rounded-xl',
        'p-2',
        'text-left'
      )}
      style={{ backgroundColor: resolvedColor }}
      title='Клик по ЛКМ для открытия заметки'
      whileHover={{ scale: 1.03 }}
      animate={{
        opacity: data.isRelatedToSelected !== false ? 1 : 0.5,
        boxShadow: selected
          ? '0 20px 40px rgba(59,130,246,0.35)'
          : hover
            ? '0 10px 25px rgba(0,0,0,0.12)'
            : '0 4px 8px rgba(0,0,0,0.08)',
      }}
      transition={{ duration: 0.18 }}
    >
      <Handle
        type='source'
        position={Position.Right}
        id='source-right'
        style={handleStyle}
      />
      <Handle
        type='source'
        position={Position.Left}
        id='source-left'
        style={handleStyle}
      />
      <Handle
        type='source'
        position={Position.Top}
        id='source-top'
        style={handleStyle}
      />
      <Handle
        type='source'
        position={Position.Bottom}
        id='source-bottom'
        style={handleStyle}
      />

      <Handle
        type='target'
        position={Position.Right}
        id='target-right'
        style={handleStyle}
      />
      <Handle
        type='target'
        position={Position.Left}
        id='target-left'
        style={handleStyle}
      />
      <Handle
        type='target'
        position={Position.Top}
        id='target-top'
        style={handleStyle}
      />
      <Handle
        type='target'
        position={Position.Bottom}
        id='target-bottom'
        style={handleStyle}
      />

      <h3
        className={cn(
          'text-dark-text',
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
    if (prev.data.nodeColor !== next.data.nodeColor) return false;
    if (prev.data.note?.id !== next.data.note?.id) return false;
    if (prev.data.isRelatedToSelected !== next.data.isRelatedToSelected)
      return false;
    return true;
  }
);
