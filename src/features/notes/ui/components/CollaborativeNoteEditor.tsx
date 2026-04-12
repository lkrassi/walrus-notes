import { useNotifications } from '@/entities/notification';
import { cn } from '@/shared/lib/core';
import {
  type AwarenessUser,
  useYjsCollaboration,
} from '@/shared/lib/react/collaboration';
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import type * as Y from 'yjs';
import { CollaborativeEditor } from './CollaborativeEditor';

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
      const isCollabDebug = import.meta.env.DEV;
      const logCollab = (message: string, extra?: Record<string, unknown>) => {
        if (!isCollabDebug) return;
        if (extra) {
          console.log(
            `[collab-editor][${noteId}][${userId}] ${message}`,
            extra
          );
          return;
        }
        console.log(`[collab-editor][${noteId}][${userId}] ${message}`);
      };
      const { showError } = useNotifications();
      const { t } = useTranslation();
      const [reconnectAttempts, setReconnectAttempts] = useState(0);

      const handleStatusChange = useCallback(
        (status: 'connected' | 'disconnected') => {
          if (status === 'connected') {
            setReconnectAttempts(0);
          } else if (status === 'disconnected') {
            setReconnectAttempts(prev => prev + 1);
          }
        },
        [showError, t]
      );

      const { ytext, onlineUsers, isContentLoaded, updateCursorAwareness } =
        useYjsCollaboration(
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
        logCollab('collaboration state changed', {
          reconnectAttempts,
          isContentLoaded,
          ytextLength: ytext?.length ?? null,
          onlineUsers: onlineUsers.size,
        });
      }, [isContentLoaded, onlineUsers.size, reconnectAttempts, ytext]);

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
              disabled={disabled || !isContentLoaded}
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
