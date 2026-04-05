export { createTabId, parseTabId } from './lib/tabUtils';
export type { TabType } from './lib/tabUtils';
export {
  clearTabs,
  closeLayoutTabs,
  closeTab,
  closeTabsByItemId,
  initializeTabs,
  openPreviewTab,
  openTab,
  pinTab,
  reorderTabs,
  saveTabsToStorage,
  switchTab,
  tabsReducer,
  updateTabNote,
  useTabs,
} from './model';
export type {
  DashboardTab,
  FileTreeItem,
  FileTreeItemType,
  TabsState,
} from './model';
