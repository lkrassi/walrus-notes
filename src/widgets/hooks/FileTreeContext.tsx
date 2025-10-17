import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react';
import type { Layout, Note } from 'shared/model/types/layouts';
import { useGetMyLayoutsQuery } from 'widgets/model/stores/api';
import {
  fileTreeReducer,
  initialFileTreeState,
  type FileTreeState,
} from './fileTreeReducer';
import { useNotifications } from './useNotifications';

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
  updateLayoutInTree: (
    layoutId: string,
    updatedLayout: Partial<Layout>
  ) => void;
  loadMoreNotes: (layoutId: string) => Promise<void>;
} | null>(null);

export const FileTreeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatchFileTree] = useReducer(
    fileTreeReducer,
    initialFileTreeState
  );
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useNotifications();

  const { fileTree, expandedItems } = state;

  const [hasToken, setHasToken] = useState(
    !!localStorage.getItem('accessToken')
  );

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('accessToken');
      setHasToken(!!token);
    };

    checkToken();

    const handleTokenSet = () => {
      setHasToken(true);
      setTimeout(() => refetch(), 100);
    };

    window.addEventListener('tokenSet', handleTokenSet);
    window.addEventListener('storage', checkToken);

    return () => {
      window.removeEventListener('tokenSet', handleTokenSet);
      window.removeEventListener('storage', checkToken);
    };
  }, []);

  const {
    data: layoutsResponse,
    isLoading: isLayoutsLoading,
    error: layoutsError,
    refetch,
  } = useGetMyLayoutsQuery(undefined, {
    skip: !hasToken,
  });

  useEffect(() => {
    if (layoutsResponse?.data && Array.isArray(layoutsResponse.data)) {
      dispatchFileTree({ type: 'LOAD_LAYOUTS', payload: layoutsResponse.data });
      showSuccess('Лэйауты загружены');
    }
  }, [layoutsResponse, showSuccess]);

  useEffect(() => {
    setIsLoading(isLayoutsLoading);
  }, [isLayoutsLoading]);

  const loadLayoutsOnly = async () => {};

  const loadMoreNotes = async (layoutId: string) => {};

  const toggleExpanded = (itemId: string) => {
    dispatchFileTree({ type: 'TOGGLE_EXPANDED', payload: itemId });
  };

  const addNoteToTree = (layoutId: string, note: Note) => {
    dispatchFileTree({ type: 'ADD_NOTE', payload: { layoutId, note } });
  };

  const removeNoteFromTree = (noteId: string) => {
    dispatchFileTree({ type: 'REMOVE_NOTE', payload: noteId });
  };

  const updateNoteInTree = (noteId: string, updatedNote: Partial<Note>) => {
    dispatchFileTree({ type: 'UPDATE_NOTE', payload: { noteId, updatedNote } });
  };

  const addLayoutToTree = (layout: Layout) => {
    dispatchFileTree({ type: 'ADD_LAYOUT', payload: layout });
  };

  const removeLayoutFromTree = (layoutId: string) => {
    dispatchFileTree({ type: 'REMOVE_LAYOUT', payload: layoutId });
  };

  const updateLayoutInTree = (
    layoutId: string,
    updatedLayout: Partial<Layout>
  ) => {
    dispatchFileTree({
      type: 'UPDATE_LAYOUT',
      payload: { layoutId, updatedLayout },
    });
  };

  useEffect(() => {
    dispatchFileTree({ type: 'CLEAN_EXPANDED' });
  }, [fileTree]);

  const reloadLayouts = () => {};

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
    loadMoreNotes,
  };

  return (
    <FileTreeContext.Provider value={value}>
      {children}
    </FileTreeContext.Provider>
  );
};

export const useFileTree = () => {
  const context = useContext(FileTreeContext);
  if (!context) {
    throw new Error('useFileTree must be used within FileTreeProvider');
  }
  return context;
};
