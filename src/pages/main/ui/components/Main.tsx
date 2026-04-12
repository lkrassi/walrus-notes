import type { Note } from '@/entities/note';
import { cn } from '@/shared/lib/core';
import { WebSocketProvider } from '@/shared/lib/react/websocket';
import { FileTreeProvider } from '@/widgets/hooks/FileTreeContext';
import { PrivateHeader } from '@/widgets/ui/components/header/PrivateHeader';
import { Sidebar } from '@/widgets/ui/components/sidebar';
import { useCallback, useRef } from 'react';
import { useMainWorkspace } from '../../model';
import { GraphNoteOpenProvider } from './GraphNoteOpenContext';
import { MainContent } from './MainContent';

export const Main = () => {
  const {
    userId,
    activeTabId,
    handleItemSelect,
    handleNoteOpenFromGraph,
    handleNoteOpenFromGraphPinned,
  } = useMainWorkspace();
  const sidebarRef = useRef<{
    updateNoteInTree: (noteId: string, updates: Partial<Note>) => void;
  }>(null);

  const handleNoteTreeUpdate = useCallback(
    (noteId: string, updates: Partial<Note>) => {
      sidebarRef.current?.updateNoteInTree(noteId, updates);
    },
    []
  );

  return (
    <WebSocketProvider userId={userId}>
      <div
        className={cn(
          'bg-bg',
          'text-foreground',
          'flex',
          'h-[100dvh]',
          'flex-col',
          'overflow-hidden'
        )}
      >
        <PrivateHeader />
        <div className={cn('min-h-0', 'flex-1', 'p-0', 'md:p-3')}>
          <div
            className={cn(
              'relative',
              'flex',
              'h-full',
              'min-h-0',
              'gap-0',
              'md:gap-2',
              'overflow-hidden'
            )}
          >
            <FileTreeProvider>
              <Sidebar
                ref={sidebarRef}
                onItemSelect={handleItemSelect}
                selectedItemId={activeTabId || undefined}
              />
            </FileTreeProvider>
            <GraphNoteOpenProvider
              value={{
                onNoteOpen: handleNoteOpenFromGraph,
                onNoteOpenPinned: handleNoteOpenFromGraphPinned,
              }}
            >
              <MainContent onNoteTreeUpdate={handleNoteTreeUpdate} />
            </GraphNoteOpenProvider>
          </div>
        </div>
      </div>
    </WebSocketProvider>
  );
};
