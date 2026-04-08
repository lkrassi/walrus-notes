import type { Note } from '@/entities/note';
import { useTabs } from '@/entities/tab';
import { useIsMobile } from '@/shared/lib/react/hooks';
import { useMainCreationFlows, useMainTabsFlow } from '../lib/hooks';

interface UseMainContentStateProps {
  onNoteTreeUpdate?: (noteId: string, updates: Partial<Note>) => void;
}

export const useMainContentState = ({
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
  } = useMainTabsFlow({
    openTabs,
    activeTab,
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
  };
};
