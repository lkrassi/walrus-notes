import { type PermissionItem } from '@/entities';
import { cn } from '@/shared/lib/core';
import { Inbox } from 'lucide-react';
import { type FC } from 'react';
import { ReceivedPermissionCard } from './components/ReceivedPermissionCard';

interface ReceivedPermissionsSectionProps {
  received: PermissionItem[];
  t: (key: string, options?: Record<string, unknown>) => string;
  isDeleting: boolean;
  onDelete: (permissionId: string) => void;
}

export const ReceivedPermissionsSection: FC<
  ReceivedPermissionsSectionProps
> = ({ received, t, isDeleting, onDelete }) => (
  <section
    className={cn(
      'relative overflow-hidden rounded-2xl border',
      'border-border dark:border-dark-border',
      'dark:bg-dark-bg bg-white',
      'p-5'
    )}
  >
    <div className='mb-4 flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            'bg-primary/10 text-primary'
          )}
        >
          <Inbox size={16} />
        </div>

        <h2 className='text-sm font-semibold tracking-tight'>
          {t('share:permissionsDashboard.receivedTitle')}
        </h2>
      </div>

      <span
        className={cn(
          'rounded-full px-2 py-0.5 text-xs font-medium',
          'bg-muted text-muted-foreground'
        )}
      >
        {received.length}
      </span>
    </div>

    {!received.length && (
      <div
        className={cn(
          'flex h-24 items-center justify-center rounded-xl border',
          'border-border border-dashed',
          'muted-text text-sm'
        )}
      >
        {t('share:permissionsDashboard.emptyReceived')}
      </div>
    )}

    <div className='space-y-3'>
      {received.map(item => (
        <ReceivedPermissionCard
          key={item.id}
          permission={item}
          t={t}
          onDelete={onDelete}
          disabledDelete={isDeleting}
        />
      ))}
    </div>
  </section>
);
