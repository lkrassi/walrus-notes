import { getMyLayouts } from 'features/layout/api';
import { getNotes } from 'features/notes/api';
import {
  useCallback,
  useEffect,
  useReducer,
  useState,
} from 'react';
import type { Layout, Note } from 'shared/model/types/layouts';
import { useAppDispatch } from './redux';
import { useNotifications } from './useNotifications';
import { fileTreeReducer, initialFileTreeState } from './fileTreeReducer';

export type FileTreeItem = {
  id: string;
  type: 'layout' | 'note';
  title: string;
  children?: FileTreeItem[];
  parentId?: string;
  createdAt?: string;
  updatedAt?: string;
  note?: Note;
  isNotesLoaded?: boolean;
  hasMoreNotes?: boolean;
  currentPage?: number;
}

export const useFileTree = () => {
  const [state, dispatchFileTree] = useReducer(fileTreeReducer, initialFileTreeState);
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useNotifications();
  const dispatch = useAppDispatch();

  const { fileTree, expandedItems } = state;

  const loadLayoutsOnly = useCallback(async () => {
    setIsLoading(true);
    try {
      const layoutsResponse = await getMyLayouts(dispatch);
      if (!layoutsResponse?.data || !Array.isArray(layoutsResponse.data)) {
        throw new Error('Invalid response structure');
      }
      const layouts = layoutsResponse.data;

      dispatchFileTree({ type: 'LOAD_LAYOUTS', payload: layouts });
      showSuccess('Лэйауты загружены');
    } catch (error) {
      dispatchFileTree({ type: 'LOAD_LAYOUTS', payload: [] });
    } finally {
      setIsLoading(false);
    }
  }, [showSuccess, showError]);

  const loadNotesForLayout = useCallback(
    async (layoutId: string, page: number = 1) => {
      try {
        const notesResponse = await getNotes({
          layoutId,
          page,
        }, dispatch);
        const notes =
          notesResponse?.data && Array.isArray(notesResponse.data)
            ? notesResponse.data
            : [];
        const pagination = notesResponse?.pagination;
        const hasMore = pagination ? page < pagination.pages : false;

        dispatchFileTree({
          type: 'LOAD_NOTES',
          payload: {
            layoutId,
            notes,
            hasMore,
            currentPage: page,
            append: page > 1
          }
        });
      } catch (error) {
        showError('Ошибка при загрузке заметок');
      }
    },
    [showError]
  );

  const loadMoreNotes = useCallback(
    async (layoutId: string) => {
      const layout = fileTree.find(item => item.id === layoutId && item.type === 'layout');
      if (layout && layout.hasMoreNotes && layout.currentPage) {
        await loadNotesForLayout(layoutId, layout.currentPage + 1);
      }
    },
    [fileTree, loadNotesForLayout]
  );

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
      dispatchFileTree({ type: 'UPDATE_NOTE', payload: { noteId, updatedNote } });
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
      dispatchFileTree({ type: 'UPDATE_LAYOUT', payload: { layoutId, updatedLayout } });
    },
    []
  );

  useEffect(() => {
    dispatchFileTree({ type: 'CLEAN_EXPANDED' });
  }, [fileTree]);

  useEffect(() => {
    loadLayoutsOnly();
  }, [loadLayoutsOnly]);

  useEffect(() => {
    expandedItems.forEach(layoutId => {
      const layout = fileTree.find(
        item => item.id === layoutId && item.type === 'layout'
      );
      if (layout && !layout.isNotesLoaded) {
        loadNotesForLayout(layoutId);
      }
    });
  }, [expandedItems, fileTree, loadNotesForLayout]);

  const reloadLayouts = useCallback(() => {
    loadLayoutsOnly();
  }, [loadLayoutsOnly]);

  return {
    fileTree,
    isLoading,
    expandedItems,
    loadLayoutsOnly,
    reloadLayouts,
    toggleExpanded,
    addNoteToTree,
    removeNoteFromTree,
    updateNoteInTree,
    addLayoutToTree,
    removeLayoutFromTree,
    updateLayoutInTree,
    loadMoreNotes,
  };
};
