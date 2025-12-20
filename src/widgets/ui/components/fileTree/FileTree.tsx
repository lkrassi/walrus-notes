import { useGetMyLayoutsQuery } from 'app/store/api';
import { memo, useCallback, useMemo, useState, useEffect } from 'react';
import { useAppSelector } from '../../../hooks/redux';
import { notesApi } from '../../../model';
import cn from 'shared/lib/cn';
import type { Note } from 'shared/model/types/layouts';
import type { FileTreeItem as FileTreeItemType } from 'widgets/hooks/useFileTree';
import { FileTreeEmpty } from './FileTreeEmpty';
import { FileTreeItem } from './FileTreeItem';
import { FileTreeMainItem } from './FileTreeMainItem';
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

    const isSearchMode = searchQuery.trim().length > 0;

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
        isMain: layout.isMain === true,
        createdAt: layout.createdAt,
        updatedAt: layout.updatedAt,
        isNotesLoaded: false,
        color: (layout as unknown as { color?: string }).color,
      }));
    }, [layoutsResponse?.data, searchQuery, searchResponse?.data]);

    const apiState = useAppSelector(state => state.api);

    const selectedParentId = useMemo(() => {
      if (!selectedItemId) return undefined;

      const findInChildren = (
        children: FileTreeItemType[] | undefined
      ): boolean => {
        if (!children) return false;
        for (const c of children) {
          if (c.id === selectedItemId) return true;
          if (c.children && findInChildren(c.children)) return true;
        }
        return false;
      };

      for (const it of fileTree) {
        if (it.type === 'note' && it.id === selectedItemId) {
          return (it as FileTreeItemType).parentId as string | undefined;
        }
      }

      for (const it of fileTree) {
        if (it.type === 'layout') {
          if (findInChildren(it.children)) return it.id;
        }
      }

      if (layoutsResponse?.data && apiState) {
        for (const layout of layoutsResponse.data) {
          for (let page = 1; page <= 3; page++) {
            const cached = notesApi.endpoints.getNotes.select({
              layoutId: layout.id,
              page,
            })({ api: apiState });

            const arr = cached?.data?.data;
            if (Array.isArray(arr) && arr.some(n => n.id === selectedItemId)) {
              return layout.id;
            }
          }
        }
      }

      return undefined;
    }, [fileTree, selectedItemId]);

    const handleItemClick = useCallback(
      (item: FileTreeItemType) => {
        if (item.type === 'layout' && item.isMain === true) {
          onOpenGraph?.(item.id);
          return;
        }

        onItemSelect?.(item);
      },
      [onItemSelect, onOpenGraph]
    );

    const renderTreeItem = useCallback(
      (item: FileTreeItemType, level: number = 0) => {
        const isExpanded = expandedItems.has(item.id);
        const hasChildren = !!(item.children && item.children.length > 0);

        let isSelected = false;
        if (item.type === 'note') {
          isSelected = selectedItemId === item.id;
        } else if (item.type === 'layout') {
          isSelected =
            selectedItemId === item.id ||
            selectedParentId === item.id ||
            !!item.children?.some(child => child.id === selectedItemId);
        }

        return (
          <div key={item.id}>
            <FileTreeItem
              item={item}
              level={level}
              isExpanded={isExpanded}
              isSelected={isSelected}
              hasSelection={!!selectedItemId}
              hasChildren={hasChildren}
              onItemClick={handleItemClick}
              onOpenGraph={onOpenGraph}
              onDeleteNote={undefined}
              onDeleteLayout={undefined}
              renderChild={renderTreeItem}
              onNotesLoaded={undefined}
              toggleExpanded={toggleExpanded}
            />
          </div>
        );
      },
      [
        expandedItems,
        selectedItemId,
        selectedParentId,
        handleItemClick,
        onOpenGraph,
      ]
    );

    return (
      <div className={cn('flex', 'h-full', 'flex-col')}>
        <div className={cn('p-2')}>
          <SearchInput onSearchChange={setSearchQuery} />
        </div>

        <div className={cn('flex-1', 'overflow-y-auto', 'p-2')}>
          {fileTree.length === 0 ? (
            <FileTreeEmpty />
          ) : isSearchMode ? (
            <div className={cn('space-y-1')}>
              {fileTree.map(item => {
                const isSelected = selectedItemId === item.id;
                return (
                  <div key={item.id}>
                    <FileTreeItem
                      item={item}
                      level={0}
                      isExpanded={false}
                      isSelected={isSelected}
                      hasSelection={!!selectedItemId}
                      hasChildren={false}
                      onItemClick={handleItemClick}
                      onOpenGraph={onOpenGraph}
                      onDeleteNote={undefined}
                      onDeleteLayout={undefined}
                      renderChild={undefined}
                      onNotesLoaded={undefined}
                      toggleExpanded={undefined}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={cn('space-y-1')}>
              {fileTree
                .filter(i => i.type === 'layout' && i.isMain === true)
                .map(item => {
                  const isSelectedMain =
                    selectedItemId === item.id ||
                    selectedItemId === `graph-${item.id}`;
                  return (
                    <div key={item.id}>
                      <FileTreeMainItem
                        item={item}
                        level={0}
                        isSelected={isSelectedMain}
                        hasSelection={!!selectedItemId}
                        onItemClick={handleItemClick}
                      />
                    </div>
                  );
                })}

              {fileTree.some(i => i.type === 'layout' && i.isMain === true) &&
                fileTree.some(
                  i => i.type === 'layout' && i.isMain !== true
                ) && (
                  <div
                    className={cn(
                      'my-2',
                      'border-t',
                      'border-gray-200',
                      'dark:border-gray-700'
                    )}
                  />
                )}

              {fileTree
                .filter(i => i.type === 'layout' && i.isMain !== true)
                .map(item => renderTreeItem(item))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

FileTree.displayName = 'FileTree';
