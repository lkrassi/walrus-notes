import { useGetMyLayoutsQuery } from 'app/store/api';
import { memo, useCallback, useMemo, useState, useEffect } from 'react';
import cn from 'shared/lib/cn';
import type { Note } from 'shared/model/types/layouts';
import type { FileTreeItem as FileTreeItemType } from 'widgets/hooks/useFileTree';
import { FileTreeEmpty } from './FileTreeEmpty';
import { FileTreeItem } from './FileTreeItem';
import { SearchInput } from './SearchInput';
import { useLazySearchNotesQuery } from 'app/store/api';

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

    const [searchQuery, setSearchQuery] = useState('');
    const [
      triggerSearch,
      { data: searchResponse, isLoading: _isSearchLoading },
    ] = useLazySearchNotesQuery();

    useEffect(() => {
      if (!searchQuery) return;
      triggerSearch({ search: searchQuery });
    }, [searchQuery, triggerSearch]);

    const fileTree = useMemo(() => {
      if (searchQuery && searchResponse?.data) {
        const q = searchQuery.trim().toLowerCase();
        return searchResponse.data.map(n => {
          const title = (n.title || '').toString();
          const payload = (n.payload || '').toString();
          let field: 'title' | 'payload' | null = null;
          let snippet = '';

          if (q && title.toLowerCase().includes(q)) {
            field = 'title';
            snippet = title;
          } else if (q && payload.toLowerCase().includes(q)) {
            field = 'payload';
            const idx = payload.toLowerCase().indexOf(q);
            const start = Math.max(0, idx - 30);
            const end = Math.min(payload.length, idx + q.length + 30);
            snippet = `${start > 0 ? '... ' : ''}${payload.slice(start, end)}${end < payload.length ? ' ...' : ''}`;
          }

          const note = { ...n } as Note & {
            _match?: {
              field: 'title' | 'payload';
              snippet: string;
              query: string;
            };
          };
          if (field) {
            note._match = { field, snippet, query: searchQuery };
          }

          return {
            id: n.id,
            type: 'note' as const,
            title: n.title,
            isMain: false,
            parentId: n.layoutId || undefined,
            createdAt: n.createdAt,
            updatedAt: n.updatedAt,
            note,
          };
        });
      }

      if (!layoutsResponse?.data) return [];

      return layoutsResponse.data.map(layout => ({
        id: layout.id,
        type: 'layout' as const,
        title: layout.title,
        children: [],
        isMain: (layout as any).isMain === true,
        createdAt: layout.createdAt,
        updatedAt: layout.updatedAt,
        isNotesLoaded: false,
      }));
    }, [layoutsResponse?.data, searchQuery, searchResponse?.data]);

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
      <div className={cn('flex', 'h-full', 'flex-col')}>
        <div className={cn('p-2')}>
          <SearchInput onSearchChange={setSearchQuery} />
        </div>

        <div className={cn('flex-1', 'overflow-y-auto', 'p-2')}>
          {fileTree.length === 0 ? (
            <FileTreeEmpty />
          ) : (
            <div className={cn('space-y-1')}>
              {fileTree.map(item => renderTreeItem(item))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

FileTree.displayName = 'FileTree';
