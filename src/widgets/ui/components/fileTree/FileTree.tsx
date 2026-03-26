import {
  getLayoutAccess,
  notesApi,
  useGetMyLayoutsQuery,
  useLazySearchNotesQuery,
} from '@/entities';
import { useDragNoteMutation } from '@/entities/note';
import type { Note } from '@/entities/note';
import type { FileTreeItem as FileTreeItemType } from '@/entities/tab';
import { cn } from '@/shared/lib/core';
import { useDndSensors } from '@/shared/lib/react/hooks/useDndSensors';
import { useFileTree } from '@/widgets/hooks/FileTreeContext';
import { useAppSelector } from '@/widgets/hooks/redux';
import { AllNotesButton } from '@/widgets/ui/components/sidebar/AllNotesButton';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  pointerWithin,
} from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { FileTreeItem } from './FileTreeItem';
import { SearchInput } from './SearchInput';

interface FileTreeProps {
  expandedItems: Set<string>;
  toggleExpanded: (itemId: string) => void;
  onItemSelect?: (item: FileTreeItemType) => void;
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
    const sensors = useDndSensors({ mouseDistance: 5 });

    const { moveNoteInTree } = useFileTree();
    const [dragNote] = useDragNoteMutation();
    const { data: layoutsResponse } = useGetMyLayoutsQuery(undefined);
    const layoutAccessById = useMemo(() => {
      const map = new Map<
        string,
        { canRead: boolean; canWrite: boolean; canEdit: boolean }
      >();
      for (const layout of layoutsResponse?.data || []) {
        map.set(layout.id, getLayoutAccess(layout));
      }
      return map;
    }, [layoutsResponse?.data]);

    const [activeDrag, setActiveDrag] = useState<{
      noteId: string;
      fromLayoutId: string;
      title: string;
      width: number;
    } | null>(null);

    const handleDragStart = useCallback((event: any) => {
      const data = event?.active?.data?.current;
      if (data?.type === 'note') {
        const width = event?.active?.rect?.current?.initial?.width;
        setActiveDrag({
          noteId: data.noteId,
          fromLayoutId: data.fromLayoutId,
          title: data.title ?? '',
          width: typeof width === 'number' ? width : 240,
        });
      }
    }, []);

    const handleDragEnd = useCallback(
      async (event: any) => {
        const { active, over } = event;
        setActiveDrag(null);

        if (!over) return;

        const activeData = active?.data?.current;
        const overData = over?.data?.current;

        if (!activeData || !overData) return;
        if (activeData.type !== 'note') return;
        if (overData.type !== 'layout') return;
        if (activeData.fromLayoutId === overData.layoutId) return;
        const sourceAccess = layoutAccessById.get(activeData.fromLayoutId);
        const targetAccess = layoutAccessById.get(overData.layoutId);
        if (!sourceAccess?.canEdit || !targetAccess?.canEdit) return;

        moveNoteInTree(
          activeData.noteId,
          activeData.fromLayoutId,
          overData.layoutId
        );

        try {
          await dragNote({
            noteId: activeData.noteId,
            toLayoutId: overData.layoutId,
          }).unwrap();
        } catch {}
      },
      [moveNoteInTree, dragNote, layoutAccessById]
    );

    const [searchQuery, setSearchQuery] = useState('');
    const [triggerSearch, { data: searchResponse }] = useLazySearchNotesQuery();

