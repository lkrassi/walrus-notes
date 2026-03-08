import { ShareModal } from '@/features/dashboard';
import {
  ShareModalProviderContext,
  type ShareTargetKind,
} from '@/features/share';
import { useModalActions } from '@/shared/lib/react';
import { useCallback, type MouseEvent, type ReactNode } from 'react';

export const ShareModalProvider = ({ children }: { children: ReactNode }) => {
  const { openModalFromTrigger } = useModalActions();

  const openShareLinkModal = useCallback(
    (targetId: string, kind: ShareTargetKind) => {
      const handleOpen = openModalFromTrigger(
        <ShareModal targetId={targetId} kind={kind} />,
        {
          title: kind === 'LAYOUT' ? 'Share Folder' : 'Share Note',
          size: 'md',
        }
      );

      return (event: MouseEvent<HTMLElement>) => handleOpen(event);
    },
    [openModalFromTrigger]
  );

  return (
    <ShareModalProviderContext value={{ openShareLinkModal }}>
      {children}
    </ShareModalProviderContext>
  );
};
