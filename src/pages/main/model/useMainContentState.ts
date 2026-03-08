import { useTabs } from '@/entities';
import type { Note } from '@/entities/note';
import { useIsMobile } from '@/shared/lib/react/hooks';
import { useMainCreationFlows, useMainTabsFlow } from '../lib/hooks';

interface UseMainContentStateProps {
  onNoteOpen?: (noteData: { noteId: string; note: Note }) => void;
}

export const useMainContentState = ({
  onNoteOpen,
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
  } = useMainTabsFlow({
    openTabs,
    activeTab,
    onNoteOpen,
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
  };
};
