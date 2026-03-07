import type { PermissionItem } from '@/entities';
import { cn } from '@/shared/lib';
import { Shield, Trash2 } from 'lucide-react';
import { type FC } from 'react';
import { createFriendlyTargetName, kindLabelKey } from '../../../lib/utils';
import type { EditablePermissionState } from '../../../model';
import { RightsBadges } from './RightsBadges';

interface SharedPermissionCardProps {
  permission: PermissionItem;
  draft: EditablePermissionState;
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

        <button
          type='button'
          onClick={() => onDelete(permission.id)}
          disabled={disabledDelete}
          className={cn(
            'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs',
            'text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/20'
          )}
        >
          <Trash2 className={cn('h-3.5 w-3.5')} />
          {t('share:permissionsDashboard.actions.delete')}
        </button>
      </div>

      <div className={cn('mb-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40')}>
        <p className={cn('text-secondary dark:text-dark-secondary text-xs')}>
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
            'border-border dark:border-dark-border flex items-center justify-between rounded-lg border px-3 py-2 text-sm'
          )}
        >
          <span>{t('share:permissionsDashboard.flagsLabel.read')}</span>
          <input
            type='checkbox'
            checked={draft.canRead}
            onChange={event =>
              onChange('canRead', event.target.checked, permission)
            }
          />
        </label>

        <label
          className={cn(
            'border-border dark:border-dark-border flex items-center justify-between rounded-lg border px-3 py-2 text-sm'
          )}
        >
          <span>{t('share:permissionsDashboard.flagsLabel.write')}</span>
          <input
            type='checkbox'
            checked={draft.canWrite}
            onChange={event =>
              onChange('canWrite', event.target.checked, permission)
            }
          />
        </label>

        <label
          className={cn(
            'border-border dark:border-dark-border flex items-center justify-between rounded-lg border px-3 py-2 text-sm'
          )}
        >
          <span>{t('share:permissionsDashboard.flagsLabel.edit')}</span>
          <input
            type='checkbox'
            checked={draft.canEdit}
            onChange={event =>
              onChange('canEdit', event.target.checked, permission)
            }
          />
        </label>
      </div>

      <div className={cn('mt-3 flex justify-end')}>
        <button
          type='button'
          onClick={() => onUpdate(permission.id, draft)}
          disabled={disabledUpdate}
          className={cn(
            'bg-primary rounded-md px-3 py-1.5 text-sm font-medium text-white',
            'hover:bg-primary/90 disabled:opacity-60'
          )}
        >
          {t('share:permissionsDashboard.actions.update')}
        </button>
      </div>
    </article>
  );
};
