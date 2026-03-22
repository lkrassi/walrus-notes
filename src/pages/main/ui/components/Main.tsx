import type { Note } from '@/entities/note';
import { cn } from '@/shared/lib/core';
import { WebSocketProvider } from '@/shared/lib/react/websocket';
import { Sidebar } from '@/widgets';
import { useCallback, useRef } from 'react';
import { useMainWorkspace } from '../../model';
import { MainContent } from './MainContent';
import { PrivateHeader } from '@/widgets/ui';

export const Main = () => {
  const { userId, activeTabId, handleItemSelect, handleNoteOpenFromGraph } =
    useMainWorkspace();
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
      <div className={cn('flex', 'h-screen', 'flex-col')}>
        <PrivateHeader />
        <div className={cn('flex', 'min-h-0', 'flex-1', 'max-md:flex-col')}>
          <Sidebar
            ref={sidebarRef}
            onItemSelect={handleItemSelect}
            selectedItemId={activeTabId || undefined}
          />
          <MainContent
            onNoteOpen={handleNoteOpenFromGraph}
            onNoteTreeUpdate={handleNoteTreeUpdate}
          />
        </div>
      </div>
    </WebSocketProvider>
  );
};
