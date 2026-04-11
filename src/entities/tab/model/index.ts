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
  updateTabLayout,
  updateTabNote,
} from './slice';
export type { DashboardTab, TabsState } from './slice';
export type { FileTreeItem, FileTreeItemType } from './types';
export { useTabs } from './useTabs';
