import type { Note } from '@/entities/note';
import type { DashboardTab, FileTreeItem } from '@/entities/tab';
import { createTabId, useTabs } from '@/entities/tab';
import { hasUnsavedChanges } from '@/shared/lib/notes/hasUnsavedChanges';
import { useCallback } from 'react';

interface UseMainTabsFlowProps {
  openTabs: DashboardTab[];
  activeTab?: DashboardTab;
  onNoteOpen?: (noteData: { noteId: string; note: Note }) => void;
  onNoteOpenPinned?: (noteData: { noteId: string; note: Note }) => void;
  onNoteTreeUpdate?: (noteId: string, updates: Partial<Note>) => void;
}

export const useMainTabsFlow = ({
  openTabs,
  activeTab,
  onNoteOpen,
  onNoteOpenPinned,
  onNoteTreeUpdate,
}: UseMainTabsFlowProps) => {
  const { close, open, reorder, switchTo, updateNote } = useTabs();
  const confirmIfUnsaved = useCallback(
    (action: () => void) => {
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

      const hasUnsavedServerDraft = hasUnsavedChanges(note, null);

      if (!hasUnsavedServerDraft) {
        action();
        return;
      }
    },
    [activeTab]
  );

  const handleTabClick = useCallback(
    (tabId: string) => {
      confirmIfUnsaved(() => switchTo(tabId));
    },
    [confirmIfUnsaved, switchTo]
  );

  const handleTabClose = useCallback(
    (tabId: string) => {
      confirmIfUnsaved(() => close(tabId));
    },
    [close, confirmIfUnsaved]
  );

  const handleTabReorder = useCallback(
    (tabs: DashboardTab[]) => {
      reorder(tabs);
    },
    [reorder]
  );

  const handleNoteUpdated = useCallback(
    (noteId: string, updates: Partial<Note>) => {
      updateNote(noteId, updates);

      if (onNoteTreeUpdate) {
        onNoteTreeUpdate(noteId, updates);
      }
    },
    [onNoteTreeUpdate, updateNote]
  );

  const handleItemSelect = useCallback(
    (item: FileTreeItem) => {
      const tabId = createTabId(item.type, item.id);
      const existingTab = openTabs.find(tab => tab.id === tabId);
      if (existingTab) {
        confirmIfUnsaved(() => switchTo(tabId));
        return;
      }

      confirmIfUnsaved(() => {
        open(item);
        switchTo(tabId);
      });
    },
    [confirmIfUnsaved, open, openTabs, switchTo]
  );

  const handleFolderClickFromGallery = useCallback(
    (layoutId: string, title: string) => {
      const tabId = createTabId('layout', layoutId);
      const existingTab = openTabs.find(tab => tab.id === tabId);

      if (existingTab) {
        confirmIfUnsaved(() => switchTo(tabId));
        return;
      }

      confirmIfUnsaved(() => {
        open({
          id: layoutId,
          type: 'layout',
          title,
          color: '',
          isMain: false,
        } as FileTreeItem);
        switchTo(tabId);
      });
    },
    [confirmIfUnsaved, open, openTabs, switchTo]
  );

  const handleNoteOpenFromGraph = useCallback(
    (noteData: { noteId: string; note: Note }) => {
      if (onNoteOpen) {
        onNoteOpen(noteData);
        return;
      }

      const existingTab = openTabs.find(
        tab => tab.item.type === 'note' && tab.item.id === noteData.noteId
      );

      if (existingTab) {
        handleTabClick(existingTab.id);
        return;
      }

      const noteItem: FileTreeItem = {
        id: noteData.noteId,
        type: 'note',
        title: noteData.note.title,
        parentId: noteData.note.layoutId,
        note: noteData.note,
        isMain: false,
      };

      handleItemSelect(noteItem);
    },
    [handleItemSelect, handleTabClick, onNoteOpen, openTabs]
  );

  const handleNoteOpenPinnedFromGraph = useCallback(
    (noteData: { noteId: string; note: Note }) => {
      if (onNoteOpenPinned) {
        onNoteOpenPinned(noteData);
        return;
      }

      const existingTab = openTabs.find(
        tab => tab.item.type === 'note' && tab.item.id === noteData.noteId
      );

      if (existingTab) {
        handleTabClick(existingTab.id);
        return;
      }

      const noteItem: FileTreeItem = {
        id: noteData.noteId,
        type: 'note',
        title: noteData.note.title,
        parentId: noteData.note.layoutId,
        note: noteData.note,
        isMain: false,
      };

      handleItemSelect(noteItem);
    },
    [handleItemSelect, handleTabClick, onNoteOpenPinned, openTabs]
  );

  return {
    handleTabClick,
    handleTabClose,
    handleTabReorder,
    handleNoteUpdated,
    handleFolderClickFromGallery,
    handleNoteOpenFromGraph,
    handleNoteOpenPinnedFromGraph,
  };
};
