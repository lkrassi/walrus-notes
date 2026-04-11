import type { Layout } from '@/entities/layout';
import { useGetMyLayoutsQuery } from '@/entities/layout';
import type { Note } from '@/entities/note';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import {
  fileTreeReducer,
  initialFileTreeState,
  type FileTreeState,
} from './fileTreeReducer';
import { useAppSelector } from './redux';

const EXPANDED_ITEMS_KEY = 'fileTree:expandedItems';

const loadExpandedItems = (): Set<string> => {
  try {
    const stored = localStorage.getItem(EXPANDED_ITEMS_KEY);
    if (stored) {
      const arr = JSON.parse(stored) as string[];
      return new Set(arr);
    }
  } catch (e) {
    console.warn('Failed to load expanded file tree items from storage', e);
  }

  return new Set();
};

const saveExpandedItems = (items: Set<string>) => {
  try {
    localStorage.setItem(EXPANDED_ITEMS_KEY, JSON.stringify([...items]));
  } catch (e) {
    console.warn('Failed to save expanded file tree items to storage', e);
  }
};

const FileTreeContext = createContext<{
  moveNoteInTree: (
    noteId: string,
    fromLayoutId: string,
    toLayoutId: string
  ) => void;
  fileTree: FileTreeState['fileTree'];
  expandedItems: FileTreeState['expandedItems'];
  isLoading: boolean;
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
} | null>(null);

export const FileTreeProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatchFileTree] = useReducer(
    fileTreeReducer,
    undefined,
    () => ({
      ...initialFileTreeState,
      expandedItems: loadExpandedItems(),
    })
  );
  const [isLoading, setIsLoading] = useState(false);
  const { accessToken } = useAppSelector(state => state.user);
  const openTabs = useAppSelector(state => state.tabs.openTabs);

  const { fileTree, expandedItems } = state;

  const [hasToken, setHasToken] = useState(!!accessToken);

  useEffect(() => {
    setHasToken(!!accessToken);
  }, [accessToken]);

  const { data: layoutsResponse, isLoading: isLayoutsLoading } =
    useGetMyLayoutsQuery(undefined, { skip: !hasToken });

  useEffect(() => {
    if (layoutsResponse?.data && Array.isArray(layoutsResponse.data)) {
      dispatchFileTree({ type: 'LOAD_LAYOUTS', payload: layoutsResponse.data });
    }
  }, [layoutsResponse]);

  useEffect(() => {
    saveExpandedItems(expandedItems);
  }, [expandedItems]);

  const noteTabLayoutIds = useMemo(() => {
    const ids = new Set<string>();

    for (const tab of openTabs) {
      if (tab.item.type !== 'note') {
        continue;
      }

      const layoutId = tab.item.parentId || tab.item.note?.layoutId;
      if (layoutId) {
        ids.add(layoutId);
      }
    }

    return ids;
  }, [openTabs]);

  useEffect(() => {
    if (noteTabLayoutIds.size === 0) {
      return;
    }

    const itemsToExpand: string[] = [];
    for (const layoutId of noteTabLayoutIds) {
      if (!expandedItems.has(layoutId)) {
        itemsToExpand.push(layoutId);
      }
    }

    for (const layoutId of itemsToExpand) {
      dispatchFileTree({ type: 'TOGGLE_EXPANDED', payload: layoutId });
    }
  }, [fileTree, openTabs]);

  useEffect(() => {
    setIsLoading(isLayoutsLoading);
  }, [isLayoutsLoading]);

  const toggleExpanded = (itemId: string) => {
    dispatchFileTree({ type: 'TOGGLE_EXPANDED', payload: itemId });
  };

  const addNoteToTree = (layoutId: string, note: Note) => {
    dispatchFileTree({ type: 'ADD_NOTE', payload: { layoutId, note } });
  };

  const moveNoteInTree = (
    noteId: string,
    fromLayoutId: string,
    toLayoutId: string
  ) => {
    dispatchFileTree({
      type: 'MOVE_NOTE',
      payload: { noteId, fromLayoutId, toLayoutId },
    });
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

  const value = {
    moveNoteInTree,
    fileTree,
    expandedItems,
    isLoading,
    toggleExpanded,
    addNoteToTree,
    removeNoteFromTree,
    updateNoteInTree,
    addLayoutToTree,
    removeLayoutFromTree,
    updateLayoutInTree,
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
