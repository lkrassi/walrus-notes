import type { PermissionItem } from '@/entities';
import { cn } from '@/shared/lib/core';
import { MODAL_SIZE_PRESETS, useModalActions } from '@/shared/lib/react';
import { Card } from '@/shared/ui';
import { Shield, Trash2 } from 'lucide-react';
import { type FC, type MouseEvent } from 'react';
import { createFriendlyTargetName, kindLabelKey } from '../../../lib/utils';
import type { EditablePermissionState } from '../../../model';
import { PermissionAccessBlocks } from './PermissionAccessBlocks';
import { PermissionAvatar } from './PermissionAvatar';
import { PermissionDeleteConfirmationForm } from './PermissionDeleteConfirmationForm';

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
  onDelete: (permissionId: string) => Promise<boolean>;
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
  const { openModalFromTrigger } = useModalActions();

  const targetName = createFriendlyTargetName(
    permission.targetTitle,
    permission.kind,
    t('share:permissionsDashboard.targetType.layout'),
    t('share:permissionsDashboard.targetType.note'),
    t('share:permissionsDashboard.targetType.unknown')
  );

  const handleDelete = openModalFromTrigger(
    <PermissionDeleteConfirmationForm
      permission={permission}
      mode='shared'
      isLoading={disabledDelete}
      onConfirm={onDelete}
    />,
    {
      title: t('share:permissionsDashboard.confirmation.shared.title'),
      size: MODAL_SIZE_PRESETS.permissionsDelete,
    }
  );

  return (
    <Card className='permission-card'>
      <div className='mb-4 flex items-start justify-between gap-3'>
        <div className='inline-flex items-center gap-2'>
          <Shield className='text-primary h-4 w-4' />
          <span className='text-sm font-semibold'>
            {t(kindLabelKey(permission.kind))}
          </span>
        </div>

        <button
          type='button'
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            handleDelete(event);
          }}
          disabled={disabledDelete}
          className='danger-outline-btn-xs'
        >
          <Trash2 className='h-3.5 w-3.5' />
          {t('share:permissionsDashboard.actions.revokeShared')}
        </button>
      </div>

      <div className='min-w-0'>
        <p className='muted-text text-xs'>
          {t('share:permissionsDashboard.sharedTo')}
        </p>
      </div>

      <div className='mb-4 flex items-center gap-3'>
        <PermissionAvatar
          name={toUserName || t('share:permissionsDashboard.user.unknown')}
          avatarUrl={toUserAvatar}
        />
        <div className='min-w-0'>
          <p className='truncate text-sm font-medium'>
            {toUserName || t('share:permissionsDashboard.user.unknown')}
          </p>
        </div>
      </div>

      <div className='permission-target-box'>
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
          className='primary-btn-sm'
        >
          {t('share:permissionsDashboard.actions.update')}
        </button>
      </div>
    </Card>
  );
};
