import { useDashboardNavigation } from 'features/dashboard/hooks';
import { useEffect, useRef } from 'react';
import type { Note } from 'shared/model';
import type { FileTreeItem } from 'widgets/hooks';
import { useFileTree } from 'widgets/hooks';
import { useAppDispatch, useTabs } from 'widgets/hooks/redux';
import { openTab, switchTab } from 'widgets/model/stores/slices/tabsSlice';
import { Sidebar } from 'widgets/ui';
import { getItemPath } from '../../utils/fileTreeUtils';
import { DashboardContent } from './DashboardContent';
import { DashboardHeader } from './DashboardHeader';

export const DashBoard = () => {
  const { fileTree } = useFileTree();
  const dispatch = useAppDispatch();
  const { openTabs, activeTabId } = useTabs();
  const sidebarRef = useRef<{
    updateNoteInTree: (noteId: string, updates: Partial<Note>) => void;
  }>(null);

  const { updateUrlForTab } = useDashboardNavigation({
    openTabs,
  });

  useEffect(() => {
    if (activeTabId) {
      updateUrlForTab(activeTabId);
    }
  }, [activeTabId, updateUrlForTab]);

  const handleItemSelect = (item: FileTreeItem) => {
    const tabId = `${item.type}::${item.id}`;
    const existingTab = openTabs.find(tab => tab.id === tabId);

    if (existingTab) {
      dispatch(switchTab(tabId));
    } else {
      dispatch(openTab(item));
      dispatch(switchTab(tabId));
    }
  };

  const handleNoteOpenFromGraph = (noteData: {
    noteId: string;
    note: Note;
  }) => {
    const noteItem: FileTreeItem = {
      id: noteData.noteId,
      type: 'note',
      title: noteData.note.title,
      parentId: noteData.note.layoutId,
      note: noteData.note,
    };

    handleItemSelect(noteItem);
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
          onNoteOpen={handleNoteOpenFromGraph}
          getItemPath={getItemPathWrapper}
          onItemSelect={handleItemSelect}
        />
      </div>
    </div>
  );
};
