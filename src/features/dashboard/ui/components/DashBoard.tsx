import { openTab, switchTab } from 'app/store/slices/tabsSlice';
import { useDashboardNavigation } from 'features/dashboard/hooks';
import { useEffect, useRef } from 'react';
import type { Note } from 'shared/model';
import type { FileTreeItem } from 'widgets/hooks';
import { useAppDispatch, useTabs } from 'widgets/hooks/redux';
import { Sidebar } from 'widgets/ui';
import WebSocketProvider from 'widgets/providers/WebSocketProvider';
import { DashboardContent } from './DashboardContent';
import { DashboardHeader } from './DashboardHeader';

import cn from 'shared/lib/cn';

export const DashBoard = () => {
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

  return (
    <WebSocketProvider>
      <div className={cn('flex', 'h-screen', 'flex-col')}>
        <DashboardHeader />
        <div className={cn('flex', 'min-h-0', 'flex-1', 'max-md:flex-col')}>
          <Sidebar
            ref={sidebarRef}
            onItemSelect={handleItemSelect}
            selectedItemId={activeTabId || undefined}
          />
          <DashboardContent
            onNoteOpen={handleNoteOpenFromGraph}
            onItemSelect={handleItemSelect}
          />
        </div>
      </div>
    </WebSocketProvider>
  );
};
