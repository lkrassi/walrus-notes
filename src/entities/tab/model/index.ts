export {
  clearTabs,
  closeLayoutTabs,
  closeTab,
  closeTabsByItemId,
  initializeTabs,
  openTab,
  reorderTabs,
  saveTabsToStorage,
  switchTab,
  tabsReducer,
  updateTabNote,
} from './slice';
export type { DashboardTab, TabsState } from './slice';
export type { FileTreeItem, FileTreeItemType } from './types';
export { useTabs } from './useTabs';
