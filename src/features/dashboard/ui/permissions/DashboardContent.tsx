import { cn } from '@/shared/lib/core';
import { useTranslation } from 'react-i18next';
import { useDashboardPermissions } from '../../model/useDashboardPermissions';
import { ReceivedPermissionsSection } from './ReceivedPermissionsSection';
import { SharedPermissionsSection } from './SharedPermissionsSection';

export const DashboardContent = () => {
  const { t } = useTranslation();
  const {
    received,
    mergedShared,
    setDraftValue,
    handleDelete,
    handleUpdate,
    isDeleting,
    isUpdating,
  } = useDashboardPermissions();

  return (
    <div className={cn('mx-auto w-full max-w-6xl p-4 md:p-8')}>
      <div className={cn('grid gap-6 xl:grid-cols-2')}>
        <ReceivedPermissionsSection
          received={received}
          t={t}
          isDeleting={isDeleting}
          onDelete={handleDelete}
        />
        <SharedPermissionsSection
          mergedShared={mergedShared}
          t={t}
          isDeleting={isDeleting}
          isUpdating={isUpdating}
          setDraftValue={
            setDraftValue as unknown as (
              permissionId: string,
              field: string | number | symbol,
              value: boolean,
              fallback: import('@/entities').PermissionItem
            ) => void
          }
          handleDelete={handleDelete}
          handleUpdate={handleUpdate}
        />
      </div>
    </div>
  );
};
