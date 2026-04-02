import { useGetMyLayoutsQuery } from '@/entities';
import type { Layout } from '@/entities/layout';
import type { Note } from '@/entities/note';
import { getLoadingState } from '@/shared/lib/core';
import { useCallback, useEffect, useReducer } from 'react';
import { fileTreeReducer, initialFileTreeState } from './fileTreeReducer';

const EXPANDED_ITEMS_KEY = 'fileTree:expandedItems';

const loadExpandedItems = (): Set<string> => {
  try {
    const stored = localStorage.getItem(EXPANDED_ITEMS_KEY);
    if (stored) {
      const arr = JSON.parse(stored) as string[];
      return new Set(arr);
    }
  } catch (_e) {}
  return new Set();
};

const saveExpandedItems = (items: Set<string>) => {
  try {
    localStorage.setItem(EXPANDED_ITEMS_KEY, JSON.stringify([...items]));
  } catch (_e) {}
};

export const useFileTree = () => {
  const [state, dispatchFileTree] = useReducer(fileTreeReducer, {
    ...initialFileTreeState,
    expandedItems: loadExpandedItems(),
  });

  const { fileTree, expandedItems } = state;
  const { data: layoutsResponse, isLoading: isLayoutsLoading } =
    useGetMyLayoutsQuery(undefined);
  const { isInitialLoading: isInitialLayoutsLoading } = getLoadingState(
    isLayoutsLoading,
    layoutsResponse
  );

  useEffect(() => {
    saveExpandedItems(expandedItems);
  }, [expandedItems]);

  useEffect(() => {
    if (layoutsResponse?.data && Array.isArray(layoutsResponse.data)) {
      dispatchFileTree({ type: 'LOAD_LAYOUTS', payload: layoutsResponse.data });
    } else if (layoutsResponse) {
      dispatchFileTree({ type: 'LOAD_LAYOUTS', payload: [] });
    }
  }, [layoutsResponse]);

  const toggleExpanded = useCallback((itemId: string) => {
    dispatchFileTree({ type: 'TOGGLE_EXPANDED', payload: itemId });
  }, []);

  const addNoteToTree = useCallback((layoutId: string, note: Note) => {
    dispatchFileTree({ type: 'ADD_NOTE', payload: { layoutId, note } });
  }, []);

  const moveNoteInTree = useCallback(
    (noteId: string, fromLayoutId: string, toLayoutId: string) => {
      dispatchFileTree({
        type: 'MOVE_NOTE',
        payload: { noteId, fromLayoutId, toLayoutId },
      });
    },
    []
  );

  const removeNoteFromTree = useCallback((noteId: string) => {
    dispatchFileTree({ type: 'REMOVE_NOTE', payload: noteId });
  }, []);

  const updateNoteInTree = useCallback(
    (noteId: string, updatedNote: Partial<Note>) => {
      dispatchFileTree({
        type: 'UPDATE_NOTE',
        payload: { noteId, updatedNote },
      });
    },
    []
  );

  const addLayoutToTree = useCallback((layout: Layout) => {
    dispatchFileTree({ type: 'ADD_LAYOUT', payload: layout });
  }, []);

  const removeLayoutFromTree = useCallback((layoutId: string) => {
    dispatchFileTree({ type: 'REMOVE_LAYOUT', payload: layoutId });
  }, []);

  const updateLayoutInTree = useCallback(
    (layoutId: string, updatedLayout: Partial<Layout>) => {
      dispatchFileTree({
        type: 'UPDATE_LAYOUT',
        payload: { layoutId, updatedLayout },
      });
    },
    []
  );

  return {
    fileTree,
    expandedItems,
    isLayoutsLoading,
    isInitialLayoutsLoading,
    moveNoteInTree,
    toggleExpanded,
    addNoteToTree,
    removeNoteFromTree,
    updateNoteInTree,
    addLayoutToTree,
    removeLayoutFromTree,
    updateLayoutInTree,
  };
};
