import React, { useEffect } from 'react';
import Snackbar from '@mui/material/Snackbar';
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

  const latestNotification = notifications[notifications.length - 1];

  return (
    <Snackbar
      open={!!latestNotification}
      autoHideDuration={latestNotification?.duration || 5000}
      onClose={() => hideNotification(latestNotification.id)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{
        '& .MuiSnackbarContent-root': {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          padding: 0,
        },
      }}
    >
      <div>
        {latestNotification && (
          <Notification notification={latestNotification} />
        )}
      </div>
    </Snackbar>
  );
};
