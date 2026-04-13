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
    isConnectionPreviewActive?: boolean;
    isInvalidConnectionTarget?: boolean;
  };
  selected: boolean;
}

export function NoteNodeComponent({ data, selected }: NoteNodeProps) {
  const palette = graphTheme();
  const resolvedColor = data.layoutColor ?? palette.edge;
  const isConnectionPreviewActive = !!data.isConnectionPreviewActive;
  const isInvalidConnectionTarget =
    isConnectionPreviewActive && !!data.isInvalidConnectionTarget;
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
    background: isInvalidConnectionTarget ? palette.danger : resolvedColor,
    width: handleSize,
    height: handleSize,
    cursor: isInvalidConnectionTarget ? 'not-allowed' : 'crosshair',
    opacity: isInvalidConnectionTarget ? 1 : isActive ? 1 : 0.72,
  };

  const handleClassName = cn(
    'z-20 transition-opacity duration-150',
    isMobile || isActive
      ? 'opacity-100'
      : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'
  );

  const invalidOverlayStyle = {
    backgroundImage:
      'repeating-linear-gradient(135deg, currentColor 0, currentColor 8px, transparent 8px, transparent 16px)',
  };

  return (
    <motion.div
      className={cn(
        'group relative rounded-xl transition-colors duration-150',
        isConnectionPreviewActive &&
          isInvalidConnectionTarget &&
          'bg-danger/10 ring-danger/45 ring-1'
      )}
      animate={{
        opacity: data.isRelatedToSelected !== false ? 1 : 0.48,
        scale: isConnectionPreviewActive ? 1 : isActive ? 1.02 : 1,
      }}
      transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.8 }}
    >
      {isInvalidConnectionTarget && (
        <>
          <motion.div
            className={cn(
              'text-danger/60 pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-xl'
            )}
            style={invalidOverlayStyle}
            animate={{
              opacity: [0.45, 0.78, 0.45],
              scale: [1, 1.01, 1],
            }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div
            className={cn(
              'pointer-events-none absolute inset-0 z-20 rounded-xl',
              'ring-danger/80 shadow-danger/35 shadow-lg ring-2'
            )}
            aria-hidden='true'
          />
          <div
            className={cn(
              'pointer-events-none absolute -top-2 -right-2 z-40 flex h-5 w-5 items-center justify-center rounded-full',
              'bg-danger text-foreground text-[10px] font-bold shadow-lg'
            )}
            aria-hidden='true'
          >
            !
          </div>
        </>
      )}

      <div
        className={cn(
          'pointer-events-none relative z-10 cursor-pointer rounded-xl',
          isInvalidConnectionTarget && 'brightness-90 saturate-75'
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