    useEffect(() => {
      if (searchQuery.trim()) {
        triggerSearch({ search: searchQuery });
      }
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
            isMain: n.isMain ?? false,
            parentId: n.layoutId || undefined,
            access: n.layoutId ? layoutAccessById.get(n.layoutId) : undefined,
            createdAt: n.createdAt,
            updatedAt: n.updatedAt,
            note,
          };
        });
      }
      // layouts fallback
      if (layoutsResponse?.data) {
        return layoutsResponse.data.map(layout => ({
          id: layout.id,
          type: 'layout' as const,
          title: layout.title,
          children: [],
          isMain: layout.isMain ?? false,
          access: getLayoutAccess(layout),
          createdAt: layout.createdAt,
          updatedAt: layout.updatedAt,
          isNotesLoaded: false,
          color: (layout as unknown as { color?: string }).color,
        }));
      }
      return [];
    }, [
      layoutsResponse?.data,
      isSearchMode,
      searchResponse,
      searchQuery,
      layoutAccessById,
    ]);

    const apiState = useAppSelector((s: any) => s.api);

    const selectedParentId = useMemo(() => {
      if (!selectedItemId) return;

      for (const layout of layoutsResponse?.data || []) {
        for (let page = 1; page <= 3; page++) {
          const cached = notesApi.endpoints.getNotes.select({
            layoutId: layout.id,
            page,
          })({ api: apiState } as any);

          if (cached?.data?.data?.some(n => n.id === selectedItemId)) {
            return layout.id;
          }
        }
      }
    }, [selectedItemId, layoutsResponse?.data, apiState]);

    const handleItemClick = useCallback(
      (item: FileTreeItemType) => {
        if (item.type === 'layout' && item.isMain) {
          onOpenGraph?.(item.id);
          return;
        }

        onItemSelect?.(item);
      },
      [onItemSelect, onOpenGraph]
    );

    const renderTreeItem = useCallback(
      (item: FileTreeItemType, level = 0) => {
        const isExpanded = expandedItems.has(item.id);

        const isSelected =
          item.type === 'note'
            ? selectedItemId === item.id
            : selectedItemId === item.id || selectedParentId === item.id;

        return (
          <FileTreeItem
            key={item.id}
            item={item}
            level={level}
            isExpanded={isExpanded}
            isSelected={isSelected}
            hasSelection={!!selectedItemId}
            hasChildren={!!item.children?.length}
            onItemClick={handleItemClick}
            onOpenGraph={onOpenGraph}
            renderChild={renderTreeItem}
            toggleExpanded={toggleExpanded}
          />
        );
      },
      [
        expandedItems,
        selectedItemId,
        selectedParentId,
        handleItemClick,
        onOpenGraph,
        toggleExpanded,
      ]
    );

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={args => {
          const pointerHits = pointerWithin(args);
          if (pointerHits.length > 0) return pointerHits;
          return closestCenter(args);
        }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className={cn('flex h-full flex-col')}>
          <div className='p-2'>
            <SearchInput onSearchChange={setSearchQuery} />
          </div>

          {!isSearchMode && (
            <div className='px-2 py-1'>
              <AllNotesButton
                onAllNotesClick={() => {
                  const main = layoutsResponse?.data?.find(l => l.isMain);
                  if (main) onOpenGraph?.(main.id);
                }}
                isSelected={selectedItemId?.startsWith('graph-')}
              />
            </div>
          )}

          <div className='flex-1 overflow-y-auto p-2'>
            {isSearchMode ? (
              <div className='space-y-1'>
                {(fileTree ?? []).map(item => (
                  <FileTreeItem
                    key={item.id}
                    item={item}
                    level={0}
                    isExpanded={false}
                    isSelected={selectedItemId === item.id}
                    hasSelection={!!selectedItemId}
                    hasChildren={false}
                    onItemClick={handleItemClick}
                  />
                ))}
              </div>
            ) : (
              <div className='space-y-1'>
                {(fileTree ?? [])
                  .filter(
                    i =>
                      i.type === 'layout' &&
                      !i.isMain &&
                      'isNotesLoaded' in i &&
                      Array.isArray(i.children)
                  )
                  .map(item => renderTreeItem(item as FileTreeItemType))}
              </div>
            )}
          </div>
        </div>

        <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor]}>
          {activeDrag ? (
            <div
              className={cn(
                'pointer-events-none',
                'flex items-center gap-2 rounded-lg',
                'border border-black/10 bg-white/95 px-3 py-2',
                'text-sm text-black shadow-sm'
              )}
              style={{ width: `${activeDrag.width}px` }}
            >
              <span className='truncate font-medium'>{activeDrag.title}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  }
);
