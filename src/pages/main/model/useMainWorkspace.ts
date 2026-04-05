import { useDrafts, useTabs, useUser } from '@/entities';
import type { Note } from '@/entities/note';
import type { FileTreeItem } from '@/entities/tab';
import { useEffect } from 'react';
import { useDashboardNavigation } from '../lib/hooks';

export const useMainWorkspace = () => {
  const { userId } = useUser();
  const { openTabs, activeTabId, open, openPreview, pin, switchTo } = useTabs();
  const { drafts } = useDrafts();

  const { updateUrlForTab } = useDashboardNavigation({
    openTabs,
  });

  useEffect(() => {
    if (activeTabId) {
      updateUrlForTab(activeTabId);
    }
  }, [activeTabId, updateUrlForTab]);

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
  };

  const handleItemSelect = (
    item: FileTreeItem,
    mode: 'preview' | 'pinned' = 'preview'
  ) => {
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
        if (mode === 'pinned' && !existingTab.isPinned) {
          pin(tabId);
        }
        switchTo(tabId);
      } else {
        if (item.type === 'note' && mode === 'preview') {
          openPreview({ ...item, openedFromSidebar: true });
        } else {
          open({ ...item, openedFromSidebar: true });
        }
        switchTo(tabId);
      }
      return;
    }

    const deferredAction = () => {
      if (existingTab) {
        if (mode === 'pinned' && !existingTab.isPinned) {
          pin(tabId);
        }
        switchTo(tabId);
      } else {
        if (item.type === 'note' && mode === 'preview') {
          openPreview({ ...item, openedFromSidebar: false });
        } else {
          open({ ...item, openedFromSidebar: false });
        }
        switchTo(tabId);
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

  return {
    userId,
    activeTabId,
    handleItemSelect,
    handleNoteOpenFromGraph,
  };
};
