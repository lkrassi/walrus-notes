import type { Notification as NotificationType } from 'app/store/slices/notificationsSlice';
import React from 'react';
import cn from 'shared/lib/cn';

interface NotificationProps {
  notification: NotificationType;
}

const NOTIFICATION_STYLES = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  default: 'bg-gray-50 border-gray-200 text-gray-800',
};

export const Notification: React.FC<NotificationProps> = ({ notification }) => {
  const type = notification.type || 'default';

  const baseStyles = `
    flex items-start p-4 rounded-xl shadow-lg
    border
    w-full
    max-w-full
  `;

  return (
    <div className={cn(baseStyles, NOTIFICATION_STYLES[type])}>
      <div>
        <p className={cn('text-sm', 'leading-relaxed')}>
          {notification.message}
        </p>
      </div>
    </div>
  );
};
