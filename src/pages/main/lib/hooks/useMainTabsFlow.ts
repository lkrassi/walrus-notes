import type { DashboardTab } from '@/entities';
import {
  closeTab,
  createTabId,
  openTab,
  reorderTabs,
  switchTab,
  updateTabNote,
} from '@/entities';
import type { Note } from '@/entities/note';
import type { FileTreeItem } from '@/entities/tab';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

interface UseMainTabsFlowProps {
  openTabs: DashboardTab[];
  activeTab?: DashboardTab;
  onNoteOpen?: (noteData: { noteId: string; note: Note }) => void;
}

export const useMainTabsFlow = ({
  openTabs,
  activeTab,
  onNoteOpen,
}: UseMainTabsFlowProps) => {
  const dispatch = useDispatch();

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

      action();
      return;
    },
    [activeTab]
  );

  const handleTabClick = useCallback(
    (tabId: string) => {
      confirmIfUnsaved(() => dispatch(switchTab(tabId)));
    },
    [confirmIfUnsaved, dispatch]
  );

  const handleTabClose = useCallback(
    (tabId: string) => {
      confirmIfUnsaved(() => dispatch(closeTab(tabId)));
    },
    [confirmIfUnsaved, dispatch]
  );

  const handleTabReorder = useCallback(
    (tabs: DashboardTab[]) => {
      dispatch(reorderTabs(tabs));
    },
    [dispatch]
  );

  const handleNoteUpdated = useCallback(
    (noteId: string, updates: Partial<Note>) => {
      dispatch(updateTabNote({ noteId, updates }));
    },
    [dispatch]
  );

  const handleItemSelect = useCallback(
    (item: FileTreeItem) => {
      const tabId = createTabId(item.type, item.id);
      const existingTab = openTabs.find(tab => tab.id === tabId);

      if (existingTab) {
        confirmIfUnsaved(() => dispatch(switchTab(tabId)));
        return;
      }

      confirmIfUnsaved(() => {
        dispatch(openTab({ ...item, openedFromSidebar: false }));
        dispatch(switchTab(tabId));
      });
    },
    [confirmIfUnsaved, dispatch, openTabs]
  );

  const handleFolderClickFromGallery = useCallback(
    (layoutId: string, title: string) => {
      const tabId = createTabId('layout', layoutId);
      const existingTab = openTabs.find(tab => tab.id === tabId);

      if (existingTab) {
        confirmIfUnsaved(() => dispatch(switchTab(tabId)));
        return;
      }

      confirmIfUnsaved(() => {
        dispatch(
          openTab({
            id: layoutId,
            type: 'layout',
            title,
            color: '',
            openedFromSidebar: false,
            isMain: false,
          } as FileTreeItem)
        );
        dispatch(switchTab(tabId));
      });
    },
    [confirmIfUnsaved, dispatch, openTabs]
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

  return {
    handleTabClick,
    handleTabClose,
    handleTabReorder,
    handleNoteUpdated,
    handleFolderClickFromGallery,
    handleNoteOpenFromGraph,
  };
};
