import type { AwarenessUser } from '@/shared/lib/collaboration';
import { type FC, useRef } from 'react';
import { cn } from '@/shared/lib/cn';
import type * as Y from 'yjs';
import { YjsTextarea, type YjsTextareaHandle } from './YjsTextarea';

interface CollaborativeEditorProps {
  ytext: Y.Text | null;
  fallbackContent?: string;
  disabled?: boolean;
  className?: string;
  onContentChange?: (content: string) => void;
  onCursorChange?: (selectionStart: number, selectionEnd: number) => void;
  onlineUsers?: Map<number, AwarenessUser>;
  currentUserId: string;
}

export const CollaborativeEditor: FC<CollaborativeEditorProps> = ({
  ytext,
  fallbackContent = '',
  disabled = false,
  className,
  onContentChange,
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
        disabled={disabled}
        onContentChange={onContentChange}
        onCursorChange={onCursorChange}
        onlineUsers={onlineUsers}
        currentUserId={currentUserId}
        className='h-full'
      />
    </div>
  );
};
