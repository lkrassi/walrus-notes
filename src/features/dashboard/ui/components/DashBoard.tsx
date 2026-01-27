import { openTab, switchTab } from 'app/store/slices/tabsSlice';
import { useDashboardNavigation } from 'features/dashboard/hooks';
import { useEffect, useRef } from 'react';
import type { Note } from 'shared/model';
import type { FileTreeItem } from 'widgets/hooks';
import { useAppDispatch, useAppSelector, useTabs } from 'widgets/hooks/redux';
import { WebSocketProvider } from 'widgets/providers/WebSocketProvider';
import { Sidebar } from 'widgets/ui';
import { DashboardContent } from './DashboardContent';
import { DashboardHeader } from './DashboardHeader';

import { cn } from 'shared/lib/cn';

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
    const activeTab = openTabs.find(tab => tab.isActive) ?? null;
    let hasUnsaved = false;
    if (activeTab && activeTab.item.type === 'note' && activeTab.item.note) {
      const note = activeTab.item.note;
      const noteId = note.id;
      const storeDraft = drafts[noteId];
      const hasUnsavedLocal =
        typeof storeDraft === 'string' &&
        storeDraft.length > 0 &&
        storeDraft !== (note.payload ?? '');
      const hasServerDraft = !!(
        note.draft &&
        note.draft.length &&
        note.draft !== note.payload
      );
      hasUnsaved = hasUnsavedLocal || hasServerDraft;
    }

    if (!hasUnsaved) {
      if (existingTab) {
        dispatch(switchTab(tabId));
      } else {
        dispatch(openTab({ ...item, openedFromSidebar: true }));
        dispatch(switchTab(tabId));
      }
      return;
    }

    const deferredAction = () => {
      if (existingTab) {
        dispatch(switchTab(tabId));
      } else {
        dispatch(openTab({ ...item, openedFromSidebar: false }));
        dispatch(switchTab(tabId));
      }
    };

    confirmIfUnsaved(deferredAction);
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
      isMain: false,
    };

    handleItemSelect(noteItem);
  };

  const drafts = useAppSelector(s => s.drafts ?? {});

  const confirmIfUnsaved = (action: () => void) => {
    const activeTab = openTabs.find(tab => tab.isActive) ?? null;
    if (!activeTab) {
      action();
      return;
    }

    if (activeTab.item.type !== 'note') {
      action();
      return;
    }

    const note = activeTab.item.note;
    if (!note) {
      action();
      return;
    }

    action();
    return;
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
