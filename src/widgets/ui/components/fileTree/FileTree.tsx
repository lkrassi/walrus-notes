import {
  getLayoutAccess,
  notesApi,
  useGetMyLayoutsQuery,
  useLazySearchNotesQuery,
} from '@/entities';
import type { Note } from '@/entities/note';
import { useDragNoteMutation } from '@/entities/note';
import type { FileTreeItem as FileTreeItemType } from '@/entities/tab';
import { useUser } from '@/entities/user';
import { cn } from '@/shared/lib/core';
import { useDndSensors } from '@/shared/lib/react/hooks/useDndSensors';
import { useFileTree } from '@/widgets/hooks';
import { useNotifications } from '@/widgets/hooks/useNotifications';
import { AllNotesButton } from '@/widgets/ui/components/sidebar/AllNotesButton';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  pointerWithin,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  restrictToFirstScrollableAncestor,
  snapCenterToCursor,
} from '@dnd-kit/modifiers';
import { FileText } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { FileTreeItem } from './FileTreeItem';
import { SearchInput } from './SearchInput';

interface FileTreeProps {
  expandedItems: Set<string>;
  toggleExpanded: (itemId: string) => void;
  onItemSelect?: (item: FileTreeItemType, mode?: 'preview' | 'pinned') => void;
  selectedItemId?: string;
  onOpenGraph?: (layoutId: string) => void;
}

type NotesApiRootState = Parameters<
  ReturnType<typeof notesApi.endpoints.getNotes.select>
>[0];

type NoteDragData = {
  type: 'note';
  noteId: string;
  fromLayoutId?: string;
  title?: string;
};

type LayoutDropData = {
  type: 'layout';
  layoutId: string;
};

const isNoteDragData = (data: unknown): data is NoteDragData => {
  if (!data || typeof data !== 'object') return false;
  const candidate = data as Record<string, unknown>;
  return candidate.type === 'note' && typeof candidate.noteId === 'string';
};

const isLayoutDropData = (data: unknown): data is LayoutDropData => {
  if (!data || typeof data !== 'object') return false;
  const candidate = data as Record<string, unknown>;
  return candidate.type === 'layout' && typeof candidate.layoutId === 'string';
};

