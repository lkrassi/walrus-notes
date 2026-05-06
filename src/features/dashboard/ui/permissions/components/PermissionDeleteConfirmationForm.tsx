import type { PermissionItem } from '@/entities';
import { Button } from '@/shared';
import { cn } from '@/shared/lib/core';
import { useModalContentContext } from '@/shared/lib/react';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { type FormEvent } from 'react';
import {
  createFriendlyTargetName,
  createFriendlyUserName,
} from '../../../lib/utils';

type PermissionMode = 'shared' | 'received';

interface PermissionDeleteConfirmationFormProps {
  permission: PermissionItem;
  mode: PermissionMode;
  isLoading: boolean;
  onConfirm: (permissionId: string) => Promise<boolean>;
}

export const PermissionDeleteConfirmationForm = ({
  permission,
  mode,
  isLoading,
  onConfirm,
}: PermissionDeleteConfirmationFormProps) => {
  const { t } = useTranslation();
  const { closeModal } = useModalContentContext();

  const targetName = createFriendlyTargetName(
    permission.targetTitle,
    permission.kind,
    t('share:permissionsDashboard.targetType.layout'),
    t('share:permissionsDashboard.targetType.note'),
    t('share:permissionsDashboard.targetType.unknown')
  );

  const userName =
    mode === 'shared'
      ? permission.toUserName || t('share:permissionsDashboard.user.unknown')
      : createFriendlyUserName(
          permission.fromUserName,
          t('share:permissionsDashboard.user.unknown')
        );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const result = await onConfirm(permission.id);
    if (result) {
      closeModal();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', 'p-6')}>
      <div className={cn('text-center')}>
        <div
          className={cn(
            'mx-auto',
            'mb-4',
            'flex',
            'h-12',
            'w-12',
            'items-center',
            'justify-center',
            'rounded-full',
            'bg-red-100',
            'dark:bg-red-900/20'
          )}
        >
          <Trash2
            className={cn('h-6', 'w-6', 'text-red-600', 'dark:text-red-400')}
          />
        </div>

        <p className={cn('muted-text', 'mt-2', 'text-sm')}>
          {t(`share:permissionsDashboard.confirmation.${mode}.description`, {
            userName,
            targetName,
          })}
        </p>

        <p className={cn('muted-text', 'mt-2', 'text-xs')}>
          {t('share:permissionsDashboard.confirmation.warning')}
        </p>
      </div>

      <div className={cn('flex', 'justify-center', 'gap-3')}>
        <Button
          type='button'
          onClick={closeModal}
          variant='default'
          className={cn('btn')}
          disabled={isLoading}
        >
          {t('share:permissionsDashboard.confirmation.cancel')}
        </Button>
        <Button
          type='submit'
          variant='escape'
          className={cn('btn')}
          disabled={isLoading}
        >
          {isLoading
            ? t('share:permissionsDashboard.confirmation.processing')
            : t(`share:permissionsDashboard.confirmation.${mode}.confirm`)}
        </Button>
      </div>
    </form>
  );
};
