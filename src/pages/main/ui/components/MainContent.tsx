import type { Note } from '@/entities/note';
import { cn } from '@/shared/lib/core';
import { memo } from 'react';
import { useMainContentState } from '../../model';
import { GraphTabContent } from './GraphTabContent';
import { MainContentState } from './MainContentState';
import { NoteTabContent } from './NoteTabContent';
import { Tabs } from './Tabs';

interface MainContentProps {
  onNoteTreeUpdate?: (noteId: string, updates: Partial<Note>) => void;
}

export const MainContent = memo(function DashboardContent({
  onNoteTreeUpdate,
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
  } = useMainContentState({
    onNoteTreeUpdate,
  });
  const visibleTabs = isMobile
    ? openTabs.filter(tab => tab.item.type === 'note')
    : openTabs;
  const isMobileGraphLocked = Boolean(
    isMobile && activeTab && activeTab.item.type !== 'note'
  );

  const renderContent = () => {
    if (isMobileGraphLocked) {
      return <MainContentState variant='graphUnavailable' isMobile />;
    }

    if (!activeTab) {
      return (
        <MainContentState
          variant='empty'
          isMobile={isMobile}
          onCreateClick={handleOnCreateClick}
          onFolderClick={handleFolderClickFromGallery}
        />
      );
    }

    if (activeTab.item.type === 'note') {
      return (
        <NoteTabContent
          activeTab={activeTab}
          onNoteUpdated={handleNoteUpdated}
        />
      );
    }

    if (activeTab.item.type === 'layout' || activeTab.item.type === 'graph') {
      return <GraphTabContent activeTab={activeTab} />;
    }

    return <MainContentState variant='unsupported' />;
  };

  return (
    <main
      className={cn(
        'flex',
        'flex-col',
        'min-h-0',
        'min-w-0',
        'flex-1',
        'relative',
        'overflow-hidden'
      )}
    >
      {visibleTabs.length > 0 && (
        <div className={cn('px-2', 'pt-2', 'md:px-3', 'md:pt-3')}>
          <Tabs
            tabs={visibleTabs}
            onTabClick={handleTabClick}
            onTabClose={handleTabClose}
            onTabReorder={handleTabReorder}
          />
        </div>
      )}
      <div
        className={cn(
          'min-h-0',
          'flex-1',
          'px-2',
          'pb-2',
          'md:px-3',
          visibleTabs.length > 0 ? 'pt-2' : 'pt-2 md:pt-3'
        )}
      >
        <div
          className={cn(
            'h-full',
            'overflow-hidden',
            'rounded-xl',
            'border',
            'border-border/70',
            'bg-bg'
          )}
        >
          {renderContent()}
        </div>
      </div>
    </main>
  );
});
