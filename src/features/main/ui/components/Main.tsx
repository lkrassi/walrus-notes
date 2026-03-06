import { WebSocketProvider } from '@/app/providers/websocket';
import type { AppDispatch, RootState } from '@/app/store';
import { openTab, switchTab } from '@/entities';
import { useDashboardNavigation } from '@/features/main/hooks';
import type { FileTreeItem, Note } from '@/shared/model';
import { Sidebar } from '@/shared/ui/components/sidebar/Sidebar';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MainContent } from './MainContent';
import { MainHeader } from './MainHeader';

import { cn } from '@/shared/lib';

export const Main = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { openTabs, activeTabId } = useSelector(
    (state: RootState) => state.tabs
  );
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

  const drafts = useSelector((state: RootState) => state.drafts ?? {});

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
        <MainHeader />
        <div className={cn('flex', 'min-h-0', 'flex-1', 'max-md:flex-col')}>
          <Sidebar
            ref={sidebarRef}
            onItemSelect={handleItemSelect}
            selectedItemId={activeTabId || undefined}
          />
          <MainContent
            onNoteOpen={handleNoteOpenFromGraph}
            onItemSelect={handleItemSelect}
          />
        </div>
      </div>
    </WebSocketProvider>
  );
};
