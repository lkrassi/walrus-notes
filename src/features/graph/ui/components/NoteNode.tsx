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
  function NoteNodeComponent({ data, selected: _selected }: NoteNodeProps) {
    const palette = graphTheme();
    const resolvedColor = data.layoutColor ?? palette.edge;
    const isMobile = useIsMobile();

    const handleSize = isMobile ? 20 : 15;
    const handleStyle = {
      background: resolvedColor,
      width: handleSize,
      height: handleSize,
      cursor: 'crosshair',
    };

    return (
      <motion.div
        className={cn('relative')}
        animate={{
          opacity: data.isRelatedToSelected !== false ? 1 : 0.5,
        }}
        transition={{ duration: 0 }}
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
