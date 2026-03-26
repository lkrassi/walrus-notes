import type { Note } from '@/entities/note';
import type { FileTreeItem as FileTreeItemType } from '@/entities/tab';
import type { ReactNode } from 'react';
import { FileTreeItemContent } from './FileTreeItemContent';
import { FileTreeItemHeader } from './FileTreeItemHeader';
import { useDroppable } from '@dnd-kit/core';

type FileTreeItemProps = {
  item: FileTreeItemType;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  hasSelection?: boolean;
  hasChildren: boolean;
  onItemClick: (item: FileTreeItemType) => void;
  onOpenGraph?: (layoutId: string) => void;
  onDeleteNote?: (noteId: string) => void;
  onDeleteLayout?: (layoutId: string) => void;
  toggleExpanded?: (itemId: string) => void;
  renderChild?: (child: FileTreeItemType, level: number) => ReactNode;
  onNotesLoaded?: (layoutId: string, notes: Note[]) => void;
};

export const FileTreeItem = ({
  item,
  level,
  isExpanded,
  isSelected,
  hasSelection,
  onItemClick,
  onOpenGraph,
  onDeleteNote,
  renderChild,
  onNotesLoaded,
  toggleExpanded,
}: FileTreeItemProps) => {
  // DnD: layout droppable
  let droppableClassName = '';
  let dropRef = undefined;
  if (item.type === 'layout' && item.isMain !== true && item.access?.canEdit) {
    const { setNodeRef, isOver: over, active } = useDroppable({
      id: item.id,
      data: { type: 'layout', layoutId: item.id },
    });
    dropRef = setNodeRef;
    const activeLayoutId = active?.data?.current?.fromLayoutId;
    const isValidDropTarget = over && activeLayoutId && activeLayoutId !== item.id;
    droppableClassName = isValidDropTarget
      ? 'rounded-lg bg-primary/5 outline outline-1 outline-primary/25'
      : '';
  }
  return (
    <div ref={dropRef} className={droppableClassName}>
      <FileTreeItemHeader
        item={item}
        level={level}
        isExpanded={isExpanded}
        isSelected={isSelected}
        hasSelection={hasSelection}
        onItemClick={onItemClick}
        onOpenGraph={onOpenGraph}
        onDeleteNote={onDeleteNote}
        toggleExpanded={toggleExpanded}
      />
      <FileTreeItemContent
        item={item}
        level={level}
        isExpanded={isExpanded}
        renderChild={renderChild}
        onNotesLoaded={onNotesLoaded}
      />
    </div>
  );
};
