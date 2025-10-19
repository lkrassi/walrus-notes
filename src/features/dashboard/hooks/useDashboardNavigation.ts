import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { FileTreeItem } from 'widgets/hooks';

interface UseDashboardNavigationProps {
  fileTree: FileTreeItem[];
  openTab: (item: FileTreeItem) => void;
  switchTab: (tabId: string) => void;
  openTabs: Array<{ id: string; item: FileTreeItem; isActive: boolean }>;
}

export const useDashboardNavigation = ({
  fileTree,
  openTab,
  switchTab,
  openTabs,
}: UseDashboardNavigationProps) => {
  const { layoutId, noteId } = useParams<{
    layoutId?: string;
    noteId?: string;
  }>();

  useEffect(() => {
    if (layoutId || noteId) {
      const findItemById = (
        items: FileTreeItem[],
        targetId: string
      ): FileTreeItem | null => {
        for (const item of items) {
          if (item.id === targetId) {
            return item;
          }
          if (item.children) {
            const found = findItemById(item.children, targetId);
            if (found) return found;
          }
        }
        return null;
      };

      const targetId = noteId || layoutId;
      if (targetId) {
        const foundItem = findItemById(fileTree, targetId);
        if (foundItem) {
          openTab(foundItem);
        }
      }
    }
  }, [layoutId, noteId, fileTree, openTab]);

  const updateUrlForTab = (tabId: string) => {
    const activeTab = openTabs.find(tab => tab.id === tabId);
    if (activeTab) {
      if (activeTab.item.type === 'note') {
        window.history.replaceState(
          null,
          '',
          `/dashboard/${activeTab.item.parentId}/${activeTab.item.id}`
        );
      } else if (activeTab.item.type === 'layout') {
        window.history.replaceState(
          null,
          '',
          `/dashboard/${activeTab.item.id}`
        );
      }
    }
  };

  const updateUrlForItem = (item: FileTreeItem) => {
    if (item.type === 'note') {
      window.history.replaceState(
        null,
        '',
        `/dashboard/${item.parentId}/${item.id}`
      );
    } else if (item.type === 'layout') {
      window.history.replaceState(null, '', `/dashboard/${item.id}`);
    }
  };

  return {
    updateUrlForTab,
    updateUrlForItem,
  };
};
