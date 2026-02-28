import { useGetMyLayoutsQuery } from 'app/store/api';
import { useCallback, useEffect, useReducer } from 'react';
import type { Layout, Note } from 'shared/model/types/layouts';
import { fileTreeReducer, initialFileTreeState } from './fileTreeReducer';

export type FileTreeItem = {
  id: string;
  type: 'layout' | 'note' | 'graph';
  title: string;
  isMain: boolean;
  color?: string;
  children?: FileTreeItem[];
  parentId?: string;
  createdAt?: string;
  updatedAt?: string;
  note?: Note;
  layoutId?: string;
  openedFromSidebar?: boolean;
};

const EXPANDED_ITEMS_KEY = 'fileTree:expandedItems';

// Load expanded items from localStorage
const loadExpandedItems = (): Set<string> => {
  try {
    const stored = localStorage.getItem(EXPANDED_ITEMS_KEY);
    if (stored) {
      const arr = JSON.parse(stored) as string[];
      return new Set(arr);
    }
  } catch (_e) {
    // ignore
  }
  return new Set();
};

// Save expanded items to localStorage
const saveExpandedItems = (items: Set<string>) => {
  try {
    localStorage.setItem(EXPANDED_ITEMS_KEY, JSON.stringify([...items]));
  } catch (_e) {
    // ignore
  }
};

export const useFileTree = () => {
  const [state, dispatchFileTree] = useReducer(fileTreeReducer, {
    ...initialFileTreeState,
    expandedItems: loadExpandedItems(),
  });

  const { fileTree, expandedItems } = state;

  // Save expandedItems to localStorage whenever it changes
  useEffect(() => {
    saveExpandedItems(expandedItems);
  }, [expandedItems]);

  const { data: layoutsResponse } = useGetMyLayoutsQuery(undefined);

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
    toggleExpanded,
    addNoteToTree,
    removeNoteFromTree,
    updateNoteInTree,
    addLayoutToTree,
    removeLayoutFromTree,
    updateLayoutInTree,
  };
};
