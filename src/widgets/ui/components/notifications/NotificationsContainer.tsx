import React, { useEffect } from 'react';
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
      className={`fixed top-4 right-4 z-51 flex flex-col gap-3 max-md:top-auto max-md:right-4 max-md:bottom-4`}
    >
      {notifications.map(notification => (
        <div key={notification.id} className='w-full'>
          <Notification notification={notification} />
        </div>
      ))}
    </div>
  );
};
