import { useNavigate } from 'react-router-dom';

type DashboardNavItem = {
  id: string;
  type: 'layout' | 'note' | 'graph';
  parentId?: string;
  layoutId?: string;
};

interface UseDashboardNavigationProps {
  openTabs: Array<{ id: string; item: DashboardNavItem; isActive: boolean }>;
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

  const updateUrlForItem = (item: DashboardNavItem) => {
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
