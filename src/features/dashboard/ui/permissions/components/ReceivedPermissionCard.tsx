import type { PermissionItem } from '@/entities';
import { MODAL_SIZE_PRESETS, useModalActions } from '@/shared/lib/react';
import { Card } from '@/shared/ui';
import { Shield, Undo2 } from 'lucide-react';
import { type FC, type MouseEvent } from 'react';
import {
  createFriendlyTargetName,
  createFriendlyUserName,
  initialFromPermission,
  kindLabelKey,
} from '../../../lib/utils';
import type { EditablePermissionState } from '../../../model';
import { PermissionDeleteConfirmationForm } from './PermissionDeleteConfirmationForm';
import { PermissionAccessBlocks } from './PermissionAccessBlocks';
import { PermissionAvatar } from './PermissionAvatar';

interface ReceivedPermissionCardProps {
  permission: PermissionItem;
  t: (key: string, options?: Record<string, unknown>) => string;
  onDelete: (permissionId: string) => Promise<boolean>;
  disabledDelete?: boolean;
}

export const ReceivedPermissionCard: FC<ReceivedPermissionCardProps> = ({
  permission,
  t,
  onDelete,
  disabledDelete = false,
}) => {
  const { openModalFromTrigger } = useModalActions();

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
  const handleDelete = openModalFromTrigger(
    <PermissionDeleteConfirmationForm
      permission={permission}
      mode='received'
      isLoading={disabledDelete}
      onConfirm={onDelete}
    />,
    {
      title: t('share:permissionsDashboard.confirmation.received.title'),
      size: MODAL_SIZE_PRESETS.permissionsDelete,
    }
  );

  return (
    <Card className='permission-card backdrop-blur-sm'>
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
          <Undo2 className='h-3.5 w-3.5' />
          {t('share:permissionsDashboard.actions.revokeReceived')}
        </button>
      </div>

      <div className='min-w-0'>
        <p className='muted-text text-xs'>
          {t('share:permissionsDashboard.receivedFrom')}
        </p>
      </div>

      <div className='mb-4 flex items-center gap-3'>
        <PermissionAvatar
          name={userName}
          avatarUrl={permission.fromUserAvatar}
        />
        <div className='min-w-0'>
          <p className='truncate text-sm font-medium'>{userName}</p>
        </div>
      </div>

      <div className='permission-target-box'>
        <p className='muted-text text-xs'>
          {t('share:permissionsDashboard.targetLabel')}
        </p>
        <p className='mt-1 text-sm font-medium break-all'>{targetName}</p>
      </div>

      <PermissionAccessBlocks rights={rights} t={t} showCheckbox={false} />
    </Card>
  );
};
