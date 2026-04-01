import type { PermissionItem } from '@/entities';
import { cn } from '@/shared/lib/core';
import { Shield, Trash2 } from 'lucide-react';
import { type FC } from 'react';
import { createFriendlyTargetName, kindLabelKey } from '../../../lib/utils';
import type { EditablePermissionState } from '../../../model';
import { PermissionAvatar } from './PermissionAvatar';
import { RightsBadges } from './RightsBadges';

interface SharedPermissionCardProps {
  permission: PermissionItem;
  draft: EditablePermissionState;
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

  return (
    <article className={cn('border-border border p-4 backdrop-blur-sm')}>
      <div className={cn('mb-3 flex items-center justify-between gap-2')}>
        <div className={cn('inline-flex items-center gap-2')}>
          <Shield className={cn('text-primary h-4 w-4')} />
          <span className={cn('text-sm font-semibold')}>
            {t(kindLabelKey(permission.kind))}
          </span>
        </div>

        <button
          type='button'
          onClick={() => onDelete(permission.id)}
          disabled={disabledDelete}
          className={cn(
            'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs',
            'text-danger hover:bg-danger/10 disabled:opacity-50',
            'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none'
          )}
        >
          <Trash2 className={cn('h-3.5 w-3.5')} />
          {t('share:permissionsDashboard.actions.delete')}
        </button>
      </div>

      {/* КОМУ выдан доступ */}
      <div className={cn('mb-3 flex items-center gap-3')}>
        <PermissionAvatar
          name={toUserName || t('share:permissionsDashboard.user.unknown')}
          avatarUrl={toUserAvatar}
        />
        <div className={cn('min-w-0')}>
          <p className={cn('truncate text-sm font-medium')}>
            {toUserName || t('share:permissionsDashboard.user.unknown')}
          </p>
          <p className={cn('muted-text text-xs')}>
            {t('share:permissionsDashboard.sharedTo')}
          </p>
        </div>
      </div>

      <div className={cn('mb-3 bg-gray-50 p-3 dark:bg-gray-900/40')}>
        <p className={cn('muted-text text-xs')}>
          {t('share:permissionsDashboard.targetLabel')}
        </p>
        <p className={cn('mt-1 text-sm font-medium break-all')}>{targetName}</p>
      </div>

      <div className={cn('mb-3')}>
        <RightsBadges rights={draft} t={t} />
      </div>

      <div className={cn('grid grid-cols-1 gap-2 sm:grid-cols-3')}>
        <label
          className={cn(
            'border-border flex items-center justify-between border px-3 py-2 text-sm'
          )}
        >
          <span>{t('share:permissionsDashboard.flagsLabel.read')}</span>
          <input
            type='checkbox'
            checked={draft.canRead}
            onChange={event =>
              onChange('canRead', event.target.checked, permission)
            }
            className={cn(
              'border-border text-primary accent-primary h-4 w-4 cursor-pointer rounded',
              'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none'
            )}
          />
        </label>

        <label
          className={cn(
            'border-border flex items-center justify-between border px-3 py-2 text-sm'
          )}
        >
          <span>{t('share:permissionsDashboard.flagsLabel.write')}</span>
          <input
            type='checkbox'
            checked={draft.canWrite}
            onChange={event =>
              onChange('canWrite', event.target.checked, permission)
            }
            className={cn(
              'border-border text-primary accent-primary h-4 w-4 cursor-pointer rounded',
              'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none'
            )}
          />
        </label>

        <label
          className={cn(
            'border-border flex items-center justify-between border px-3 py-2 text-sm'
          )}
        >
          <span>{t('share:permissionsDashboard.flagsLabel.edit')}</span>
          <input
            type='checkbox'
            checked={draft.canEdit}
            onChange={event =>
              onChange('canEdit', event.target.checked, permission)
            }
            className={cn(
              'border-border text-primary accent-primary h-4 w-4 cursor-pointer rounded',
              'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none'
            )}
          />
        </label>
      </div>

      <div className={cn('mt-3 flex justify-end')}>
        <button
          type='button'
          onClick={() => onUpdate(permission.id, draft)}
          disabled={disabledUpdate}
          className={cn(
            'bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm font-medium',
            'hover:bg-primary/90 disabled:opacity-60',
            'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none'
          )}
        >
          {t('share:permissionsDashboard.actions.update')}
        </button>
      </div>
    </article>
  );
};
