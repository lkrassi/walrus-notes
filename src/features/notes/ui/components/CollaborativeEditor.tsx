import { cn } from '@/shared/lib/core';
import type { AwarenessUser } from '@/shared/lib/react/collaboration';
import { type FC, useRef } from 'react';
import type * as Y from 'yjs';
import { YjsTextarea, type YjsTextareaHandle } from './YjsTextarea';

interface CollaborativeEditorProps {
  ytext: Y.Text | null;
  fallbackContent?: string;
  isContentLoaded?: boolean;
  disabled?: boolean;
  className?: string;
  onContentChange?: (content: string) => void;
  onSyncedContentChange?: (content: string) => void;
  onCursorChange?: (selectionStart: number, selectionEnd: number) => void;
  onlineUsers?: Map<number, AwarenessUser>;
  currentUserId: string;
}

export const CollaborativeEditor: FC<CollaborativeEditorProps> = ({
  ytext,
  fallbackContent = '',
  isContentLoaded = false,
  disabled = false,
  className,
  onContentChange,
  onSyncedContentChange,
  onCursorChange,
  onlineUsers,
  currentUserId,
}) => {
  const editorRef = useRef<YjsTextareaHandle>(null);

  return (
    <div
      className={cn(
        'collaborative-editor',
        'h-full',
        'overflow-hidden',
        'bg-transparent',
        className
      )}
    >
      <YjsTextarea
        ref={editorRef}
        ytext={ytext}
        fallbackContent={fallbackContent}
        isContentLoaded={isContentLoaded}
        disabled={disabled}
        onContentChange={onContentChange}
        onSyncedContentChange={onSyncedContentChange}
        onCursorChange={onCursorChange}
        onlineUsers={onlineUsers}
        currentUserId={currentUserId}
        className='h-full'
      />
    </div>
  );
};
