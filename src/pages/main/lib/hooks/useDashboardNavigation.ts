import type { FileTreeItem } from '@/entities/tab';
import { useNavigate } from 'react-router-dom';

interface UseDashboardNavigationProps {
  openTabs: Array<{ id: string; item: FileTreeItem; isActive: boolean }>;
}

export const useDashboardNavigation = ({
  openTabs,
}: UseDashboardNavigationProps) => {
  const navigate = useNavigate();

  const updateUrlForTab = (tabId: string) => {
    const activeTab = openTabs.find(tab => tab.id === tabId);
    if (!activeTab) return;

    updateUrlForItem(activeTab.item);
  };

  const updateUrlForItem = (item: FileTreeItem) => {
    let newPath = '/main';

    if (item.type === 'layout') {
      newPath = `/main/${item.id}`;
    } else if (item.type === 'note' && item.parentId) {
      newPath = `/main/${item.parentId}/${item.id}`;
    } else if (item.type === 'graph' && item.layoutId) {
      newPath = `/main/${item.layoutId}`;
    }

    navigate(newPath, { replace: true });
  };

  return {
    updateUrlForTab,
    updateUrlForItem,
  };
};
