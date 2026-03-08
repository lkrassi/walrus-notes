import type { Notification as NotificationType } from '@/entities';
import { cn } from '@/shared/lib/core';
import { X } from 'lucide-react';
import { type FC } from 'react';

interface NotificationProps {
  notification: NotificationType;
  onClose?: (id: string) => void;
}

const toneClasses: Record<NotificationType['type'], string> = {
  success: 'border-btn-submit/60',
  error: 'border-btn-cancel/60',
  warning: 'border-primary/60',
  info: 'border-primary/40',
};

const titleByType: Record<NotificationType['type'], string> = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Info',
};

export const Notification: FC<NotificationProps> = ({
  notification,
  onClose,
}) => {
  const tone = toneClasses[notification.type] ?? toneClasses.info;
  const title = notification.title || titleByType[notification.type];

  return (
    <div
      role='alert'
      aria-live={notification.type === 'error' ? 'assertive' : 'polite'}
      className={cn(
        'bg-bg/95 text-text dark:border-dark-border dark:bg-dark-bg/95 dark:text-dark-text w-full rounded-lg border px-4 py-3 shadow-md backdrop-blur-sm',
        tone
      )}
    >
      <div className='flex items-start gap-3'>
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-semibold'>{title}</p>
          <p className='mt-1 text-sm'>{notification.message}</p>
        </div>
        {onClose && (
          <button
            type='button'
            onClick={() => onClose(notification.id)}
            className='rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10'
            aria-label='Close notification'
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
