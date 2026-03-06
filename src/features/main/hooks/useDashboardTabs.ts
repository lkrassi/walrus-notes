import { useCallback, useState } from 'react';
import type { FileTreeItem } from 'widgets/hooks';

export interface DashboardTab {
  id: string;
  item: FileTreeItem;
  isActive: boolean;
}

export const useDashboardTabs = () => {
  const [openTabs, setOpenTabs] = useState<DashboardTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const openTab = (item: FileTreeItem) => {
    const tabId = `${item.type}-${item.id}`;

    setOpenTabs(prev => {
      const existingTab = prev.find(tab => tab.id === tabId);
      if (existingTab) {
        return prev;
      }
      return [...prev, { id: tabId, item, isActive: false }];
    });
  };

  const switchTab = (tabId: string) => {
    setOpenTabs(prev =>
      prev.map(tab => ({
        ...tab,
        isActive: tab.id === tabId,
      }))
    );
    setActiveTabId(tabId);
  };

  const closeTab = useCallback(
    (tabId: string) => {
      setOpenTabs(prev => {
        const newTabs = prev.filter(tab => tab.id !== tabId);
        if (activeTabId === tabId && newTabs.length > 0) {
          newTabs[newTabs.length - 1].isActive = true;
          setActiveTabId(newTabs[newTabs.length - 1].id);
        }
        return newTabs;
      });
    },
    [activeTabId]
  );

  const parseTabId = (tabId: string) => {
    const firstDashIndex = tabId.indexOf('-');
    if (firstDashIndex === -1) {
      return { type: tabId, id: '' };
    }

    const type = tabId.substring(0, firstDashIndex);
    const id = tabId.substring(firstDashIndex + 1);

    return { type, id };
  };

  const closeTabsByItemId = useCallback(
    (itemId: string, itemType?: 'note' | 'layout') => {
      setOpenTabs(prev => {
        const tabsToClose = prev.filter(tab => {
          const { type, id } = parseTabId(tab.id);

          if (itemType) {
            return type === itemType && id === itemId;
          }
          return id === itemId;
        });

        if (tabsToClose.length === 0) {
          return prev;
        }

        const closedTabIds = tabsToClose.map(tab => tab.id);
        const newTabs = prev.filter(tab => !closedTabIds.includes(tab.id));

        if (closedTabIds.includes(activeTabId!) && newTabs.length > 0) {
          newTabs[newTabs.length - 1].isActive = true;
          setActiveTabId(newTabs[newTabs.length - 1].id);
        } else if (newTabs.length === 0) {
          setActiveTabId(null);
        }

        return newTabs;
      });
    },
    [activeTabId]
  );

  const closeLayoutTabs = useCallback(
    (layoutId: string) => {
      setOpenTabs(prev => {
        const tabsToClose = prev.filter(tab => {
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

        if (tabsToClose.length === 0) {
          return prev;
        }

        const closedTabIds = tabsToClose.map(tab => tab.id);
        const newTabs = prev.filter(tab => !closedTabIds.includes(tab.id));

        if (closedTabIds.includes(activeTabId!) && newTabs.length > 0) {
          newTabs[newTabs.length - 1].isActive = true;
          setActiveTabId(newTabs[newTabs.length - 1].id);
        } else if (newTabs.length === 0) {
          setActiveTabId(null);
        }

        return newTabs;
      });
    },
    [activeTabId]
  );

  const reorderTabs = useCallback((newTabs: DashboardTab[]) => {
    setOpenTabs(newTabs);
  }, []);

  const updateTabNote = useCallback(
    (
      noteId: string,
      updates: Partial<import('shared/model/types/layouts').Note>
    ) => {
      setOpenTabs(prev =>
        prev.map(tab => {
          const { type, id } = parseTabId(tab.id);
          if (
            type === 'note' &&
            id === noteId &&
            tab.item.type === 'note' &&
            tab.item.note
          ) {
            return {
              ...tab,
              item: {
                ...tab.item,
                note: { ...tab.item.note, ...updates },
                title: updates.title || tab.item.title,
              },
            };
          }
          return tab;
        })
      );
    },
    []
  );

  return {
    openTabs,
    activeTabId,
    openTab,
    closeTab,
    closeTabsByItemId,
    closeLayoutTabs,
    switchTab,
    reorderTabs,
    updateTabNote,
  };
};
