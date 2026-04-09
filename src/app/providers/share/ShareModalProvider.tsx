import { ShareModal } from '@/features/dashboard/ui/ShareModal';
import { ShareModalProviderContext } from '@/features/share';
import { MODAL_SIZE_PRESETS, useModalActions } from '@/shared/lib/react';
import { useLocalization } from '@/widgets/hooks/useLocalization';
import { useCallback, type MouseEvent, type ReactNode } from 'react';

export const ShareModalProvider = ({ children }: { children: ReactNode }) => {
  const { openModalFromTrigger } = useModalActions();
  const { t } = useLocalization();

  const openShareLinkModal = useCallback(
    (targetId: string) => {
      const handleOpen = openModalFromTrigger(
        <ShareModal targetId={targetId} />,
        {
          title: t('share:modal.permissions.head'),
          size: MODAL_SIZE_PRESETS.shareAccess,
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