export const FileTree = memo(
  ({
    expandedItems,
    toggleExpanded,
    onItemSelect,
    selectedItemId,
    onOpenGraph,
  }: FileTreeProps) => {
    const sensors = useDndSensors({ mouseDistance: 5 });
    const { t } = useTranslation();
    const { showError } = useNotifications();

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

    const [activeDragNote, setActiveDragNote] = useState<{
      noteId: string;
      title?: string;
    } | null>(null);
    const dragStartLayoutIdRef = useRef<string | null>(null);

    const handleDragStart = useCallback((event: DragStartEvent) => {
      const activeData = event.active?.data?.current;
      if (isNoteDragData(activeData)) {
        setActiveDragNote({
          noteId: activeData.noteId,
          title: activeData.title,
        });
        dragStartLayoutIdRef.current = activeData.fromLayoutId ?? null;
      }
    }, []);

    const handleDragCancel = useCallback(() => {
      setActiveDragNote(null);
      dragStartLayoutIdRef.current = null;
    }, []);

    const handleDragOver = useCallback((_event: DragOverEvent) => {
      // No preview or reorder
    }, []);

    const handleDragEnd = useCallback(
      async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragNote(null);

        const activeData = active?.data?.current;
        if (!isNoteDragData(activeData)) {
          dragStartLayoutIdRef.current = null;
          return;
        }

        if (!over) {
          dragStartLayoutIdRef.current = null;
          return;
        }

        const overData = over?.data?.current;
        const fromLayoutId = dragStartLayoutIdRef.current;

        if (!fromLayoutId) {
          dragStartLayoutIdRef.current = null;
          return;
        }

        let toLayoutId: string | null = null;

        if (isLayoutDropData(overData)) {
          toLayoutId = overData.layoutId;
        } else if (isNoteDragData(overData)) {
          toLayoutId = overData.fromLayoutId ?? null;
        }

        if (!toLayoutId || fromLayoutId === toLayoutId) {
          dragStartLayoutIdRef.current = null;
          return;
        }

        const sourceAccess = layoutAccessById.get(fromLayoutId);
        const targetAccess = layoutAccessById.get(toLayoutId);

        if (!sourceAccess?.canWrite || !targetAccess?.canWrite) {
          showError(
            'Недостаточно прав для переноса заметки в выбранную папку.'
          );
          dragStartLayoutIdRef.current = null;
          return;
        }

        moveNoteInTree(activeData.noteId, fromLayoutId, toLayoutId);

        try {
          await dragNote({
            noteId: activeData.noteId,
            toLayoutId,
          }).unwrap();
        } catch (_error) {
          // API call made, local state already updated
        }

        dragStartLayoutIdRef.current = null;
      },
      [layoutAccessById, moveNoteInTree, dragNote, showError]
    );

    const [searchQuery, setSearchQuery] = useState('');
    const [triggerSearch, { data: searchResponse }] = useLazySearchNotesQuery();
    const [focusedLayoutId, setFocusedLayoutId] = useState<string | null>(null);

    useEffect(() => {
      if (searchQuery.trim()) {
        triggerSearch({ search: searchQuery });
      }
    }, [searchQuery, triggerSearch]);

    const isSearchMode = searchQuery.trim().length > 0;

    const { userId } = useUser();

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
            snippet = `${start > 0 ? '... ' : ''}${payload.slice(
              start,
              end
            )}${end < payload.length ? ' ...' : ''}`;
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

      if (layoutsResponse?.data) {
        const owned = layoutsResponse.data.filter(
          l => !l.ownerId || l.ownerId === userId
        );
        const shared = layoutsResponse.data.filter(
          l => !!l.ownerId && l.ownerId !== userId
        );

        return [
          ...owned.map(layout => ({
            id: layout.id,
            type: 'layout' as const,
            title: layout.title,
            children: [],
            isMain: layout.isMain ?? false,
            access: getLayoutAccess(layout),
            createdAt: layout.createdAt,
            updatedAt: layout.updatedAt,
            isNotesLoaded: false,
            color: layout.color,
            ownerId: layout.ownerId,
          })),
          ...shared.map(layout => ({
            id: layout.id,
            type: 'layout' as const,
            title: layout.title,
            children: [],
            isMain: layout.isMain ?? false,
            access: getLayoutAccess(layout),
            createdAt: layout.createdAt,
            updatedAt: layout.updatedAt,
            isNotesLoaded: false,
            color: layout.color,
            ownerId: layout.ownerId,
          })),
        ];
      }

      return [];
    }, [
      layoutsResponse?.data,
      searchResponse,
      searchQuery,
      layoutAccessById,
      userId,
    ]);

    const sharedLayoutIds = useMemo(() => {
      const ids = new Set<string>();
      for (const layout of layoutsResponse?.data || []) {
        if (
          !!layout.ownerId &&
          layout.ownerId !== userId &&
          layout.isMain !== true
        ) {
          ids.add(layout.id);
        }
      }
      return ids;
    }, [layoutsResponse?.data, userId]);

    const nonSearchTreeItems = useMemo(
      () =>
        (fileTree ?? []).filter(
          item => item.type === 'layout' && item.isMain !== true
        ),
      [fileTree]
    );

    const ownedTreeItems = useMemo(
      () => nonSearchTreeItems.filter(item => !sharedLayoutIds.has(item.id)),
      [nonSearchTreeItems, sharedLayoutIds]
    );

    const sharedTreeItems = useMemo(
      () => nonSearchTreeItems.filter(item => sharedLayoutIds.has(item.id)),
      [nonSearchTreeItems, sharedLayoutIds]
    );

    const apiState = useSelector((state: NotesApiRootState) => state.api);

    const selectedParentId = useMemo(() => {
      if (!selectedItemId) return;

      for (const layout of layoutsResponse?.data || []) {
        for (let page = 1; page <= 3; page++) {
          const cached = notesApi.endpoints.getNotes.select({
            layoutId: layout.id,
            page,
          })({ api: apiState } as NotesApiRootState);

          if (cached?.data?.data?.some(n => n.id === selectedItemId)) {
            return layout.id;
          }
        }
      }
    }, [selectedItemId, layoutsResponse?.data, apiState]);

    useEffect(() => {
      if (selectedParentId) {
        setFocusedLayoutId(selectedParentId);
        return;
      }

      if (!selectedItemId) return;

      const selectedLayout = (layoutsResponse?.data || []).find(
        layout => layout.id === selectedItemId && layout.isMain !== true
      );

      if (selectedLayout) {
        setFocusedLayoutId(selectedLayout.id);
      }
    }, [selectedItemId, selectedParentId, layoutsResponse?.data]);

    const handleItemClick = useCallback(
      (item: FileTreeItemType) => {
        if (item.type === 'layout' && item.isMain !== true) {
          const isSameFocused = focusedLayoutId === item.id;
          const isExpanded = expandedItems.has(item.id);

          setFocusedLayoutId(item.id);

          if (isSameFocused) {
            toggleExpanded(item.id);
            return;
          }

          if (!isExpanded) {
            toggleExpanded(item.id);
          }
          return;
        }

        if (item.type === 'layout' && item.isMain === true) {
          onOpenGraph?.(item.id);
          return;
        }

        if (item.type === 'note' && item.parentId) {
          setFocusedLayoutId(item.parentId);
        }

        onItemSelect?.(item, item.type === 'note' ? 'preview' : 'pinned');
      },
      [
        expandedItems,
        focusedLayoutId,
        onItemSelect,
        onOpenGraph,
        toggleExpanded,
      ]
    );

    const handleItemDoubleClick = useCallback(
      (item: FileTreeItemType) => {
        if (item.type === 'note') {
          if (item.parentId) {
            setFocusedLayoutId(item.parentId);
          }
          onItemSelect?.(item, 'pinned');
        }
      },
      [onItemSelect]
    );

    const renderTreeItem = useCallback(
      (item: FileTreeItemType, level = 0) => {
        const isExpanded = expandedItems.has(item.id);

        const isSelected =
          item.type === 'note'
            ? selectedItemId === item.id
            : item.isMain !== true
              ? focusedLayoutId === item.id
              : selectedItemId === item.id || selectedParentId === item.id;

        return (
          <FileTreeItem
            key={item.id}
            item={item}
            level={level}
            isExpanded={isExpanded}
            isSelected={isSelected}
            isAnyNoteDragging={activeDragNote !== null}
            hasSelection={!!selectedItemId || !!focusedLayoutId}
            hasChildren={!!item.children?.length}
            onItemClick={handleItemClick}
            onItemDoubleClick={handleItemDoubleClick}
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
        focusedLayoutId,
        handleItemClick,
        onOpenGraph,
        toggleExpanded,
      ]
    );

    const collisionDetection = useCallback(
      (args: Parameters<typeof pointerWithin>[0]) => {
        const pointerHits = pointerWithin(args);
        if (pointerHits.length > 0) {
          const hitsWithoutActive = pointerHits.filter(
            hit => String(hit.id) !== String(args.active.id)
          );

          const hitsForSorting =
            hitsWithoutActive.length > 0 ? hitsWithoutActive : pointerHits;

          return [...hitsForSorting].sort((a, b) => {
            const aContainer = args.droppableContainers.find(
              container => String(container.id) === String(a.id)
            );
            const bContainer = args.droppableContainers.find(
              container => String(container.id) === String(b.id)
            );
            const aType = aContainer?.data?.current?.type;
            const bType = bContainer?.data?.current?.type;

            if (aType === bType) return 0;
            if (aType === 'layout') return -1;
            if (bType === 'layout') return 1;
            return 0;
          });
        }
        return closestCenter(args);
      },
      []
    );
    const renderSectionHeader = useCallback((title: string) => {
      return (
        <div className={cn('mb-1 flex items-center gap-2 px-1')}>
          <span
            className={cn(
              'text-muted-foreground shrink-0 text-[10px] font-medium tracking-[0.16em] uppercase'
            )}
          >
            {title}
          </span>
          <div
            className={cn(
              'border-border dark:border-dark-border flex-1 border-t'
            )}
          />
        </div>
      );
    }, []);

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToFirstScrollableAncestor]}
      >
        <div className='flex h-full flex-col'>
          <div className='px-1 py-1'>
            <SearchInput onSearchChange={setSearchQuery} />
          </div>

          {!isSearchMode && (
            <div className='px-1 py-0.5'>
              <AllNotesButton
                onAllNotesClick={() => {
                  const main = layoutsResponse?.data?.find(l => l.isMain);
                  if (main) onOpenGraph?.(main.id);
                }}
                isSelected={selectedItemId?.startsWith('graph-')}
              />
            </div>
          )}

          <div className='flex-1 overflow-y-auto px-1 py-0.5'>
            {isSearchMode ? (
              <div className='space-y-0'>
                {(fileTree ?? []).map(item => (
                  <FileTreeItem
                    key={item.id}
                    item={item}
                    level={0}
                    isExpanded={false}
                    isSelected={selectedItemId === item.id}
                    isAnyNoteDragging={activeDragNote !== null}
                    hasSelection={!!selectedItemId}
                    hasChildren={false}
                    onItemClick={handleItemClick}
                    renderChild={renderTreeItem}
                    toggleExpanded={toggleExpanded}
                  />
                ))}
              </div>
            ) : (
              <div>
                {ownedTreeItems.length > 0 && (
                  <div className='mb-2'>
                    {renderSectionHeader(t('fileTree:myFolders'))}
                    {ownedTreeItems.map(item => renderTreeItem(item, 0))}
                  </div>
                )}
                {sharedTreeItems.length > 0 && (
                  <div>
                    {renderSectionHeader(t('fileTree:sharedFolders'))}
                    {sharedTreeItems.map(item => renderTreeItem(item, 0))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DragOverlay
          adjustScale={false}
          dropAnimation={null}
          modifiers={[snapCenterToCursor]}
        >
          {activeDragNote ? (
            <div
              className={cn(
                'pointer-events-none',
                'flex',
                'min-w-45',
                'max-w-70',
                'items-center',
                'gap-2',
                'rounded-none',
                'border',
                'border-border/80',
                'bg-surface',
                'px-2.5',
                'py-1.5',
                'shadow-[0_8px_24px_rgba(0,0,0,0.22)]',
                'dark:border-dark-border/80',
                'dark:bg-dark-surface'
              )}
            >
              <FileText className={cn('h-3.5', 'w-3.5', 'shrink-0')} />
              <span className={cn('truncate', 'text-[13px]', 'leading-5')}>
                {activeDragNote.title || 'Untitled note'}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  }
);

FileTree.displayName = 'FileTree';
