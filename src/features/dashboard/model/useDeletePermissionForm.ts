import { useDeletePermissionMutation } from '@/entities';
import { useNotifications } from '@/entities/notification';
import { useModalContentContext } from '@/shared/lib/react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface UseDeletePermissionFormParams {
  permissionId: string;
  onPermissionDeleted?: (permissionId: string) => void;
}

export const useDeletePermissionForm = ({
  permissionId,
  onPermissionDeleted,
}: UseDeletePermissionFormParams) => {
  const { t } = useTranslation();
  const { showError, showSuccess } = useNotifications();
  const { closeModal } = useModalContentContext();
  const [deletePermission, { isLoading }] = useDeletePermissionMutation();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      await deletePermission({ permissionId }).unwrap();
      showSuccess(t('share:permissionsDashboard.notifications.deleted'));
      onPermissionDeleted?.(permissionId);
      closeModal();
    } catch {
      showError(t('share:permissionsDashboard.notifications.deleteError'));
    }
  };

  return {
    isLoading,
    closeModal,
    handleSubmit,
  };
};
