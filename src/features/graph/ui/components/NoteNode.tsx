import type { Note } from '@/entities/note';
import { cn } from '@/shared/lib/core';
import { useIsMobile } from '@/shared/lib/react/hooks';
import { motion } from 'framer-motion';
import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { graphTheme } from '../../lib/utils';
import { NotePreview } from './NotePreview';

interface NoteNodeProps {
  data: {
    note: Note;
    selected?: boolean;
    layoutColor?: string;
    isRelatedToSelected?: boolean;
  };
  selected: boolean;
}

export const NoteNodeComponent = memo(
  function NoteNodeComponent({ data, selected }: NoteNodeProps) {
    const palette = graphTheme();
    const resolvedColor = data.layoutColor ?? palette.edge;
    const isMobile = useIsMobile();
    const isActive = selected || !!data.selected;

    const handleSize = isMobile ? 18 : 12;
    const handleStyle = {
      background: resolvedColor,
      width: handleSize,
      height: handleSize,
      cursor: 'crosshair',
      opacity: isActive ? 1 : 0.78,
    };

    return (
      <motion.div
        className={cn('relative', 'group')}
        animate={{
          opacity: data.isRelatedToSelected !== false ? 1 : 0.5,
          scale: isActive ? 1.02 : 1,
        }}
        transition={{ duration: 0 }}
      >
        {isActive && (
          <div
            className={cn(
              'g-primary/10 pointer-events-none absolute -inset-1 z-0'
            )}
            aria-hidden
          />
        )}

        <div
          className={cn(
            'pointer-events-none relative z-10 cursor-pointer rounded-none',
            isActive && 'ring-primary/30 ring-2 ring-offset-0'
          )}
        >
          <NotePreview note={data.note} layoutColor={data.layoutColor} />
        </div>

        <Handle
          type='source'
          position={Position.Right}
          id='source-right'
          style={handleStyle}
          className={cn('z-10 shadow transition-opacity duration-150')}
        />
        <Handle
          type='source'
          position={Position.Left}
          id='source-left'
          style={handleStyle}
          className={cn('z-10 shadow transition-opacity duration-150')}
        />
        <Handle
          type='source'
          position={Position.Top}
          id='source-top'
          style={handleStyle}
          className={cn('z-10 shadow transition-opacity duration-150')}
        />
        <Handle
          type='source'
          position={Position.Bottom}
          id='source-bottom'
          style={handleStyle}
          className={cn('z-10 shadow transition-opacity duration-150')}
        />

        <Handle
          type='target'
          position={Position.Right}
          id='target-right'
          style={handleStyle}
          className={cn('z-10 shadow transition-opacity duration-150')}
        />
        <Handle
          type='target'
          position={Position.Left}
          id='target-left'
          style={handleStyle}
          className={cn('z-10 shadow transition-opacity duration-150')}
        />
        <Handle
          type='target'
          position={Position.Top}
          id='target-top'
          style={handleStyle}
          className={cn('z-10 shadow transition-opacity duration-150')}
        />
        <Handle
          type='target'
          position={Position.Bottom}
          id='target-bottom'
          style={handleStyle}
          className={cn('z-10 shadow transition-opacity duration-150')}
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
