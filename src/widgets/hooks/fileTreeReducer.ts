import type { Layout, Note } from 'shared/model/types/layouts';
import type { FileTreeItem } from './useFileTree';

export type FileTreeState = {
  fileTree: FileTreeItem[];
  expandedItems: Set<string>;
};

export type FileTreeAction =
  | { type: 'LOAD_LAYOUTS'; payload: Layout[] }
  | {
      type: 'LOAD_NOTES';
      payload: {
        layoutId: string;
        notes: Note[];
        hasMore?: boolean;
        currentPage?: number;
        append?: boolean;
      };
    }
  | { type: 'TOGGLE_EXPANDED'; payload: string }
  | { type: 'ADD_NOTE'; payload: { layoutId: string; note: Note } }
  | { type: 'REMOVE_NOTE'; payload: string }
  | {
      type: 'UPDATE_NOTE';
      payload: { noteId: string; updatedNote: Partial<Note> };
    }
  | { type: 'ADD_LAYOUT'; payload: Layout }
  | { type: 'REMOVE_LAYOUT'; payload: string }
  | {
      type: 'UPDATE_LAYOUT';
      payload: { layoutId: string; updatedLayout: Partial<Layout> };
    }
  | { type: 'CLEAN_EXPANDED' };

export const initialFileTreeState: FileTreeState = {
  fileTree: [],
  expandedItems: new Set(),
};

export const fileTreeReducer = (
  state: FileTreeState,
  action: FileTreeAction
): FileTreeState => {
  switch (action.type) {
    case 'LOAD_LAYOUTS': {
      const treeItems: FileTreeItem[] = action.payload.map(layout => ({
        id: layout.id,
        type: 'layout' as const,
        title: layout.title,
        children: [],
        isMain: layout.isMain === true,
        createdAt: layout.createdAt,
        updatedAt: layout.updatedAt,
        color: layout.color,
        isNotesLoaded: false,
      }));
      return {
        ...state,
        fileTree: treeItems,
      };
    }
    case 'LOAD_NOTES': {
      const {
        layoutId,
        notes,
        hasMore = false,
        currentPage = 1,
        append = false,
      } = action.payload;
      return {
        ...state,
        fileTree: state.fileTree.map(layout =>
          layout.id === layoutId
            ? {
                ...layout,
                children: append
                  ? [
                      ...(layout.children || []),
                      ...notes.map((note: Note) => ({
                        id: note.id,
                        type: 'note' as const,
                        title: note.title,
                        parentId: layoutId,
                        isMain: false,
                        createdAt: note.createdAt,
                        updatedAt: note.updatedAt,
                        note: note,
                      })),
                    ]
                  : notes.map((note: Note) => ({
                      id: note.id,
                      type: 'note' as const,
                      title: note.title,
                      parentId: layoutId,
                      isMain: false,
                      createdAt: note.createdAt,
                      updatedAt: note.updatedAt,
                      note: note,
                    })),
                isNotesLoaded: true,
                hasMoreNotes: hasMore,
                currentPage: currentPage,
              }
            : layout
        ),
      };
    }
    case 'TOGGLE_EXPANDED': {
      const newSet = new Set(state.expandedItems);
      if (newSet.has(action.payload)) {
        newSet.delete(action.payload);
      } else {
        newSet.add(action.payload);
      }
      return {
        ...state,
        expandedItems: newSet,
      };
    }
    case 'ADD_NOTE': {
      const { layoutId, note } = action.payload;
      const newNote: FileTreeItem = {
        id: note.id,
        type: 'note',
        title: note.title,
        parentId: layoutId,
        isMain: false,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        note: note,
      };
      return {
        ...state,
        fileTree: state.fileTree.map(layout =>
          layout.id === layoutId
            ? {
                ...layout,
                children: [...(layout.children || []), newNote],
              }
            : layout
        ),
      };
    }
    case 'REMOVE_NOTE': {
      return {
        ...state,
        fileTree: state.fileTree.map(layout => ({
          ...layout,
          children:
            layout.children?.filter(child => child.id !== action.payload) || [],
        })),
      };
    }
    case 'UPDATE_NOTE': {
      const { noteId, updatedNote } = action.payload;
      return {
        ...state,
        fileTree: state.fileTree.map(layout => ({
          ...layout,
          children:
            layout.children?.map(child =>
              child.id === noteId
                ? {
                    ...child,
                    title: updatedNote.title || child.title,
                    updatedAt: updatedNote.updatedAt || child.updatedAt,
                    note: child.note
                      ? { ...child.note, ...updatedNote }
                      : undefined,
                  }
                : child
            ) || [],
        })),
      };
    }
    case 'ADD_LAYOUT': {
      const newLayoutItem: FileTreeItem = {
        id: action.payload.id,
        type: 'layout',
        title: action.payload.title,
        children: [],
        isMain: action.payload.isMain === true,
        createdAt: action.payload.createdAt,
        updatedAt: action.payload.updatedAt,
        color: action.payload.color,
      };
      return {
        ...state,
        fileTree: [...state.fileTree, newLayoutItem],
      };
    }
    case 'REMOVE_LAYOUT': {
      return {
        ...state,
        fileTree: state.fileTree.filter(layout => layout.id !== action.payload),
      };
    }
    case 'UPDATE_LAYOUT': {
      const { layoutId, updatedLayout } = action.payload;
      return {
        ...state,
        fileTree: state.fileTree.map(layout =>
          layout.id === layoutId
            ? {
                ...layout,
                title: updatedLayout.title || layout.title,
                updatedAt: updatedLayout.updatedAt || layout.updatedAt,
                color: updatedLayout.color || layout.color,
              }
            : layout
        ),
      };
    }
    case 'CLEAN_EXPANDED': {
      const newSet = new Set(state.expandedItems);
      newSet.forEach(id => {
        if (!state.fileTree.some(item => item.id === id)) {
          newSet.delete(id);
        }
      });
      return {
        ...state,
        expandedItems: newSet,
      };
    }
    default:
      return state;
  }
};
