import type { Note } from '@/entities/note';
import { cn } from '@/shared/lib/core';
import { useIsMobile } from '@/shared/lib/react/hooks';
import { motion } from 'framer-motion';
import { Handle, Position, useStore } from 'reactflow';
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

export function NoteNodeComponent({ data, selected }: NoteNodeProps) {
  const palette = graphTheme();
  const resolvedColor = data.layoutColor ?? palette.edge;
  const isMobile = useIsMobile();
  const isActive = selected || !!data.selected;
  const liveLinkCount = useStore(state => {
    const linkedNoteIds = new Set<string>();

    state.edges.forEach(edge => {
      if (edge.id.startsWith('temp-')) {
        return;
      }

      if (edge.source === data.note.id) {
        linkedNoteIds.add(edge.target);
        return;
      }

      if (edge.target === data.note.id) {
        linkedNoteIds.add(edge.source);
      }
    });

    return linkedNoteIds.size;
  });

  const handleSize = isMobile ? 12 : 8;
  const handleStyle = {
    background: resolvedColor,
    width: handleSize,
    height: handleSize,
    cursor: 'crosshair',
    opacity: isActive ? 1 : 0.72,
  };

  const handleClassName = cn(
    'z-20 transition-opacity duration-150',
    isMobile || isActive
      ? 'opacity-100'
      : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'
  );

  return (
    <motion.div
      className={cn('group relative')}
      animate={{
        opacity: data.isRelatedToSelected !== false ? 1 : 0.48,
        scale: isActive ? 1.02 : 1,
      }}
      transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.8 }}
    >
      <div
        className={cn(
          'pointer-events-none relative z-10 cursor-pointer rounded-xl'
        )}
      >
        <NotePreview
          note={data.note}
          layoutColor={data.layoutColor}
          linkCount={liveLinkCount}
        />
      </div>

      <Handle
        type='source'
        position={Position.Right}
        id='source-right'
        style={handleStyle}
        className={handleClassName}
      />
      <Handle
        type='source'
        position={Position.Left}
        id='source-left'
        style={handleStyle}
        className={handleClassName}
      />
      <Handle
        type='source'
        position={Position.Top}
        id='source-top'
        style={handleStyle}
        className={handleClassName}
      />
      <Handle
        type='source'
        position={Position.Bottom}
        id='source-bottom'
        style={handleStyle}
        className={handleClassName}
      />

      <Handle
        type='target'
        position={Position.Right}
        id='target-right'
        style={handleStyle}
        className={handleClassName}
      />
      <Handle
        type='target'
        position={Position.Left}
        id='target-left'
        style={handleStyle}
        className={handleClassName}
      />
      <Handle
        type='target'
        position={Position.Top}
        id='target-top'
        style={handleStyle}
        className={handleClassName}
      />
      <Handle
        type='target'
        position={Position.Bottom}
        id='target-bottom'
        style={handleStyle}
        className={handleClassName}
      />
    </motion.div>
  );
}
