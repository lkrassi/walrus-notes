import { useModalActions } from '@/app/providers/modal';
import { ShareModal } from '@/features/dashboard';
import { useCallback } from 'react';

export const useShareLinkModal = () => {
  const { openModalFromTrigger } = useModalActions();

  const openShareLinkModal = useCallback(
    (targetId: string, kind: 'LAYOUT' | 'NOTE') => {
      const handleOpen = openModalFromTrigger(
        <ShareModal targetId={targetId} kind={kind} />,
        {
          title: kind === 'LAYOUT' ? 'Share Folder' : 'Share Note',
          size: 'md',
        }
      );
      return handleOpen;
    },
    [openModalFromTrigger]
  );

  return { openShareLinkModal };
};
