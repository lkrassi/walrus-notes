import { type PermissionItem } from '@/entities';
import type { EditablePermissionState } from '@/features/dashboard/model';
import { cn } from '@/shared/lib/core';
import { Tooltip } from '@/shared/ui';
import { Check, LockKeyhole } from 'lucide-react';
import { type FC } from 'react';
import { rightsList, rightTooltipKey } from '../../../lib/utils/permissions';

interface PermissionAccessBlocksProps {
  rights: EditablePermissionState;
  t: (key: string, options?: Record<string, unknown>) => string;
  mode?: 'view' | 'edit';
  showCheckbox?: boolean;
  disabled?: boolean;
  onChange?: (
    field: keyof EditablePermissionState,
    value: boolean,
    permission: PermissionItem
  ) => void;
  permission?: PermissionItem;
}

const blockStyleByRight: Record<keyof EditablePermissionState, string> = {
  canRead: 'bg-sky-500/8 border-sky-500/25 text-sky-700 dark:text-sky-300',
  canWrite:
    'bg-amber-500/8 border-amber-500/25 text-amber-700 dark:text-amber-300',
  canEdit:
    'bg-emerald-500/8 border-emerald-500/25 text-emerald-700 dark:text-emerald-300',
};

const rightMeta: Array<{
  field: keyof EditablePermissionState;
  right: 'read' | 'write' | 'edit';
  labelKey: string;
}> = [
  {
    field: 'canRead',
    right: 'read',
    labelKey: 'share:permissionsDashboard.flagsLabel.read',
  },
  {
    field: 'canWrite',
    right: 'write',
    labelKey: 'share:permissionsDashboard.flagsLabel.write',
  },
  {
    field: 'canEdit',
    right: 'edit',
    labelKey: 'share:permissionsDashboard.flagsLabel.edit',
  },
];

export const PermissionAccessBlocks: FC<PermissionAccessBlocksProps> = ({
  rights,
  t,
  mode = 'view',
  showCheckbox = true,
  disabled = false,
  onChange,
  permission,
}) => {
  const visibleRights =
    mode === 'edit' ? ['read', 'write', 'edit'] : rightsList(rights);

  if (!visibleRights.length) {
    return (
      <div className='flex'>
        <div
          className={cn(
            'flex items-center justify-between gap-2 rounded-lg border px-2 py-1.5 text-xs transition-colors',
            'border-border dark:border-dark-border dark:bg-dark-bg/60 bg-white/80'
          )}
        >
          {t('share:permissionsDashboard.rights.none')}
        </div>
      </div>
    );
  }

  return (
    <div className='flex max-sm:flex-col max-sm:gap-y-2 sm:gap-x-2'>
      {rightMeta
        .filter(({ right }) => visibleRights.includes(right))
        .map(({ field, right, labelKey }) => {
          const isActive = rights[field];
          const canToggle = field !== 'canRead';

          const block = (
            <div
              className={cn(
                'flex items-center justify-between gap-2 rounded-lg border px-2 py-1.5 text-xs transition-colors',
                'border-border dark:border-dark-border dark:bg-dark-bg/60 bg-white/80',
                isActive
                  ? blockStyleByRight[field]
                  : 'opacity-45 grayscale-[0.15]',
                mode === 'edit' && canToggle && !disabled && 'cursor-pointer'
              )}
            >
              <span className='min-w-0 flex-1 truncate font-medium tracking-wide uppercase'>
                {t(labelKey)}
              </span>

              {showCheckbox ? (
                canToggle ? (
                  <div
                    className={cn(
                      'border-border dark:border-dark-border flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border',
                      isActive
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-transparent'
                    )}
                  >
                    {isActive ? <Check className='h-3 w-3' /> : null}
                  </div>
                ) : (
                  <div
                    className={cn(
                      'border-border dark:border-dark-border text-muted-foreground flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border',
                      'bg-muted/60 dark:bg-dark-bg/40'
                    )}
                    aria-hidden='true'
                  >
                    <LockKeyhole className='h-2.5 w-2.5' />
                  </div>
                )
              ) : null}
            </div>
          );

          if (mode === 'edit' && onChange && permission && canToggle) {
            return (
              <Tooltip key={field} title={t(rightTooltipKey(right))}>
                <button
                  type='button'
                  onClick={() => onChange(field, !isActive, permission)}
                  disabled={disabled}
                  className='block text-left disabled:cursor-not-allowed disabled:opacity-60 max-sm:w-full'
                >
                  {block}
                </button>
              </Tooltip>
            );
          }

          return (
            <Tooltip key={field} title={t(rightTooltipKey(right))}>
              <div className='max-sm:w-full'>{block}</div>
            </Tooltip>
          );
        })}
    </div>
  );
};
