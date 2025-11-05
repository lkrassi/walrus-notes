import { useGetMyLayoutsQuery } from 'app/store/api';
import { memo, useCallback, useMemo } from 'react';
import type { Note } from 'shared/model/types/layouts';
import type { FileTreeItem as FileTreeItemType } from 'widgets/hooks/useFileTree';
import { FileTreeEmpty } from './FileTreeEmpty';
import { FileTreeItem } from './FileTreeItem';

interface FileTreeProps {
  expandedItems: Set<string>;
  toggleExpanded: (itemId: string) => void;
  updateNoteInTree: (noteId: string, updatedNote: Partial<Note>) => void;
  addNoteToTree: (layoutId: string, note: Note) => void;
  onItemSelect?: (item: FileTreeItemType) => void;
  selectedItemId?: string;
  onOpenGraph?: (layoutId: string) => void;
  onDeleteNote?: (noteId: string) => void;
  onDeleteLayout?: (layoutId: string) => void;
}

export const FileTree = memo(
  ({
    expandedItems,
    toggleExpanded,
    onItemSelect,
    selectedItemId,
    onOpenGraph,
  }: Omit<FileTreeProps, 'fileTree' | 'onNotesLoaded' | 'loadMoreNotes'>) => {
    const { data: layoutsResponse } = useGetMyLayoutsQuery(undefined);

    const fileTree = useMemo(() => {
      if (!layoutsResponse?.data) return [];

      return layoutsResponse.data.map(layout => ({
        id: layout.id,
        type: 'layout' as const,
        title: layout.title,
        children: [],
        createdAt: layout.createdAt,
        updatedAt: layout.updatedAt,
        isNotesLoaded: false,
      }));
    }, [layoutsResponse?.data]);

    const handleItemClick = useCallback(
      (item: FileTreeItemType) => {
        onItemSelect?.(item);
        if (item.type === 'layout') {
          toggleExpanded(item.id);
        }
      },
      [onItemSelect, toggleExpanded]
    );

    const renderTreeItem = useCallback(
      (item: FileTreeItemType, level: number = 0) => {
        const isExpanded = expandedItems.has(item.id);
        const isSelected = selectedItemId === item.id;
        const hasChildren = !!(item.children && item.children.length > 0);

        return (
          <div key={item.id}>
            <FileTreeItem
              item={item}
              level={level}
              isExpanded={isExpanded}
              isSelected={isSelected}
              hasChildren={hasChildren}
              onItemClick={handleItemClick}
              onOpenGraph={onOpenGraph}
              renderChild={renderTreeItem}
            />
          </div>
        );
      },
      [expandedItems, selectedItemId, handleItemClick, onOpenGraph]
    );

    return (
      <div className='flex h-full flex-col'>
        <div className='flex-1 overflow-y-auto p-2'>
          {fileTree.length === 0 ? (
            <FileTreeEmpty />
          ) : (
            <div className='space-y-1'>
              {fileTree.map(item => renderTreeItem(item))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

FileTree.displayName = 'FileTree';
