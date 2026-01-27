import type { AlertColor } from '@mui/material/Alert';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import type { Notification as NotificationType } from 'app/store/slices/notificationsSlice';

interface NotificationProps {
  notification: NotificationType;
}

const mapTypeToSeverity = (type: string): AlertColor => {
  const severityMap: Record<string, AlertColor> = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info',
  };
  return severityMap[type] || 'info';
};

export const Notification: React.FC<NotificationProps> = ({ notification }) => {
  const severity = mapTypeToSeverity(notification.type);

  return (
    <Alert severity={severity} sx={{ width: '100%', borderRadius: '8px' }}>
      {notification.title && <AlertTitle>{notification.title}</AlertTitle>}
      {notification.message}
    </Alert>
  );
};
