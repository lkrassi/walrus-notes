import { Users } from 'lucide-react';
import React, { useMemo } from 'react';
import { cn } from 'shared/lib/cn';
import { hexToRgba } from 'shared/lib/colorUtils';
import { useLocalization } from 'widgets';
import type { AwarenessUser } from '../../model/useYjsCollaboration';

interface OnlineUsersListProps {
  onlineUsers: Map<number, AwarenessUser>;
  currentUserId: string;
  className?: string;
}

export const OnlineUsersList: React.FC<OnlineUsersListProps> = ({
  onlineUsers,
  currentUserId,
  className,
}) => {
  const { t } = useLocalization();

  const users = useMemo(() => {
    const userMap = new Map<string, AwarenessUser>();
    onlineUsers.forEach(value => {
      if (value.user) {
        userMap.set(value.user.id, value);
      }
    });
    return Array.from(userMap.values());
  }, [onlineUsers]);

  if (users.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex',
        'items-center',
        'gap-2',
        'px-3',
        'py-2',
        'bg-gray-100',
        'dark:bg-gray-800',
        'rounded-md',
        'text-sm',
        className
      )}
    >
      <Users size={16} className={cn('text-gray-600', 'dark:text-gray-400')} />
      <span
        className={cn('text-gray-700', 'dark:text-gray-300', 'font-medium')}
      >
        {t('notes:online')} ({users.length}):
      </span>
      <div className={cn('flex', 'items-center', 'gap-2', 'flex-wrap')}>
        {users.map((awarenessUser, index) => {
          const { user } = awarenessUser;
          const bgColor = hexToRgba(user.color, 0.2);
          const borderColor = user.color;

          return (
            <div
              key={`${user.id}-${index}`}
              className={cn(
                'flex',
                'items-center',
                'gap-1.5',
                'px-2',
                'py-1',
                'rounded-full',
                'text-xs',
                'font-medium',
                'border'
              )}
              style={{
                backgroundColor: bgColor,
                borderColor: borderColor,
                color: user.color,
              }}
              title={`${user.name} (${user.id})`}
            >
              <span
                className={cn('w-2', 'h-2', 'rounded-full')}
                style={{ backgroundColor: user.color }}
              />
              <span>
                {user.id === currentUserId ? t('notes:you') || 'Вы' : user.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

OnlineUsersList.displayName = 'OnlineUsersList';
