import type { Note } from '@/entities/note';
import { useTabs } from '@/entities/tab';
import { useIsMobile } from '@/shared/lib/react/hooks';
import { useMainCreationFlows, useMainTabsFlow } from '../lib/hooks';

interface UseMainContentStateProps {
  onNoteOpen?: (noteData: { noteId: string; note: Note }) => void;
  onNoteOpenPinned?: (noteData: { noteId: string; note: Note }) => void;
  onNoteTreeUpdate?: (noteId: string, updates: Partial<Note>) => void;
}

export const useMainContentState = ({
  onNoteOpen,
  onNoteOpenPinned,
  onNoteTreeUpdate,
}: UseMainContentStateProps) => {
  const { openTabs } = useTabs();
  const { handleOnCreateClick } = useMainCreationFlows();
  const isMobile = useIsMobile();
  const activeTab = openTabs.find(tab => tab.isActive);

  const {
    handleTabClick,
    handleTabClose,
    handleTabReorder,
    handleNoteUpdated,
    handleFolderClickFromGallery,
    handleNoteOpenFromGraph,
    handleNoteOpenPinnedFromGraph,
  } = useMainTabsFlow({
    openTabs,
    activeTab,
    onNoteOpen,
    onNoteOpenPinned,
    onNoteTreeUpdate,
  });

  return {
    openTabs,
    isMobile,
    activeTab,
    handleOnCreateClick,
    handleTabClick,
    handleTabClose,
    handleTabReorder,
    handleNoteUpdated,
    handleFolderClickFromGallery,
    handleNoteOpenFromGraph,
    handleNoteOpenPinnedFromGraph,
  };
};
