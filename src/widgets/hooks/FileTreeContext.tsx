import { createContext, useContext, useReducer, useCallback, useState, useEffect } from 'react';
import { getMyLayouts } from 'features/layout/api';
import { getNotes } from 'features/notes/api';
import type { Layout, Note } from 'shared/model/types/layouts';
import { useAppDispatch } from './redux';
import { useNotifications } from './useNotifications';
import { fileTreeReducer, initialFileTreeState, type FileTreeAction, type FileTreeState } from './fileTreeReducer';

const FileTreeContext = createContext<{
  fileTree: FileTreeState['fileTree'];
  expandedItems: FileTreeState['expandedItems'];
  isLoading: boolean;
  loadLayoutsOnly: () => Promise<void>;
  reloadLayouts: () => void;
  toggleExpanded: (itemId: string) => void;
  addNoteToTree: (layoutId: string, note: Note) => void;
  removeNoteFromTree: (noteId: string) => void;
  updateNoteInTree: (noteId: string, updatedNote: Partial<Note>) => void;
  addLayoutToTree: (layout: Layout) => void;
  removeLayoutFromTree: (layoutId: string) => void;
  updateLayoutInTree: (layoutId: string, updatedLayout: Partial<Layout>) => void;
} | null>(null);

export const FileTreeProvider = ({ children }: { children: React.ReactNode }) => {
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

      dispatch({ type: 'LOAD_LAYOUTS', payload: layouts });
      showSuccess('Лэйауты загружены');
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadNotesForLayout = useCallback(
    async (layoutId: string) => {
      try {
        const notesResponse = await getNotes({
          layoutId,
          page: 1,
        }, dispatch);
        const notes =
          notesResponse?.data && Array.isArray(notesResponse.data)
            ? notesResponse.data
            : [];

        dispatch({ type: 'LOAD_NOTES', payload: { layoutId, notes } });
      } catch (error) {
        showError('Ошибка при загрузке заметок');
      }
    },
    []
  );

  const toggleExpanded = useCallback((itemId: string) => {
    dispatch({ type: 'TOGGLE_EXPANDED', payload: itemId });
  }, []);

  const addNoteToTree = useCallback((layoutId: string, note: Note) => {
    dispatch({ type: 'ADD_NOTE', payload: { layoutId, note } });
  }, []);

  const removeNoteFromTree = useCallback((noteId: string) => {
    dispatch({ type: 'REMOVE_NOTE', payload: noteId });
  }, []);

  const updateNoteInTree = useCallback(
    (noteId: string, updatedNote: Partial<Note>) => {
      dispatch({ type: 'UPDATE_NOTE', payload: { noteId, updatedNote } });
    },
    []
  );

  const addLayoutToTree = useCallback((layout: Layout) => {
    dispatch({ type: 'ADD_LAYOUT', payload: layout });
  }, []);

  const removeLayoutFromTree = useCallback((layoutId: string) => {
    dispatch({ type: 'REMOVE_LAYOUT', payload: layoutId });
  }, []);

  const updateLayoutInTree = useCallback(
    (layoutId: string, updatedLayout: Partial<Layout>) => {
      dispatch({ type: 'UPDATE_LAYOUT', payload: { layoutId, updatedLayout } });
    },
    []
  );

  useEffect(() => {
    dispatch({ type: 'CLEAN_EXPANDED' });
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

  const value = {
    fileTree,
    expandedItems,
    isLoading,
    loadLayoutsOnly,
    reloadLayouts,
    toggleExpanded,
    addNoteToTree,
    removeNoteFromTree,
    updateNoteInTree,
    addLayoutToTree,
    removeLayoutFromTree,
    updateLayoutInTree,
  };

  return <FileTreeContext.Provider value={value}>{children}</FileTreeContext.Provider>;
};

export const useFileTree = () => {
  const context = useContext(FileTreeContext);
  if (!context) {
    throw new Error('useFileTree must be used within FileTreeProvider');
  }
  return context;
};
