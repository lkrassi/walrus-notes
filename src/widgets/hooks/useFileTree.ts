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

export const useFileTree = () => {
  const [state, dispatchFileTree] = useReducer(
    fileTreeReducer,
    initialFileTreeState
  );

  const { fileTree, expandedItems } = state;

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
