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
          if (
            tab.id === `note-${noteId}` &&
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
    switchTab,
    reorderTabs,
    updateTabNote,
  };
};
