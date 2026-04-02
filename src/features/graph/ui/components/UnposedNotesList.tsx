import { useGetUnposedNotesQuery } from '@/entities';
import type { Note } from '@/entities/note';
import { cn } from '@/shared/lib/core';
import { RenderWithState, Skeleton } from '@/shared/ui';
import { useDndMonitor, useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  defaultAnimateLayoutChanges,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { NotePreview } from './NotePreview';

type DragCardSize = {
  width: number;
  height: number;
};

interface UnposedNotesListProps {
  layoutId: string;
  onNoteSelect?: (note: Note) => void;
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
}

export const UnposedNotesList = ({
  layoutId,
  onNoteSelect,
  isOpen,
  onOpenChange,
}: UnposedNotesListProps) => {
  const { data: unposedNotesResponse, isLoading } = useGetUnposedNotesQuery({
    layoutId,
  });

  const [orderedIds, setOrderedIds] = useState<string[]>([]);

  const unposedNotes = unposedNotesResponse?.data || [];
  const isInitialLoading = isLoading && !unposedNotesResponse;

  const noteMap = useMemo(
    () => new Map(unposedNotes.map(note => [note.id, note])),
    [unposedNotes]
  );

  useEffect(() => {
    const nextIds = unposedNotes.map(note => note.id);
    setOrderedIds(prev => {
      const kept = prev.filter(id => nextIds.includes(id));
      const appended = nextIds.filter(id => !kept.includes(id));
      return [...kept, ...appended];
    });
  }, [unposedNotes]);

  const orderedNotes = useMemo(
    () => orderedIds.map(id => noteMap.get(id)).filter(Boolean) as Note[],
    [orderedIds, noteMap]
  );

  useDndMonitor({
    onDragEnd: event => {
      const activeId = event.active.id.toString();
      const overId = event.over?.id?.toString();

      if (!activeId.startsWith('unposed-')) return;
      if (!overId) return;
      if (overId === 'graph-drop-zone') return;
      if (overId === 'unposed-panel-drop') return;

      const sourceId = activeId.replace('unposed-', '');

      setOrderedIds(prev => {
        const oldIndex = prev.findIndex(id => id === sourceId);
        if (oldIndex < 0) return prev;

        if (!overId.startsWith('unposed-')) return prev;

        const targetId = overId.replace('unposed-', '');
        const newIndex = prev.findIndex(id => id === targetId);
        if (newIndex < 0 || newIndex === oldIndex) return prev;

        return arrayMove(prev, oldIndex, newIndex);
      });
    },
  });

  const { setNodeRef: setPanelDropRef } = useDroppable({
    id: 'unposed-panel-drop',
  });

  const handleNoteClick = (note: Note) => {
    const noteWithLayout = { ...note, layoutId } as Note;
    onNoteSelect?.(noteWithLayout);
    onOpenChange(false);
  };

  if (!isLoading && orderedNotes.length === 0) {
    return null;
  }

  return (
    <>
      <motion.button
        type='button'
        initial={false}
        animate={{ x: isOpen ? '-400px' : '0px' }}
        transition={{ duration: 0.28, ease: 'easeInOut' }}
        onClick={() => onOpenChange(!isOpen)}
        className={cn(
          'border-border dark:border-dark-border bg-surface dark:bg-dark-surface',
          'absolute',
          'top-1/2',
          'right-0',
          '-translate-y-1/2',
          'z-40',
          'rounded-l-xl',
          'border',
          'border-r-0',
          'p-2',
          'shadow-md',
          'transition-colors',
          'hover:bg-interactive-hover'
        )}
        title={
          isOpen
            ? 'Скрыть непозиционированные заметки'
            : 'Показать непозиционированные заметки'
        }
      >
        <span
          className={cn(
            'bg-primary text-primary-foreground text-md absolute -bottom-2 -left-2 min-w-5 rounded-full px-1.5 py-0.5 leading-none font-semibold shadow-sm',
            orderedNotes.length === 0 && 'hidden'
          )}
        >
          {orderedNotes.length}
        </span>
        <ChevronLeft
          className={cn(
            'text-foreground transition-transform duration-300',
            isOpen ? '' : 'rotate-180'
          )}
        />
      </motion.button>

      <RenderWithState
        isInitialLoading={isInitialLoading}
        skeleton={
          <div className='absolute top-0 right-0 bottom-0 z-30 w-100 max-w-[45vw] overflow-hidden border-l p-3'>
            <div className='grid grid-cols-3 content-start gap-2'>
              <Skeleton className='h-24 w-full rounded-xl' />
              <Skeleton className='h-24 w-full rounded-xl' />
              <Skeleton className='h-24 w-full rounded-xl' />
              <Skeleton className='h-24 w-full rounded-xl' />
              <Skeleton className='h-24 w-full rounded-xl' />
              <Skeleton className='h-24 w-full rounded-xl' />
            </div>
          </div>
        }
        className='h-full'
      >
        <div
          ref={setPanelDropRef}
          className={cn(
            'absolute',
            'top-0',
            'right-0',
            'bottom-0',
            'z-30',
            isOpen ? 'pointer-events-auto' : 'pointer-events-none'
          )}
        >
          <motion.aside
            initial={false}
            animate={{ x: isOpen ? '0%' : '100%' }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className={cn(
              'border-border dark:border-dark-border bg-surface dark:bg-dark-surface',
              'h-auto',
              'w-100',
              'max-w-[45vw]',
              'overflow-hidden',
              'border-l',
              'shadow-xl'
            )}
          >
            <SortableContext
              items={orderedNotes.map(note => `unposed-${note.id}`)}
              strategy={rectSortingStrategy}
            >
              <div
                className={cn(
                  'h-[calc(100%-53px)] overflow-y-auto p-3',
                  'grid grid-cols-3 content-start gap-2'
                )}
              >
                {orderedNotes.map(note => (
                  <SortableNoteCard
                    key={note.id}
                    note={note}
                    onClick={handleNoteClick}
                  />
                ))}
              </div>
            </SortableContext>
          </motion.aside>
        </div>
      </RenderWithState>
    </>
  );
};

const SortableNoteCard = ({
  note,
  onClick,
}: {
  note: Note;
  onClick: (note: Note) => void;
}) => {
  const cardRef = useRef<HTMLButtonElement | null>(null);
  const [dragSize, setDragSize] = useState<DragCardSize | null>(null);

  useLayoutEffect(() => {
    const node = cardRef.current;
    if (!node) return;

    const measure = () => {
      const rect = node.getBoundingClientRect();
      setDragSize({
        width: rect.width,
        height: rect.height,
      });
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(node);

    return () => ro.disconnect();
  }, []);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `unposed-${note.id}`,
    data: {
      note,
      dragSize,
    },
    animateLayoutChanges: args => {
      if (args.isSorting || args.wasDragging) {
        return false;
      }

      return defaultAnimateLayoutChanges(args);
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <button
      ref={node => {
        setNodeRef(node);
        cardRef.current = node;
      }}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(note)}
      className={cn('w-full', 'cursor-grab', 'active:cursor-grabbing')}
      title={`Перетаскиваемая заметка: ${note.title}`}
    >
      <div className={cn('pointer-events-none w-full')}>
        <NotePreview
          note={note}
          isSmall={true}
          className={cn('h-24 w-full max-w-none min-w-0')}
        />
      </div>
    </button>
  );
};
