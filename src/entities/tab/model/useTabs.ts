import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearTabs,
  closeLayoutTabs,
  closeTab,
  openTab,
  switchTab,
  type DashboardTab,
} from './slice';
import type { FileTreeItem } from './types';

type TabsStateLike = {
  tabs: {
    openTabs: DashboardTab[];
    activeTabId: string | null;
  };
};

export const useTabs = () => {
  const dispatch = useDispatch();
  const { openTabs, activeTabId } = useSelector(
    (state: TabsStateLike) => state.tabs
  );

  const open = useCallback(
    (item: FileTreeItem) => {
      dispatch(openTab(item));
    },
    [dispatch]
  );

  const switchTo = useCallback(
    (tabId: string) => {
      dispatch(switchTab(tabId));
    },
    [dispatch]
  );

  const close = useCallback(
    (tabId: string) => {
      dispatch(closeTab(tabId));
    },
    [dispatch]
  );

  const closeByLayout = useCallback(
    (layoutId: string) => {
      dispatch(closeLayoutTabs(layoutId));
    },
    [dispatch]
  );

  const clear = useCallback(() => {
    dispatch(clearTabs());
  }, [dispatch]);

  return {
    openTabs,
    activeTabId,
    open,
    switchTo,
    close,
    closeByLayout,
    clear,
  };
};
