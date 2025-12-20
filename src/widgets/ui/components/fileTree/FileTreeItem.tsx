import type { Note } from 'shared/model/types/layouts';
import type { FileTreeItem as FileTreeItemType } from 'widgets/hooks/useFileTree';
import { FileTreeItemContent } from './FileTreeItemContent';
import { FileTreeItemHeader } from './FileTreeItemHeader';

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
  renderChild?: (child: FileTreeItemType, level: number) => React.ReactNode;
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
  return (
    <div>
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
