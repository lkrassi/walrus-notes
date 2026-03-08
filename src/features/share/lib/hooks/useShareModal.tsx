import { createContext, useContext, type MouseEvent } from 'react';
import type { ShareTargetKind } from '../../model/types';

type ShareModalContextType = {
  openShareLinkModal: (
    targetId: string,
    kind: ShareTargetKind
  ) => (event: MouseEvent<HTMLElement>) => void;
};

const ShareModalContext = createContext<ShareModalContextType | null>(null);

export const ShareModalProviderContext = ShareModalContext.Provider;

export const useShareModal = () => {
  const context = useContext(ShareModalContext);

  if (!context) {
    throw new Error('useShareModal must be used within ShareModalProvider');
  }

  return context;
};
