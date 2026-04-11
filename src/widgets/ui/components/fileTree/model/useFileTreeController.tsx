import type { Note } from '@/entities/note';
import { useDragNoteMutation } from '@/entities/note';
import type { FileTreeItem as FileTreeItemType } from '@/entities/tab';
import { cn } from '@/shared/lib/core';
import { useFileTree, useLocalStorage } from '@/widgets/hooks';
import { useNotifications } from '@/widgets/hooks/useNotifications';
import {
  closestCenter,
  pointerWithin,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileTreeItem } from '../FileTreeItem';
import type { ActiveDragNote } from './types';
import { useFileTreeData } from './useFileTreeData';

interface UseFileTreeControllerProps {
  expandedItems: Set<string>;
  toggleExpanded: (itemId: string) => void;
  onItemSelect?: (item: FileTreeItemType, mode?: 'preview' | 'pinned') => void;
  selectedItemId?: string;
  onOpenGraph?: (layoutId: string) => void;
}

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

type PinScope = 'owned' | 'shared';

type PinnedItemsStorage = {
  layouts: Record<PinScope, string[]>;
  notes: Record<PinScope, Record<string, string[]>>;
};

const PINNED_STORAGE_KEY = 'fileTree:pinned:v1';

const EMPTY_PINNED_STATE: PinnedItemsStorage = {
  layouts: { owned: [], shared: [] },
  notes: { owned: {}, shared: {} },
};

