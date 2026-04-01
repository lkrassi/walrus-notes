import type { Notification as NotificationType } from '@/entities';
import { cn } from '@/shared/lib/core';
import { X } from 'lucide-react';
import { type FC } from 'react';

interface NotificationProps {
  notification: NotificationType;
  onClose?: (id: string) => void;
}

const toneClasses: Record<NotificationType['type'], string> = {
  success: cn(
    'border-emerald-500/60 bg-emerald-50 text-emerald-900',
    'dark:border-emerald-400/70 dark:bg-emerald-950/50 dark:text-emerald-200'
  ),
  error: cn(
    'border-red-500/70 bg-red-50 text-red-900',
    'dark:border-red-400/80 dark:bg-red-950/45 dark:text-red-200'
  ),
  warning: cn(
    'border-amber-500/65 bg-amber-50 text-amber-900',
    'dark:border-amber-400/75 dark:bg-amber-950/45 dark:text-amber-200'
  ),
  info: cn(
    'border-sky-500/60 bg-sky-50 text-sky-900',
    'dark:border-sky-400/75 dark:bg-sky-950/45 dark:text-sky-200'
  ),
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
      className={cn('w-full border px-4 py-3 shadow-md backdrop-blur-sm', tone)}
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
