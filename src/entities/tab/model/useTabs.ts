import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { TabType } from '../lib/tabUtils';
import {
  clearTabs,
  closeLayoutTabs,
  closeTab,
  closeTabsByItemId,
  openPreviewTab,
  openTab,
  pinTab,
  reorderTabs,
  switchTab,
  updateTabLayout,
  updateTabNote,
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

  const openPreview = useCallback(
    (item: FileTreeItem) => {
      dispatch(openPreviewTab(item));
    },
    [dispatch]
  );

  const pin = useCallback(
    (tabId: string) => {
      dispatch(pinTab(tabId));
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

  const closeByItem = useCallback(
    (itemId: string, itemType?: TabType) => {
      dispatch(closeTabsByItemId({ itemId, itemType }));
    },
    [dispatch]
  );

  const clear = useCallback(() => {
    dispatch(clearTabs());
  }, [dispatch]);

  const reorder = useCallback(
    (tabs: DashboardTab[]) => {
      dispatch(reorderTabs(tabs));
    },
    [dispatch]
  );

  const updateNote = useCallback(
    (noteId: string, updates: Partial<FileTreeItem['note']>) => {
      dispatch(updateTabNote({ noteId, updates: updates ?? {} }));
    },
    [dispatch]
  );

  const updateLayout = useCallback(
    (
      layoutId: string,
      updates: Partial<Pick<FileTreeItem, 'title' | 'color'>>
    ) => {
      dispatch(updateTabLayout({ layoutId, updates: updates ?? {} }));
    },
    [dispatch]
  );

  return {
    openTabs,
    activeTabId,
    open,
    openPreview,
    pin,
    switchTo,
    close,
    closeByLayout,
    closeByItem,
    reorder,
    updateNote,
    updateLayout,
    clear,
  };
};