export const useFileTreeController = ({
  expandedItems,
  toggleExpanded,
  onItemSelect,
  selectedItemId,
  onOpenGraph,
}: UseFileTreeControllerProps) => {
  const { t } = useTranslation();
  const { showError } = useNotifications();
  const { moveNoteInTree } = useFileTree();
  const [dragNote] = useDragNoteMutation();

  const [searchQuery, setSearchQuery] = useState('');
  const [pinnedItems, setPinnedItems] = useLocalStorage<PinnedItemsStorage>(
    PINNED_STORAGE_KEY,
    EMPTY_PINNED_STATE
  );
  const {
    sections,
    layoutScopeById,
    layoutAccessById,
    layouts,
    isSearchMode,
    isLoading,
  } = useFileTreeData({ searchQuery });

  const [activeDragNote, setActiveDragNote] = useState<ActiveDragNote | null>(
    null
  );
  const dragStartLayoutIdRef = useRef<string | null>(null);

  const [focusedLayoutId, setFocusedLayoutId] = useState<string | null>(null);

  const normalizedPinnedItems = useMemo<PinnedItemsStorage>(
    () => ({
      layouts: {
        owned: Array.isArray(pinnedItems?.layouts?.owned)
          ? pinnedItems.layouts.owned
          : [],
        shared: Array.isArray(pinnedItems?.layouts?.shared)
          ? pinnedItems.layouts.shared
          : [],
      },
      notes: {
        owned:
          pinnedItems?.notes?.owned &&
          typeof pinnedItems.notes.owned === 'object'
            ? pinnedItems.notes.owned
            : {},
        shared:
          pinnedItems?.notes?.shared &&
          typeof pinnedItems.notes.shared === 'object'
            ? pinnedItems.notes.shared
            : {},
      },
    }),
    [pinnedItems]
  );

  const toggleLayoutPin = useCallback(
    (layoutId: string, scope: PinScope) => {
      setPinnedItems(prev => {
        const prevState = prev || EMPTY_PINNED_STATE;
        const currentIds = new Set(prevState.layouts[scope] || []);
        if (currentIds.has(layoutId)) {
          currentIds.delete(layoutId);
        } else {
          currentIds.add(layoutId);
        }

        return {
          layouts: {
            ...prevState.layouts,
            [scope]: Array.from(currentIds),
          },
          notes: {
            ...prevState.notes,
          },
        };
      });
    },
    [setPinnedItems]
  );

  const toggleNotePin = useCallback(
    (layoutId: string, noteId: string, scope: PinScope) => {
      setPinnedItems(prev => {
        const prevState = prev || EMPTY_PINNED_STATE;
        const scopedNotes = prevState.notes[scope] || {};
        const currentIds = new Set(scopedNotes[layoutId] || []);
        if (currentIds.has(noteId)) {
          currentIds.delete(noteId);
        } else {
          currentIds.add(noteId);
        }

        return {
          layouts: {
            ...prevState.layouts,
          },
          notes: {
            ...prevState.notes,
            [scope]: {
              ...scopedNotes,
              [layoutId]: Array.from(currentIds),
            },
          },
        };
      });
    },
    [setPinnedItems]
  );

  const sectionsWithPins = useMemo(() => {
    if (isSearchMode) {
      return sections;
    }

    const byIndex = (arr: string[]) =>
      new Map(arr.map((id, index) => [id, index] as const));

    return sections.map(section => {
      if (section.id !== 'owned' && section.id !== 'shared') {
        return section;
      }

      const scope = section.id;
      const pinnedIds = normalizedPinnedItems.layouts[scope] || [];
      const pinnedSet = new Set(pinnedIds);
      const pinnedOrder = byIndex(pinnedIds);

      const sorted = [...section.items].sort((a, b) => {
        const aPinned = pinnedSet.has(a.id);
        const bPinned = pinnedSet.has(b.id);
        if (aPinned !== bPinned) {
          return aPinned ? -1 : 1;
        }

        if (aPinned && bPinned) {
          const ai = pinnedOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER;
          const bi = pinnedOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER;
          return ai - bi;
        }

        return 0;
      });

      return {
        ...section,
        items: sorted,
      };
    });
  }, [isSearchMode, normalizedPinnedItems.layouts, sections]);

  const sortNotesForLayout = useCallback(
    (layoutId: string, notes: Note[]) => {
      const scope = layoutScopeById.get(layoutId);
      if (!scope) {
        return notes;
      }

      const pinnedIds = normalizedPinnedItems.notes[scope]?.[layoutId] || [];
      if (pinnedIds.length === 0) {
        return notes;
      }

      const pinnedSet = new Set(pinnedIds);
      const pinnedOrder = new Map(
        pinnedIds.map((id, index) => [id, index] as const)
      );

      return [...notes].sort((a, b) => {
        const aPinned = pinnedSet.has(a.id);
        const bPinned = pinnedSet.has(b.id);
        if (aPinned !== bPinned) {
          return aPinned ? -1 : 1;
        }

        if (aPinned && bPinned) {
          const ai = pinnedOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER;
          const bi = pinnedOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER;
          return ai - bi;
        }

        return 0;
      });
    },
    [layoutScopeById, normalizedPinnedItems.notes]
  );

  const isItemPinned = useCallback(
    (item: FileTreeItemType) => {
      if (item.type === 'layout') {
        const scope = layoutScopeById.get(item.id);
        if (!scope) {
          return false;
        }

        return normalizedPinnedItems.layouts[scope]?.includes(item.id) || false;
      }

      if (item.type === 'note' && item.parentId) {
        const scope = layoutScopeById.get(item.parentId);
        if (!scope) {
          return false;
        }

        return (
          normalizedPinnedItems.notes[scope]?.[item.parentId]?.includes(
            item.id
          ) || false
        );
      }

      return false;
    },
    [
      layoutScopeById,
      normalizedPinnedItems.layouts,
      normalizedPinnedItems.notes,
    ]
  );

  const handleTogglePin = useCallback(
    (item: FileTreeItemType) => {
      if (item.type === 'layout') {
        const scope = layoutScopeById.get(item.id);
        if (!scope) {
          return;
        }

        toggleLayoutPin(item.id, scope);
        return;
      }

      if (item.type === 'note' && item.parentId) {
        const scope = layoutScopeById.get(item.parentId);
        if (!scope) {
          return;
        }

        toggleNotePin(item.parentId, item.id, scope);
      }
    },
    [layoutScopeById, toggleLayoutPin, toggleNotePin]
  );

  const selectedParentId = useMemo(() => {
    if (!selectedItemId) return;

    const visitItems = (items: FileTreeItemType[]): string | undefined => {
      for (const item of items) {
        if (item.id === selectedItemId) {
          return item.type === 'note' ? item.parentId : item.id;
        }

        if (!item.children?.length) {
          continue;
        }

        const foundInChildren = visitItems(item.children as FileTreeItemType[]);
        if (foundInChildren) {
          return item.type === 'layout' ? item.id : foundInChildren;
        }
      }

      return undefined;
    };

    return visitItems(sectionsWithPins.flatMap(section => section.items));
  }, [sectionsWithPins, selectedItemId]);

  useEffect(() => {
    if (selectedParentId) {
      setFocusedLayoutId(selectedParentId);
      return;
    }

    if (!selectedItemId) return;

    const selectedLayout = layouts.find(
      layout => layout.id === selectedItemId && layout.isMain !== true
    );

    if (selectedLayout) {
      setFocusedLayoutId(selectedLayout.id);
    }
  }, [selectedItemId, selectedParentId, layouts]);

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
        showError('Недостаточно прав для переноса заметки в выбранную папку.');
        dragStartLayoutIdRef.current = null;
        return;
      }

      moveNoteInTree(activeData.noteId, fromLayoutId, toLayoutId);

      await dragNote({
        noteId: activeData.noteId,
        toLayoutId,
      }).unwrap();

      dragStartLayoutIdRef.current = null;
    },
    [layoutAccessById, moveNoteInTree, dragNote, showError]
  );

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
    [expandedItems, focusedLayoutId, onItemSelect, onOpenGraph, toggleExpanded]
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
          isPinned={isItemPinned(item)}
          isAnyNoteDragging={activeDragNote !== null}
          hasSelection={!!selectedItemId || !!focusedLayoutId}
          hasChildren={!!item.children?.length}
          onItemClick={handleItemClick}
          onTogglePin={handleTogglePin}
          onItemDoubleClick={handleItemDoubleClick}
          onOpenGraph={onOpenGraph}
          sortNotes={sortNotesForLayout}
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
      activeDragNote,
      isItemPinned,
      handleTogglePin,
      handleItemClick,
      handleItemDoubleClick,
      onOpenGraph,
      sortNotesForLayout,
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

  const sectionTitles = useMemo(
    () => ({
      owned: t('fileTree:myFolders'),
      shared: t('fileTree:sharedFolders'),
    }),
    [t]
  );

  const handleAllNotesClick = useCallback(() => {
    const mainLayout = layouts.find(layout => layout.isMain);
    if (mainLayout) {
      onOpenGraph?.(mainLayout.id);
    }
  }, [layouts, onOpenGraph]);

  return {
    searchQuery,
    setSearchQuery,
    isSearchMode,
    isLoading,
    sections: sectionsWithPins,
    sectionTitles,
    activeDragNote,
    collisionDetection,
    handleDragStart,
    handleDragCancel,
    handleDragEnd,
    renderSectionHeader,
    renderTreeItem,
    handleAllNotesClick,
  } as const;
};
