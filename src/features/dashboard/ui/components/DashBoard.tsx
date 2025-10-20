import { useRef } from 'react';
import type { FileTreeItem } from 'widgets/hooks';
import { useFileTree } from 'widgets/hooks';
import { Sidebar } from 'widgets/ui';
import { DashboardContent } from './DashboardContent';
import { DashboardHeader } from './DashboardHeader';
import { useDashboardTabs, useDashboardNavigation, useDashboardUser } from '../../hooks';
import { getItemPath } from '../../utils/fileTreeUtils';

export const DashBoard = () => {
  const { fileTree } = useFileTree();
  const sidebarRef = useRef<{
    updateNoteInTree: (
      noteId: string,
      updates: Partial<import('shared/model/types/layouts').Note>
    ) => void;
  }>(null);

  // Используем кастомные хуки для разделения логики
  const { openTabs, activeTabId, openTab, closeTab, switchTab, reorderTabs, updateTabNote } = useDashboardTabs();
  const { updateUrlForTab, updateUrlForItem } = useDashboardNavigation({
    fileTree,
    openTab,
    switchTab,
    openTabs,
  });
  useDashboardUser(); // Инициализация профиля пользователя

  const handleTabSwitch = (tabId: string) => {
    switchTab(tabId);
    updateUrlForTab(tabId);
  };

  const handleNoteUpdated = (
    noteId: string,
    updates: Partial<import('shared/model/types/layouts').Note>
  ) => {
    updateTabNote(noteId, updates);
    sidebarRef.current?.updateNoteInTree(noteId, updates);
  };

  const handleItemSelect = (item: FileTreeItem) => {
    openTab(item);
    updateUrlForItem(item);
  };

  const handleOpenGraph = (layoutId: string) => {
    const graphItem: FileTreeItem = {
      id: `graph-${layoutId}`,
      type: 'graph',
      title: 'Граф заметок',
      layoutId,
    };
    openTab(graphItem);
    // Don't update URL for graph items
  };

  const getItemPathWrapper = (item: FileTreeItem): string => {
    return getItemPath(item, fileTree);
  };

  return (
    <div className='flex h-screen flex-col'>
      <DashboardHeader />
      <div className='flex min-h-0 flex-1 max-md:flex-col'>
        <Sidebar
          ref={sidebarRef}
          onItemSelect={handleItemSelect}
          selectedItemId={activeTabId || undefined}
        />
        <DashboardContent
          openTabs={openTabs}
          activeTabId={activeTabId}
          onTabClick={handleTabSwitch}
          onTabClose={closeTab}
          onTabReorder={reorderTabs}
          getItemPath={getItemPathWrapper}
          onNoteUpdated={handleNoteUpdated}
          onItemSelect={handleItemSelect}
        />
      </div>
    </div>
  );
};
