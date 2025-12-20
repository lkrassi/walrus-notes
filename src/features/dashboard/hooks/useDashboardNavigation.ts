import { useNavigate } from 'react-router-dom';
import type { FileTreeItem } from 'widgets/hooks';

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
    let newPath = '/dashboard';

    if (item.type === 'layout') {
      newPath = `/dashboard/${item.id}`;
    } else if (item.type === 'note' && item.parentId) {
      newPath = `/dashboard/${item.parentId}/${item.id}`;
    } else if (item.type === 'graph' && item.layoutId) {
      newPath = `/dashboard/${item.layoutId}`;
    }

    navigate(newPath, { replace: true });
  };

  return {
    updateUrlForTab,
    updateUrlForItem,
  };
};
