import { addNotification } from '@/entities';
import { i18n } from '@/shared/config/i18n';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

type DispatchLike = (action: unknown) => unknown;

export const useNoteNotifications = () => {
  const dispatch = useDispatch() as DispatchLike;

  const isRecordNotFound422 = useCallback((error: unknown): boolean => {
    if (!error || typeof error !== 'object') return false;

    const maybeError = error as {
      status?: number | string;
      data?: {
        meta?: {
          code?: string;
        };
      };
    };

    const rawStatus = maybeError.status;
    const status =
      typeof rawStatus === 'string' ? Number(rawStatus) : rawStatus;
    const code = maybeError.data?.meta?.code;

    return status === 422 && code === 'record_not_found';
  }, []);

  const showError = useCallback(
    (message: string) => {
      const translatedMessage = message.includes(':')
        ? i18n.t(message)
        : message;

      dispatch(
        addNotification({
          type: 'error',
          message: translatedMessage,
          duration: 7000,
          origin: 'ui',
        })
      );
    },
    [dispatch]
  );

  return {
    isRecordNotFound422,
    showError,
  } as const;
};
