import React from 'react';
import type { Notification as NotificationType } from '../../model/stores/slices/notificationsSlice';
import '../styles/styles.css';

interface NotificationProps {
  notification: NotificationType;
}

export const Notification: React.FC<NotificationProps> = ({ notification }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '💬';
    }
  };

  const getStyles = () => {
    const baseStyles =
      'flex items-start p-4 rounded-xl shadow-lg animate-slide-in-right min-w-[300px] max-w-[400px] border';

    switch (notification.type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-200 text-green-800`;
      case 'error':
        return `${baseStyles} bg-red-50 border-red-200 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-200 text-yellow-800`;
      case 'info':
        return `${baseStyles} bg-blue-50 border-blue-200 text-blue-800`;
      default:
        return `${baseStyles} bg-gray-50 border-gray-200 text-gray-800`;
    }
  };

  return (
    <div className={getStyles()}>
      <div className='flex-shrink-0 mr-3 text-xl'>{getIcon()}</div>
      <div className='flex-1 min-w-0'>
        {notification.title && (
          <div className='font-semibold text-sm mb-1'>{notification.title}</div>
        )}
        <div className='text-sm leading-relaxed'>{notification.message}</div>
      </div>
    </div>
  );
};
