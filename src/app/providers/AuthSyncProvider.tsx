import { useAuthSync } from '@/features/auth';
import type { ReactNode } from 'react';

export const AuthSyncProvider = ({ children }: { children: ReactNode }) => {
  useAuthSync();

  return <>{children}</>;
};
