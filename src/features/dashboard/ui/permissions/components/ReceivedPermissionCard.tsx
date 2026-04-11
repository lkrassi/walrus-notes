import type { PermissionItem } from '@/entities';
import { cn } from '@/shared/lib/core';
import { Shield, Undo2 } from 'lucide-react';
import { type FC } from 'react';
import {
  createFriendlyTargetName,
  createFriendlyUserName,
  initialFromPermission,
  kindLabelKey,
} from '../../../lib/utils';
import type { EditablePermissionState } from '../../../model';
import { PermissionAccessBlocks } from './PermissionAccessBlocks';
import { PermissionAvatar } from './PermissionAvatar';

interface ReceivedPermissionCardProps {
  permission: PermissionItem;
  t: (key: string, options?: Record<string, unknown>) => string;
  onDelete: (permissionId: string) => void;
  disabledDelete?: boolean;
}

export const ReceivedPermissionCard: FC<ReceivedPermissionCardProps> = ({
  permission,
  t,
  onDelete,
  disabledDelete = false,
}) => {
  const userName = createFriendlyUserName(
    permission.fromUserName,
    t('share:permissionsDashboard.user.unknown')
  );

  const targetName = createFriendlyTargetName(
    permission.targetTitle,
    permission.kind,
    t('share:permissionsDashboard.targetType.layout'),
    t('share:permissionsDashboard.targetType.note'),
    t('share:permissionsDashboard.targetType.unknown')
  );

  const rights: EditablePermissionState = initialFromPermission(permission);
  const handleDelete = () => onDelete(permission.id);

  return (
    <article
      className={cn(
        'border-border dark:border-dark-border bg-bg/90 dark:bg-dark-bg/70 rounded-xl border p-4 shadow-sm backdrop-blur-sm'
      )}
    >
      <div className={cn('mb-4 flex items-start justify-between gap-3')}>
        <div className={cn('inline-flex items-center gap-2')}>
          <Shield className={cn('text-primary h-4 w-4')} />
          <span className={cn('text-sm font-semibold')}>
            {t(kindLabelKey(permission.kind))}
          </span>
        </div>

        <button
          type='button'
          onClick={handleDelete}
          disabled={disabledDelete}
          className={cn(
            'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium',
            'border-border text-danger hover:bg-danger/10 disabled:opacity-50',
            'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none'
          )}
        >
          <Undo2 className='h-3.5 w-3.5' />
          {t('share:permissionsDashboard.actions.revokeReceived')}
        </button>
      </div>

      <div className={cn('min-w-0')}>
        <p className={cn('muted-text text-xs')}>
          {t('share:permissionsDashboard.receivedFrom')}
        </p>
      </div>

      <div className={cn('mb-4 flex items-center gap-3')}>
        <PermissionAvatar
          name={userName}
          avatarUrl={permission.fromUserAvatar}
        />
        <div className={cn('min-w-0')}>
          <p className={cn('truncate text-sm font-medium')}>{userName}</p>
        </div>
      </div>

      <div
        className={cn(
          'border-border mb-4 rounded-lg border bg-gray-50 p-3 dark:bg-gray-900/40'
        )}
      >
        <p className={cn('muted-text text-xs')}>
          {t('share:permissionsDashboard.targetLabel')}
        </p>
        <p className={cn('mt-1 text-sm font-medium break-all')}>{targetName}</p>
      </div>

      <PermissionAccessBlocks rights={rights} t={t} showCheckbox={false} />
    </article>
  );
};
