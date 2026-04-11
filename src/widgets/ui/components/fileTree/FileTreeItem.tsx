import type { Note } from '@/entities/note';
import type { FileTreeItem as FileTreeItemType } from '@/entities/tab';
import { cn } from '@/shared';
import { useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';
import { FileTreeItemContent } from './FileTreeItemContent';
import { FileTreeItemHeader } from './FileTreeItemHeader';

type FileTreeItemProps = {
  item: FileTreeItemType;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  isPinned?: boolean;
  isAnyNoteDragging?: boolean;
  hasSelection?: boolean;
  hasChildren: boolean;
  onItemClick: (item: FileTreeItemType) => void;
  onTogglePin?: (item: FileTreeItemType) => void;
  onItemDoubleClick?: (item: FileTreeItemType) => void;
  onOpenGraph?: (layoutId: string) => void;
  onDeleteNote?: (noteId: string) => void;
  onDeleteLayout?: (layoutId: string) => void;
  toggleExpanded?: (itemId: string) => void;
  renderChild?: (child: FileTreeItemType, level: number) => ReactNode;
  sortNotes?: (layoutId: string, notes: Note[]) => Note[];
  onNotesLoaded?: (layoutId: string, notes: Note[]) => void;
};

export const FileTreeItem = ({
  item,
  level,
  isExpanded,
  isSelected,
  isPinned,
  isAnyNoteDragging,
  hasSelection,
  onItemClick,
  onTogglePin,
  onItemDoubleClick,
  onOpenGraph,
  onDeleteNote,
  renderChild,
  sortNotes,
  onNotesLoaded,
  toggleExpanded,
}: FileTreeItemProps) => {
  let droppableClassName = '';
  let dropRef = undefined;
  if (item.type === 'layout' && item.isMain !== true) {
    const {
      setNodeRef,
      isOver: over,
      active,
    } = useDroppable({
      id: item.id,
      data: { type: 'layout', layoutId: item.id },
    });
    dropRef = setNodeRef;
    const activeType = active?.data?.current?.type;
    const activeLayoutId = active?.data?.current?.fromLayoutId;
    const isValidDropTarget =
      over &&
      activeType === 'note' &&
      activeLayoutId &&
      activeLayoutId !== item.id;

    if (isValidDropTarget) {
      droppableClassName = item.access?.canWrite
        ? 'bg-primary/8 outline outline-1 outline-primary/25'
        : 'bg-danger/10 outline outline-1 outline-danger/25';
    }
  }
  return (
    <div ref={dropRef} className={cn(droppableClassName)}>
      <FileTreeItemHeader
        item={item}
        level={level}
        isExpanded={isExpanded}
        isSelected={isSelected}
        isPinned={isPinned}
        isAnyNoteDragging={isAnyNoteDragging}
        hasSelection={hasSelection}
        onItemClick={onItemClick}
        onTogglePin={onTogglePin}
        onItemDoubleClick={onItemDoubleClick}
        onOpenGraph={onOpenGraph}
        onDeleteNote={onDeleteNote}
        toggleExpanded={toggleExpanded}
      />
      <FileTreeItemContent
        item={item}
        level={level}
        isExpanded={isExpanded}
        sortNotes={sortNotes}
        renderChild={renderChild}
        onNotesLoaded={onNotesLoaded}
      />
    </div>
  );
};
