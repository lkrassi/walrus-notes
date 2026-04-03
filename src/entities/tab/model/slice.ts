import type { Note } from '@/entities/note';
import {
  createSlice,
  type PayloadAction,
  type Reducer,
} from '@reduxjs/toolkit';
import { createTabId, parseTabId, type TabType } from '../lib/tabUtils';
import type { FileTreeItem } from './types';

export interface DashboardTab {
  id: string;
  item: FileTreeItem;
  isActive: boolean;
}

export interface TabsState {
  openTabs: DashboardTab[];
  activeTabId: string | null;
}

const TABS_STORAGE_KEY = 'dashboard:tabs';

const sanitizeNoteForTab = (note: Note): Note => {
  const { payload, draft: _draft, ...rest } = note;
  return {
    ...rest,
    payload: payload ?? '',
    draft: undefined,
  };
};

const sanitizeTabForStorage = (tab: DashboardTab): DashboardTab => {
  if (tab.item.type !== 'note' || !tab.item.note) {
    return tab;
  }

  return {
    ...tab,
    item: {
      ...tab.item,
      note: sanitizeNoteForTab(tab.item.note),
    },
  };
};

const sanitizeTabsState = (state: TabsState): TabsState => ({
  ...state,
  openTabs: state.openTabs.map(sanitizeTabForStorage),
});

const loadTabsFromStorage = (): TabsState => {
  try {
    const stored = localStorage.getItem(TABS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as TabsState;
      if (Array.isArray(parsed.openTabs)) {
        const sanitized = sanitizeTabsState(parsed);

        return sanitized;
      }
    }
  } catch (_e) {}
  return { openTabs: [], activeTabId: null };
};

export const saveTabsToStorage = (state: TabsState) => {
  try {
    const sanitized = sanitizeTabsState(state);
    localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(sanitized));
  } catch (_e) {}
};

const initialState: TabsState = loadTabsFromStorage();

const updateActiveTab = (state: TabsState) => {
  if (
    state.activeTabId &&
    !state.openTabs.find(tab => tab.id === state.activeTabId)
  ) {
    if (state.openTabs.length > 0) {
      state.openTabs[state.openTabs.length - 1].isActive = true;
      state.activeTabId = state.openTabs[state.openTabs.length - 1].id;
    } else {
      state.activeTabId = null;
    }
  }

  state.openTabs.forEach(tab => {
    tab.isActive = tab.id === state.activeTabId;
  });
};

const tabsSlice = createSlice({
  name: 'tabs',
  initialState,
  reducers: {
    initializeTabs: (state, action: PayloadAction<TabsState>) => {
      state.openTabs = action.payload.openTabs;
      state.activeTabId = action.payload.activeTabId;
      updateActiveTab(state);
    },

    openTab: (state, action: PayloadAction<FileTreeItem>) => {
      const item = action.payload;
      const tabId = createTabId(item.type, item.id);
      const existingTab = state.openTabs.find(tab => tab.id === tabId);
      if (existingTab) return;

      state.openTabs.push({
        id: tabId,
        item,
        isActive: false,
      });

      updateActiveTab(state);
    },

    switchTab: (state, action: PayloadAction<string>) => {
      const tabId = action.payload;
      state.activeTabId = tabId;
      updateActiveTab(state);
    },

    closeTab: (state, action: PayloadAction<string>) => {
      const tabId = action.payload;
      state.openTabs = state.openTabs.filter(tab => tab.id !== tabId);
      updateActiveTab(state);
    },

    closeTabsByItemId: (
      state,
      action: PayloadAction<{ itemId: string; itemType?: TabType }>
    ) => {
      const { itemId, itemType } = action.payload;

      const tabsToClose = state.openTabs.filter(tab => {
        const { type, id } = parseTabId(tab.id);
        return itemType ? type === itemType && id === itemId : id === itemId;
      });

      const closedTabIds = tabsToClose.map(tab => tab.id);
      state.openTabs = state.openTabs.filter(
        tab => !closedTabIds.includes(tab.id)
      );

      updateActiveTab(state);
    },

    closeLayoutTabs: (state, action: PayloadAction<string>) => {
      const layoutId = action.payload;

      const tabsToClose = state.openTabs.filter(tab => {
        const { type, id } = parseTabId(tab.id);

        if (type === 'layout') {
          return id === layoutId;
        }
        if (type === 'note') {
          return tab.item.parentId === layoutId;
        }
        if (type === 'graph') {
          return tab.item.layoutId === layoutId;
        }
        return false;
      });

      const closedTabIds = tabsToClose.map(tab => tab.id);
      state.openTabs = state.openTabs.filter(
        tab => !closedTabIds.includes(tab.id)
      );

      updateActiveTab(state);
    },

    reorderTabs: (state, action: PayloadAction<DashboardTab[]>) => {
      state.openTabs = action.payload;
      updateActiveTab(state);
    },

    updateTabNote: (
      state,
      action: PayloadAction<{ noteId: string; updates: Partial<Note> }>
    ) => {
      const { noteId, updates } = action.payload;

      state.openTabs.forEach(tab => {
        const { type, id } = parseTabId(tab.id);

        if (
          type === 'note' &&
          id === noteId &&
          tab.item.type === 'note' &&
          tab.item.note
        ) {
          const newNote = { ...tab.item.note, ...updates };
          if (updates.draft === '') {
            delete newNote.draft;
          }
          tab.item.note = newNote;
          tab.item.title = updates.title || tab.item.title;
        }
      });
    },

    clearTabs: state => {
      state.openTabs = [];
      state.activeTabId = null;
    },
  },
});

export const {
  initializeTabs,
  openTab,
  switchTab,
  closeTab,
  closeTabsByItemId,
  closeLayoutTabs,
  reorderTabs,
  updateTabNote,
  clearTabs,
} = tabsSlice.actions;

export const tabsReducer = tabsSlice.reducer as Reducer<TabsState>;
