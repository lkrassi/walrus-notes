import type { FileTreeItem as FileTreeItemType } from '@/entities/tab';
import { memo } from 'react';
import { FileTreeView } from './FileTreeView';
import { useFileTreeController } from './model/useFileTreeController';

interface FileTreeProps {
  expandedItems: Set<string>;
  toggleExpanded: (itemId: string) => void;
  onItemSelect?: (item: FileTreeItemType, mode?: 'preview' | 'pinned') => void;
  selectedItemId?: string;
  onOpenGraph?: (layoutId: string) => void;
}

export const FileTree = memo(
  ({
    expandedItems,
    toggleExpanded,
    onItemSelect,
    selectedItemId,
    onOpenGraph,
  }: FileTreeProps) => {
    const {
      setSearchQuery,
      isSearchMode,
      sections,
      sectionTitles,
      activeDragNote,
      collisionDetection,
      handleDragStart,
      handleDragCancel,
      handleDragEnd,
      renderSectionHeader,
      renderTreeItem,
      handleAllNotesClick,
    } = useFileTreeController({
      expandedItems,
      toggleExpanded,
      onItemSelect,
      selectedItemId,
      onOpenGraph,
    });

    return (
      <FileTreeView
        setSearchQuery={setSearchQuery}
        isSearchMode={isSearchMode}
        sections={sections}
        sectionTitles={sectionTitles}
        selectedItemId={selectedItemId}
        activeDragNote={activeDragNote}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
        renderSectionHeader={renderSectionHeader}
        renderTreeItem={renderTreeItem}
        onAllNotesClick={handleAllNotesClick}
      />
    );
  }
);

FileTree.displayName = 'FileTree';
