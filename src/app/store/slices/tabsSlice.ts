import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Note } from 'shared/model/types/layouts';
import type { FileTreeItem } from 'widgets/hooks';
import {
  createTabId,
  parseTabId,
  type TabType,
} from 'widgets/model/utils/tabUtils';

export interface DashboardTab {
  id: string;
  item: FileTreeItem;
  isActive: boolean;
}

export interface TabsState {
  openTabs: DashboardTab[];
  activeTabId: string | null;
}

const initialState: TabsState = {
  openTabs: [],
  activeTabId: null,
};

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
};

export const tabsSlice = createSlice({
  name: 'tabs',
  initialState,
  reducers: {
    initializeTabs: (state, action: PayloadAction<TabsState>) => {
      // Загружает сохраненное состояние вкладок из localStorage
      state.openTabs = action.payload.openTabs;
      state.activeTabId = action.payload.activeTabId;
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
    },

    switchTab: (state, action: PayloadAction<string>) => {
      const tabId = action.payload;
      state.openTabs.forEach(tab => {
        tab.isActive = tab.id === tabId;
      });
      state.activeTabId = tabId;
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
          tab.item.note = { ...tab.item.note, ...updates };
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

export default tabsSlice.reducer;
