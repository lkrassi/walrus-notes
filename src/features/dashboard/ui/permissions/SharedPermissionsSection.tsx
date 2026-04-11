import { type PermissionItem } from '@/entities';
import { cn } from '@/shared/lib/core';
import { Users } from 'lucide-react';
import { type FC } from 'react';
import type { EditablePermissionState } from '../../model';
import { SharedPermissionCard } from './components/SharedPermissionCard';

interface SharedPermissionsSectionProps {
  mergedShared: ({
    draft: EditablePermissionState;
    isDirty: boolean;
  } & PermissionItem)[];
  t: (key: string, options?: Record<string, unknown>) => string;
  isDeleting: boolean;
  isUpdating: boolean;
  setDraftValue: (
    permissionId: string,
    field: string | number | symbol,
    value: boolean,
    fallback: PermissionItem
  ) => void;
  handleDelete: (permissionId: string) => void;
  handleUpdate: (permissionId: string, draft: EditablePermissionState) => void;
}

export const SharedPermissionsSection: FC<SharedPermissionsSectionProps> = ({
  mergedShared,
  t,
  isDeleting,
  isUpdating,
  setDraftValue,
  handleDelete,
  handleUpdate,
}) => (
  <section
    className={cn(
      'relative overflow-hidden rounded-2xl border',
      'border-border dark:border-dark-border',
      'dark:bg-dark-bg bg-white',
      'p-5',
      'transition-all'
    )}
  >
    <div className='mb-4 flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            'bg-primary/10 text-primary'
          )}
        >
          <Users size={16} />
        </div>

        <h2 className='text-sm font-semibold tracking-tight'>
          {t('share:permissionsDashboard.sharedTitle')}
        </h2>
      </div>

      <span
        className={cn(
          'rounded-full px-2 py-0.5 text-xs font-medium',
          'bg-muted text-muted-foreground'
        )}
      >
        {mergedShared.length}
      </span>
    </div>

    {!mergedShared.length && (
      <div
        className={cn(
          'flex h-24 items-center justify-center rounded-xl border',
          'border-border border-dashed',
          'muted-text text-sm'
        )}
      >
        {t('share:permissionsDashboard.emptyShared')}
      </div>
    )}

    <div className='space-y-3'>
      {mergedShared.map(({ draft, isDirty, ...permission }) => (
        <SharedPermissionCard
          key={permission.id}
          permission={permission}
          draft={draft}
          canUpdate={isDirty}
          toUserName={permission.toUserName}
          toUserAvatar={permission.toUserAvatar}
          disabledDelete={isDeleting}
          disabledUpdate={isUpdating}
          onChange={(field, value, fallback) =>
            setDraftValue(permission.id, field, value, fallback)
          }
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          t={t}
        />
      ))}
    </div>
  </section>
);
