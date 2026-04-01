import type { Note } from '@/entities/note';
import { cn } from '@/shared/lib/core';
import { useIsMobile } from '@/shared/lib/react/hooks';
import { motion } from 'framer-motion';
import { memo, useRef, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { graphTheme } from '../../lib/utils';
import { NotePreview } from './NotePreview';

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

export const NoteNodeComponent = memo(
  function NoteNodeComponent({ data, selected: _selected }: NoteNodeProps) {
    const palette = graphTheme();
    const resolvedColor = data.layoutColor ?? palette.edge;
    const isMobile = useIsMobile();

    const [isDragging, setIsDragging] = useState(false);
    const btnRef = useRef<HTMLButtonElement | null>(null);
    const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
    const pointerMoveHandlerRef = useRef<((e: PointerEvent) => void) | null>(
      null
    );
    const pointerUpHandlerRef = useRef<((e: PointerEvent) => void) | null>(
      null
    );

    const handleSize = isMobile ? 20 : 15;
    const handleStyle = {
      background: resolvedColor,
      border: `2px solid ${palette.surface}`,
      width: handleSize,
      height: handleSize,
      cursor: 'crosshair',
    };

    return (
      <motion.div
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
        className={cn('relative')}
        animate={{
          opacity: data.isRelatedToSelected !== false ? 1 : 0.5,
        }}
        transition={{ duration: 0.18 }}
      >
        <div className={cn('cursor-pointer', 'pointer-events-none')}>
          <NotePreview note={data.note} layoutColor={data.layoutColor} />
        </div>
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
      </motion.div>
    );
  },
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
