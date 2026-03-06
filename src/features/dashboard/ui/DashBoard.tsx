import { type FC } from 'react';
import { cn } from 'shared/lib/cn';
import { PrivateHeader } from 'widgets/ui';
import { PermissionsDashboardContent } from './permissions';

export const DashBoard: FC = () => {
  return (
    <div
      className={cn(
        'bg-bg dark:bg-dark-bg text-text dark:text-dark-text min-h-screen'
      )}
    >
      <PrivateHeader />
      <PermissionsDashboardContent />
    </div>
  );
};
