import { ShareModalProviderContext } from '@/features/share';
import { MODAL_SIZE_PRESETS, useModalActions } from '@/shared/lib/react';
import { useLocalization } from '@/widgets/hooks/useLocalization';
import {
  Suspense,
  lazy,
  useCallback,
  type MouseEvent,
  type ReactNode,
} from 'react';

const ShareModal = lazy(() =>
  import('@/features/dashboard/ui/ShareModal').then(m => ({
    default: m.ShareModal,
  }))
);

export const ShareModalProvider = ({ children }: { children: ReactNode }) => {
  const { openModalFromTrigger } = useModalActions();
  const { t } = useLocalization();

  const openShareLinkModal = useCallback(
    (targetId: string) => {
      const handleOpen = openModalFromTrigger(
        <Suspense fallback={<div />}>
          <ShareModal targetId={targetId} />
        </Suspense>,
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
