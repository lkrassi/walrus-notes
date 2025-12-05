import React, { useEffect } from 'react';
import cn from 'shared/lib/cn';
import { useNotifications } from 'widgets/hooks';
import { Notification } from 'widgets/ui/components/notifications/Notification';

export const NotificationsContainer: React.FC = () => {
  const { notifications, hideNotification } = useNotifications();

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    notifications.forEach(notification => {
      if (notification.duration) {
        const timer = setTimeout(() => {
          hideNotification(notification.id);
        }, notification.duration);

        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications, hideNotification]);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed',
        'right-4',
        'bottom-4',
        'z-2',
        'flex',
        'flex-col',
        'gap-3'
      )}
    >
      {notifications.map(notification => (
        <div key={notification.id} className={cn('w-full')}>
          <Notification notification={notification} />
        </div>
      ))}
    </div>
  );
};
