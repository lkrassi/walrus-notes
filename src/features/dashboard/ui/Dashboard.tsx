import { cn } from '@/shared/lib/core';
import { PrivateHeader } from '@/widgets/ui';
import { type FC } from 'react';
import { DashboardContent } from './permissions/DashboardContent';

export const Dashboard: FC = () => {
  return (
    <div
      className={cn(
        'bg-bg dark:bg-dark-bg text-text dark:text-dark-text min-h-screen'
      )}
    >
      <PrivateHeader />
      <DashboardContent />
    </div>
  );
};
