import type { PermissionItem } from '@/entities';
import { cn } from '@/shared/lib/core';
import { Shield, Trash2 } from 'lucide-react';
import { type FC } from 'react';
import { createFriendlyTargetName, kindLabelKey } from '../../../lib/utils';
import type { EditablePermissionState } from '../../../model';
import { PermissionAccessBlocks } from './PermissionAccessBlocks';
import { PermissionAvatar } from './PermissionAvatar';

interface SharedPermissionCardProps {
  permission: PermissionItem;
  draft: EditablePermissionState;
  canUpdate: boolean;
  toUserName?: string;
  toUserAvatar?: string;
  disabledDelete: boolean;
  disabledUpdate: boolean;
  onChange: (
    field: keyof EditablePermissionState,
    value: boolean,
    permission: PermissionItem
  ) => void;
  onUpdate: (permissionId: string, draft: EditablePermissionState) => void;
  onDelete: (permissionId: string) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}

export const SharedPermissionCard: FC<SharedPermissionCardProps> = ({
  permission,
  draft,
  canUpdate,
  toUserName,
  toUserAvatar,
  disabledDelete,
  disabledUpdate,
  onChange,
  onUpdate,
  onDelete,
  t,
}) => {
  const targetName = createFriendlyTargetName(
    permission.targetTitle,
    permission.kind,
    t('share:permissionsDashboard.targetType.layout'),
    t('share:permissionsDashboard.targetType.note'),
    t('share:permissionsDashboard.targetType.unknown')
  );

  const handleDelete = () => onDelete(permission.id);

  return (
    <article className={cn('border-border bg-bg/90 border p-4 shadow-sm')}>
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
            'inline-flex items-center gap-1 border px-2.5 py-1 text-xs font-medium',
            'border-border',
            'text-danger hover:bg-danger/10 disabled:opacity-50',
            'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none'
          )}
        >
          <Trash2 className={cn('h-3.5 w-3.5')} />
          {t('share:permissionsDashboard.actions.revokeShared')}
        </button>
      </div>

      <div className={cn('min-w-0')}>
        <p className={cn('muted-text text-xs')}>
          {t('share:permissionsDashboard.sharedTo')}
        </p>
      </div>

      <div className={cn('mb-4 flex items-center gap-3')}>
        <PermissionAvatar
          name={toUserName || t('share:permissionsDashboard.user.unknown')}
          avatarUrl={toUserAvatar}
        />
        <div className={cn('min-w-0')}>
          <p className={cn('truncate text-sm font-medium')}>
            {toUserName || t('share:permissionsDashboard.user.unknown')}
          </p>
        </div>
      </div>

      <div
        className={cn(
          'border-border mb-4 border bg-gray-50 p-3 dark:bg-gray-900/40'
        )}
      >
        <p className={cn('muted-text text-xs')}>
          {t('share:permissionsDashboard.targetLabel')}
        </p>
        <p className={cn('mt-1 text-sm font-medium break-all')}>{targetName}</p>
      </div>

      <PermissionAccessBlocks
        rights={draft}
        t={t}
        mode='edit'
        disabled={disabledUpdate}
        permission={permission}
        onChange={onChange}
      />

      <div
        className={cn('mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end')}
      >
        <button
          type='button'
          onClick={() => onUpdate(permission.id, draft)}
          disabled={disabledUpdate || !canUpdate}
          className={cn(
            'border-primary bg-primary text-primary-foreground border px-3 py-2 text-sm font-medium',
            'hover:bg-primary/90 disabled:border-border disabled:bg-muted/40 disabled:text-muted-foreground disabled:opacity-100',
            'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none'
          )}
        >
          {t('share:permissionsDashboard.actions.update')}
        </button>
      </div>
    </article>
  );
};
