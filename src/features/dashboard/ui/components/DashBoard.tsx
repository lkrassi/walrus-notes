import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Note } from 'shared/model';
import type { FileTreeItem } from 'widgets/hooks';
import { useFileTree } from 'widgets/hooks';
import { Sidebar } from 'widgets/ui';
import {
  useDashboardNavigation,
  useDashboardTabs,
  useDashboardUser,
} from '../../hooks';
import { getItemPath } from '../../utils/fileTreeUtils';
import { DashboardContent } from './DashboardContent';
import { DashboardHeader } from './DashboardHeader';

export const DashBoard = () => {
  const { fileTree } = useFileTree();
  const navigate = useNavigate();
  const sidebarRef = useRef<{
    updateNoteInTree: (noteId: string, updates: Partial<Note>) => void;
  }>(null);

  const {
    openTabs,
    activeTabId,
    openTab,
    closeTab,
    switchTab,
    reorderTabs,
    updateTabNote,
  } = useDashboardTabs();

  const { updateUrlForTab } = useDashboardNavigation({
    openTabs,
  });

  useDashboardUser();

  useEffect(() => {
    if (activeTabId) {
      updateUrlForTab(activeTabId);
    }
  }, [activeTabId, updateUrlForTab]);

  const handleTabSwitch = (tabId: string) => {
    switchTab(tabId);
  };

  const handleTabClose = (tabId: string) => {
    closeTab(tabId);

    const remainingTabs = openTabs.filter(t => t.id !== tabId);
    if (remainingTabs.length === 0) {
      navigate('/dashboard', { replace: true });
    } else if (openTabs.find(t => t.id === tabId)?.isActive) {
      handleTabSwitch(remainingTabs[0].id);
    }
  };

  const handleNoteUpdated = (noteId: string, updates: Partial<Note>) => {
    updateTabNote(noteId, updates);
    sidebarRef.current?.updateNoteInTree(noteId, updates);
  };

  const handleItemSelect = (item: FileTreeItem) => {
    const tabId = `${item.type}-${item.id}`;
    const existingTab = openTabs.find(tab => tab.id === tabId);

    if (existingTab) {
      handleTabSwitch(existingTab.id);
    } else {
      openTab(item);
      handleTabSwitch(tabId);
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
          openTabs={openTabs}
          activeTabId={activeTabId}
          onTabClick={handleTabSwitch}
          onTabClose={handleTabClose}
          onTabReorder={reorderTabs}
          getItemPath={getItemPathWrapper}
          onNoteUpdated={handleNoteUpdated}
          onItemSelect={handleItemSelect}
          onNoteOpen={handleNoteOpenFromGraph}
        />
      </div>
    </div>
  );
};
