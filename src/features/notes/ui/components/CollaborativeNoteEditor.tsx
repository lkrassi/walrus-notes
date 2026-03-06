import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { cn } from 'shared/lib/cn';
import { useLocalization } from 'widgets';
import { useNotifications } from 'widgets/hooks';
import type * as Y from 'yjs';
import { useYjsCollaboration } from '../../model/useYjsCollaboration';
import { CollaborativeEditor } from './CollaborativeEditor';

import type { AwarenessUser } from '../../model/useYjsCollaboration';

export interface CollaborativeNoteEditorHandle {
  insertText: (text: string) => void;
  ytext: Y.Text | null;
}

interface CollaborativeNoteEditorProps {
  noteId: string;
  userId: string;
  userName: string;
  initialContent?: string;
  disabled?: boolean;
  className?: string;
  onContentChange?: (content: string) => void;
  onOnlineUsersChange?: (users: Map<number, AwarenessUser>) => void;
}

export const CollaborativeNoteEditor = memo(
  forwardRef<CollaborativeNoteEditorHandle, CollaborativeNoteEditorProps>(
    function CollaborativeNoteEditor(
      {
        noteId,
        userId,
        userName,
        initialContent = '',
        disabled,
        className,
        onContentChange,
        onOnlineUsersChange,
      },
      ref
    ) {
      const { showError } = useNotifications();
      const { t } = useLocalization();
      const [reconnectAttempts, setReconnectAttempts] = useState(0);

      const handleStatusChange = useCallback(
        (status: 'connected' | 'disconnected') => {
          if (status === 'connected') {
            setReconnectAttempts(0);
          } else if (status === 'disconnected') {
            setReconnectAttempts(prev => prev + 1);
            try {
              showError(
                t('notes:connectionLostRetrying') ||
                  'Потеряно соединение. Попытка восстановления...'
              );
            } catch (_e) {}
          }
        },
        [showError, t]
      );

      const { ytext, onlineUsers, updateCursorAwareness } = useYjsCollaboration(
        noteId,
        userId,
        userName,
        initialContent,
        handleStatusChange
      );

      useImperativeHandle(
        ref,
        () => ({
          insertText: (text: string) => {
            if (ytext) {
              const currentLength = ytext.length;
              if (currentLength > 0) {
                ytext.insert(currentLength, '\n\n' + text);
              } else {
                ytext.insert(0, text);
              }
            }
          },
          ytext,
        }),
        [ytext]
      );

      useEffect(() => {
        if (onOnlineUsersChange) {
          onOnlineUsersChange(onlineUsers);
        }
      }, [onlineUsers, onOnlineUsersChange]);

      useEffect(() => {
        if (reconnectAttempts >= 5) {
          showError(
            t('notes:connectionFailedReload') ||
              'Не удаётся восстановить соединение. Попробуйте перезагрузить страницу.'
          );
        }
      }, [reconnectAttempts, showError, t]);

      return (
        <div className={cn('flex', 'flex-col', 'h-full', 'gap-2', className)}>
          <div className={cn('flex-1', 'min-h-0', 'overflow-hidden')}>
            <CollaborativeEditor
              ytext={ytext}
              fallbackContent={initialContent}
              disabled={disabled}
              className={cn('h-full')}
              onContentChange={onContentChange}
              onCursorChange={updateCursorAwareness}
              onlineUsers={onlineUsers}
              currentUserId={userId}
            />
          </div>
        </div>
      );
    }
  )
);
