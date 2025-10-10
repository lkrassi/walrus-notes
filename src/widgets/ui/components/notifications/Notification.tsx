import React from 'react';
import type { Notification as NotificationType } from 'widgets/model/stores/slices/notificationsSlice';

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

  const getStyles = () => {
    const baseStyles =
      'flex items-start p-4 rounded-xl shadow-lg min-w-[300px] max-w-[400px] border';
    return `${baseStyles} ${NOTIFICATION_STYLES[type]}`;
  };

  return (
    <div className={getStyles()}>
      <div className='flex-1 min-w-0'>
        {notification.title && (
          <h3 className='font-semibold text-sm mb-1'>{notification.title}</h3>
        )}
        <p className='text-sm leading-relaxed'>{notification.message}</p>
      </div>
    </div>
  );
};
