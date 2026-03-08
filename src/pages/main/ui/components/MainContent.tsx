import type { Note } from '@/entities/note';
import { cn } from '@/shared/lib/core';
import { memo } from 'react';
import { useMainContentState } from '../../model';
import { EmptyMainFallback } from './EmptyMainFallback';
import { GraphTabContent } from './GraphTabContent';
import { MainContentState } from './MainContentState';
import { NoteTabContent } from './NoteTabContent';
import { Tabs } from './Tabs';

interface MainContentProps {
  onNoteOpen?: (noteData: { noteId: string; note: Note }) => void;
}

export const MainContent = memo(function DashboardContent({
  onNoteOpen,
}: MainContentProps) {
  const {
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
  } = useMainContentState({
    onNoteOpen,
  });

  const renderContent = () => {
    if (!activeTab) {
      return isMobile ? (
        <EmptyMainFallback
          onFolderClick={handleFolderClickFromGallery}
          onCreateClick={handleOnCreateClick}
        />
      ) : (
        <MainContentState variant='empty' />
      );
    }

    if (activeTab.item.type === 'note') {
      return (
        <NoteTabContent
          activeTab={activeTab}
          onNoteUpdated={handleNoteUpdated}
          onTabClose={handleTabClose}
        />
      );
    }

    if (activeTab.item.type === 'layout' || activeTab.item.type === 'graph') {
      return (
        <GraphTabContent
          activeTab={activeTab}
          onNoteOpen={handleNoteOpenFromGraph}
        />
      );
    }

    return <MainContentState variant='unsupported' />;
  };

  return (
    <main
      className={cn(
        'flex-col',
        'flex',
        'min-h-0',
        'min-w-0',
        'flex-1',
        'relative'
      )}
    >
      {openTabs.length > 0 && (
        <Tabs
          tabs={openTabs}
          onTabClick={handleTabClick}
          onTabClose={handleTabClose}
          onTabReorder={handleTabReorder}
        />
      )}
      <div className={cn('min-h-0', 'flex-1')}>{renderContent()}</div>
    </main>
  );
});
