import { type FC } from 'react';
import { cn } from '@/shared/lib';
import type { EditablePermissionState } from '../types';
import { rightsList } from '../utils';

interface RightsBadgesProps {
  rights: EditablePermissionState;
  t: (key: string) => string;
}

export const RightsBadges: FC<RightsBadgesProps> = ({ rights, t }) => {
  const list = rightsList(rights);

  const containerClassName = cn(
    'flex min-h-7 flex-wrap content-start items-start gap-2'
  );

  if (!list.length) {
    return (
      <div className={containerClassName}>
        <span
          className={cn(
            'border-border dark:border-dark-border text-secondary dark:text-dark-secondary inline-flex rounded-full border px-2.5 py-1 text-xs'
          )}
        >
          {t('share:permissionsDashboard.rights.none')}
        </span>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      {list.map(right => (
        <span
          key={right}
          className={cn(
            'bg-primary/12 text-primary inline-flex rounded-full px-2.5 py-1 text-xs font-medium'
          )}
        >
          {t(`share:permissionsDashboard.rights.${right}`)}
        </span>
      ))}
    </div>
  );
};
