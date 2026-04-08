import {
  getLayoutAccess,
  useGetMyLayoutsQuery,
  useLazySearchNotesQuery,
} from '@/entities';
import type { Note } from '@/entities/note';
import type { FileTreeItem as FileTreeItemType } from '@/entities/tab';
import { useUser } from '@/entities/user';
import { useDebounced } from '@/shared/lib/react/hooks';
import { useFileTree } from '@/widgets/hooks';
import { useEffect, useMemo } from 'react';
import type { FileTreeSection } from './types';

interface UseFileTreeDataOptions {
  searchQuery: string;
}

export const useFileTreeData = ({ searchQuery }: UseFileTreeDataOptions) => {
  const { fileTree: contextFileTree } = useFileTree();
  const { data: layoutsResponse, isLoading: isLayoutsLoading } =
    useGetMyLayoutsQuery(undefined);
  const [triggerSearch, { data: searchResponse, isFetching: isSearching }] =
    useLazySearchNotesQuery();
  const debouncedSearchQuery = useDebounced(searchQuery, 300);
  const { userId } = useUser();

  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      triggerSearch({ search: debouncedSearchQuery });
    }
  }, [debouncedSearchQuery, triggerSearch]);

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

  const isSearchMode = searchQuery.trim().length > 0;

  const searchItems = useMemo(() => {
    if (!searchQuery || !searchResponse?.data) {
      return [] as FileTreeItemType[];
    }

    const q = searchQuery.trim().toLowerCase();

    return searchResponse.data.map(noteData => {
      const title = (noteData.title || '').toString();
      const payload = (noteData.payload || '').toString();

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

      const note = { ...noteData } as Note & {
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
        id: noteData.id,
        type: 'note' as const,
        title: noteData.title,
        isMain: noteData.isMain ?? false,
        parentId: noteData.layoutId || undefined,
        access: noteData.layoutId
          ? layoutAccessById.get(noteData.layoutId)
          : undefined,
        createdAt: noteData.createdAt,
        updatedAt: noteData.updatedAt,
        note,
      };
    });
  }, [layoutAccessById, searchQuery, searchResponse]);

  const nonSearchTreeItems = useMemo(
    () =>
      (contextFileTree ?? []).filter(
        item => item.type === 'layout' && item.isMain !== true
      ),
    [contextFileTree]
  );

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

  const ownedTreeItems = useMemo(
    () => nonSearchTreeItems.filter(item => !sharedLayoutIds.has(item.id)),
    [nonSearchTreeItems, sharedLayoutIds]
  );

  const sharedTreeItems = useMemo(
    () => nonSearchTreeItems.filter(item => sharedLayoutIds.has(item.id)),
    [nonSearchTreeItems, sharedLayoutIds]
  );

  const sections = useMemo<FileTreeSection[]>(() => {
    if (isSearchMode) {
      return [{ id: 'search', items: searchItems }];
    }

    const nextSections: FileTreeSection[] = [];

    if (ownedTreeItems.length > 0) {
      nextSections.push({ id: 'owned', items: ownedTreeItems });
    }

    if (sharedTreeItems.length > 0) {
      nextSections.push({ id: 'shared', items: sharedTreeItems });
    }

    return nextSections;
  }, [isSearchMode, ownedTreeItems, searchItems, sharedTreeItems]);

  return {
    sections,
    layoutAccessById,
    layouts: layoutsResponse?.data ?? [],
    isSearchMode,
    isLoading: isLayoutsLoading || isSearching,
  } as const;
};
