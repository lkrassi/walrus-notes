import type { FileTreeItem as FileTreeItemType } from 'widgets/hooks/useFileTree';
import { FileTreeItemContent } from './FileTreeItemContent';
import { FileTreeItemHeader } from './FileTreeItemHeader';

type FileTreeItemProps = {
  item: FileTreeItemType;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  hasChildren: boolean;
  onItemClick: (item: FileTreeItemType) => void;
  onCreateNote: (layoutId: string) => void;
  onOpenGraph?: (layoutId: string) => void;
  onDeleteNote?: (noteId: string) => void;
  onDeleteLayout?: (layoutId: string) => void;
  renderChild?: (child: FileTreeItemType, level: number) => React.ReactNode;
  onNotesLoaded?: (layoutId: string, notes: any[]) => void;
};

export const FileTreeItem = ({
  item,
  level,
  isExpanded,
  isSelected,
  onItemClick,
  onCreateNote,
  onOpenGraph,
  onDeleteNote,
  onDeleteLayout,
  renderChild,
  onNotesLoaded,
}: FileTreeItemProps) => {
  return (
    <div>
      <FileTreeItemHeader
        item={item}
        level={level}
        isExpanded={isExpanded}
        isSelected={isSelected}
        onItemClick={onItemClick}
        onCreateNote={onCreateNote}
        onOpenGraph={onOpenGraph}
        onDeleteNote={onDeleteNote}
        onDeleteLayout={onDeleteLayout}
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
