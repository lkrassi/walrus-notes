import { useState, useCallback } from 'react';
import type { FileTreeItem } from 'widgets/hooks';

export interface DashboardTab {
  id: string;
  item: FileTreeItem;
  isActive: boolean;
}

export const useDashboardTabs = () => {
  const [openTabs, setOpenTabs] = useState<DashboardTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const openTab = useCallback((item: FileTreeItem) => {
    setOpenTabs(prev => {
      const existingTab = prev.find(tab => tab.id === item.id);
      if (existingTab) {
        return prev.map(tab => ({
          ...tab,
          isActive: tab.id === item.id,
        }));
      } else {
        return [
          ...prev.map(tab => ({ ...tab, isActive: false })),
          { id: item.id, item, isActive: true },
        ];
      }
    });
    setActiveTabId(item.id);
  }, []);

  const closeTab = useCallback((tabId: string) => {
    setOpenTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== tabId);
      if (activeTabId === tabId && newTabs.length > 0) {
        newTabs[newTabs.length - 1].isActive = true;
        setActiveTabId(newTabs[newTabs.length - 1].id);
      }
      return newTabs;
    });
  }, [activeTabId]);

  const switchTab = useCallback((tabId: string) => {
    setOpenTabs(prev =>
      prev.map(tab => ({
        ...tab,
        isActive: tab.id === tabId,
      }))
    );
    setActiveTabId(tabId);
  }, []);

  const reorderTabs = useCallback((
    newTabs: DashboardTab[]
  ) => {
    setOpenTabs(newTabs);
  }, []);

  const updateTabNote = useCallback((
    noteId: string,
    updates: Partial<import('shared/model/types/layouts').Note>
  ) => {
    setOpenTabs(prev =>
      prev.map(tab => {
        if (tab.id === noteId && tab.item.type === 'note' && tab.item.note) {
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
  }, []);

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
