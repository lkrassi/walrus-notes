import React, { useRef, useState } from 'react';
import { Handle, Position } from 'reactflow';
import cn from 'shared/lib/cn';
import type { Note } from 'shared/model/types/layouts';
import { generateColorFromId } from '../../model/utils/graphUtils';
import NotePreview from './NotePreview';

interface NoteNodeProps {
  data: {
    note: Note;
    onNoteClick?: (noteId: string) => void;
    selected?: boolean;
    isRelatedToSelected?: boolean;
  };
  selected: boolean;
}

export const NoteNodeComponent = ({ data, selected }: NoteNodeProps) => {
  const nodeColor = generateColorFromId(data.note.id);
  const [hover, setHover] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const pointerMoveHandlerRef = useRef<((e: PointerEvent) => void) | null>(
    null
  );
  const pointerUpHandlerRef = useRef<((e: PointerEvent) => void) | null>(null);

  const handleStyle = {
    background: nodeColor,
    border: '2px solid white',
    width: 15,
    height: 15,
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    data.onNoteClick?.(data.note.id);
  };

  return (
    <button
      onDoubleClick={handleDoubleClick}
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
        const upHandler = () => {
          pointerStartRef.current = null;
          setIsDragging(false);
          try {
            const rect = btnRef.current?.getBoundingClientRect() ?? null;
            setAnchorRect(rect);
          } catch (_e) {
          }
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
      onMouseEnter={() => {
        setHover(true);
        const rect = btnRef.current?.getBoundingClientRect() ?? null;
        setAnchorRect(rect);
      }}
      onMouseLeave={() => {
        setHover(false);
        setAnchorRect(null);
      }}
      className={cn(
        'relative',
        'max-w-40',
        'min-w-40',
        'cursor-pointer',
        'rounded-xl',
        'p-2',
        'text-left',
        'transition-all',
        'duration-200',
        selected
          ? 'shadow-lg ring-4 ring-blue-400'
          : 'shadow-md hover:shadow-lg'
      )}
      style={{
        backgroundColor: nodeColor,
        opacity: data.isRelatedToSelected !== false ? 1 : 0.5,
      }}
      title='Двойной клик для открытия заметки'
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
      <NotePreview
        note={data.note}
        visible={hover && !isDragging}
        size='lg'
        anchorRect={anchorRect}
      />
    </button>
  );
};
