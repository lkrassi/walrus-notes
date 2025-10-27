import { useRef } from 'react';
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
  const { updateUrlForTab, updateUrlForItem } = useDashboardNavigation({
    fileTree,
    openTab,
    switchTab,
    openTabs,
  });
  useDashboardUser();

  const handleTabSwitch = (tabId: string) => {
    switchTab(tabId);
    updateUrlForTab(tabId);
  };

  const handleNoteUpdated = (noteId: string, updates: Partial<Note>) => {
    updateTabNote(noteId, updates);
    sidebarRef.current?.updateNoteInTree(noteId, updates);
  };

  const handleItemSelect = (item: FileTreeItem) => {
    openTab(item);
    updateUrlForItem(item);
  };

  // Новая функция для открытия заметки из графа с реальными данными
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

    openTab(noteItem);
    updateUrlForItem(noteItem);
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
          onNoteOpen={handleNoteOpenFromGraph}
        />
      </div>
    </div>
  );
};
