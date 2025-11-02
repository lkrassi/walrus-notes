import { useCallback } from 'react';
import {
  closeTab,
  closeTabsByItemId,
  openTab,
  switchTab,
} from 'widgets/model/stores/slices/tabsSlice';
import { createTabId, type TabType } from '../model/utils/tabUtils';
import { useAppDispatch, useAppSelector } from './redux';
import type { FileTreeItem } from './useFileTree';

export const useTabs = () => {
  const dispatch = useAppDispatch();
  const { openTabs, activeTabId } = useAppSelector(state => state.tabs);

  const handleOpenTab = useCallback(
    (item: FileTreeItem) => {
      dispatch(openTab(item));
    },
    [dispatch]
  );

  const handleCloseTab = useCallback(
    (tabId: string) => {
      dispatch(closeTab(tabId));
    },
    [dispatch]
  );

  const handleSwitchTab = useCallback(
    (tabId: string) => {
      dispatch(switchTab(tabId));
    },
    [dispatch]
  );

  const handleCloseTabsByItem = useCallback(
    (itemId: string, itemType?: TabType) => {
      dispatch(closeTabsByItemId({ itemId, itemType }));
    },
    [dispatch]
  );

  const getTabId = useCallback((item: FileTreeItem) => {
    return createTabId(item.type, item.id);
  }, []);

  return {
    openTabs,
    activeTabId,
    openTab: handleOpenTab,
    closeTab: handleCloseTab,
    switchTab: handleSwitchTab,
    closeTabsByItem: handleCloseTabsByItem,
    getTabId,
  };
};
