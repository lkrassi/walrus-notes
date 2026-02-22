import React, { useCallback, useEffect } from 'react';
import { cn } from 'shared/lib/cn';
import { useLocalization } from 'widgets';
import { useNotifications } from 'widgets/hooks';
import { useYjsCollaboration } from '../../model/useYjsCollaboration';
import { CollaborativeEditor } from './CollaborativeEditor';

import type { AwarenessUser } from '../../model/useYjsCollaboration';

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

export const CollaborativeNoteEditor: React.FC<
  CollaborativeNoteEditorProps
> = ({
  noteId,
  userId,
  userName,
  initialContent = '',
  disabled,
  className,
  onContentChange,
  onOnlineUsersChange,
}) => {
  const { showError } = useNotifications();
  const { t } = useLocalization();
  const [reconnectAttempts, setReconnectAttempts] = React.useState(0);

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
    []
  );

  const { ytext, provider, onlineUsers, isContentLoaded } = useYjsCollaboration(
    noteId,
    userId,
    userName,
    initialContent,
    handleStatusChange
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

  if (!ytext || !provider) {
    return (
      <div
        className={cn(
          'flex',
          'items-center',
          'justify-center',
          'h-full',
          'text-gray-500',
          className
        )}
      >
        {t('notes:collaborativeEditorInitializing') ||
          'Инициализация редактора...'}
      </div>
    );
  }

  return (
    <div className={cn('flex', 'flex-col', 'h-full', 'gap-2', className)}>
      <div className={cn('flex-1', 'min-h-0', 'overflow-hidden')}>
        <CollaborativeEditor
          ytext={ytext}
          provider={provider}
          disabled={disabled}
          className={cn('h-full')}
          onContentChange={onContentChange}
          isContentLoaded={isContentLoaded}
        />
      </div>
    </div>
  );
};

CollaborativeNoteEditor.displayName = 'CollaborativeNoteEditor';
