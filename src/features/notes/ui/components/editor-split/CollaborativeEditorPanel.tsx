import { CollaborativeNoteEditor } from '../CollaborativeNoteEditor';
import { cn } from '@/shared/lib';
import { memo, type FC } from 'react';
import type { CollaborativeEditorPanelProps } from './types';

export const CollaborativeEditorPanel: FC<CollaborativeEditorPanelProps> = memo(
  function CollaborativeEditorPanel({
    payload: _payload,
    isLoading,
    isEditing,
    isResizing: _isResizing,
    isDesktop,
    leftWidth,
    min,
    max,
    widthValue,
    heightValue,
    noteId,
    userId,
    userName,
    initialContent,
    onPayloadChange,
    onOnlineUsersChange,
    collaborativeEditorRef,
  }) {
    return (
      <div
        className={cn(
          'h-full',
          'bg-transparent',
          'min-h-0',
          'overflow-hidden',
          'relative'
        )}
        style={
          isDesktop && leftWidth && isEditing
            ? {
                minWidth: `${min}px`,
                maxWidth: `${max}px`,
                height: '100%',
                width: widthValue,
              }
            : !isDesktop
              ? { width: '100%', height: heightValue }
              : undefined
        }
      >
        <CollaborativeNoteEditor
          ref={collaborativeEditorRef}
          noteId={noteId}
          userId={userId}
          userName={userName}
          initialContent={initialContent}
          disabled={isLoading}
          className={cn('h-full', 'pt-3')}
          onContentChange={onPayloadChange}
          onOnlineUsersChange={onOnlineUsersChange}
        />
      </div>
    );
  }
);
