import type { PermissionItem } from '@/entities';
import type { EditablePermissionState } from '@/features/dashboard/ui/permissions/types';
import {
  createFriendlyTargetName,
  createFriendlyUserName,
  initialFromPermission,
  kindLabelKey,
} from '@/features/dashboard/ui/permissions/utils';
import { cn } from '@/shared/lib/cn';
import { Shield } from 'lucide-react';
import { type FC } from 'react';
import { PermissionAvatar } from './PermissionAvatar';
import { RightsBadges } from './RightsBadges';

interface ReceivedPermissionCardProps {
  permission: PermissionItem;
  t: (key: string, options?: Record<string, unknown>) => string;
}

export const ReceivedPermissionCard: FC<ReceivedPermissionCardProps> = ({
  permission,
  t,
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

  return (
    <article
      className={cn(
        'border-border dark:border-dark-border dark:bg-dark-bg/60 rounded-xl border bg-white/80 p-4 backdrop-blur-sm'
      )}
    >
      <div className={cn('mb-3 flex items-center justify-between gap-2')}>
        <div className={cn('inline-flex items-center gap-2')}>
          <Shield className={cn('text-primary h-4 w-4')} />
          <span className={cn('text-sm font-semibold')}>
            {t(kindLabelKey(permission.kind))}
          </span>
        </div>
      </div>

      <div className={cn('mb-3 flex items-center gap-3')}>
        <PermissionAvatar
          name={userName}
          avatarUrl={permission.fromUserAvatar}
        />
        <div className={cn('min-w-0')}>
          <p className={cn('truncate text-sm font-medium')}>{userName}</p>
          <p className={cn('text-secondary dark:text-dark-secondary text-xs')}>
            {t('share:permissionsDashboard.receivedFrom')}
          </p>
        </div>
      </div>

      <div className={cn('mb-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40')}>
        <p className={cn('text-secondary dark:text-dark-secondary text-xs')}>
          {t('share:permissionsDashboard.targetLabel')}
        </p>
        <p className={cn('mt-1 text-sm font-medium break-all')}>{targetName}</p>
      </div>

      <RightsBadges rights={rights} t={t} />
    </article>
  );
};
