import { useApplyLinkMutation } from '@/entities';
import { useNotifications } from '@/entities/notification';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const ApplyLinkHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [applyLink] = useApplyLinkMutation();
  const { t } = useTranslation();
  const { showError, showSuccess } = useNotifications();
  const linkId = searchParams.get('linkId');
  const startedRef = useRef(false);

  const getErrorCode = (error: unknown): string => {
    if (error && typeof error === 'object') {
      const maybeError = error as {
        data?: unknown;
        error?: unknown;
        message?: unknown;
      };

      if (typeof maybeError.message === 'string' && maybeError.message) {
        return maybeError.message.toLowerCase();
      }

      if (typeof maybeError.error === 'string' && maybeError.error) {
        return maybeError.error.toLowerCase();
      }

      if (maybeError.data && typeof maybeError.data === 'object') {
        const data = maybeError.data as {
          code?: unknown;
          message?: unknown;
          error?: unknown;
        };

        if (typeof data.code === 'string' && data.code) {
          return data.code.toLowerCase();
        }

        if (typeof data.message === 'string' && data.message) {
          return data.message.toLowerCase();
        }

        if (typeof data.error === 'string' && data.error) {
          return data.error.toLowerCase();
        }
      }
    }

    return 'generic';
  };

  const getErrorMessage = (errorCode: string) => {
    if (errorCode.includes('invalid')) {
      return t('share:apply.notifications.error.invalid');
    }

    if (errorCode.includes('already_exists') || errorCode.includes('already')) {
      return t('share:apply.notifications.error.already_exists');
    }

    return t('share:apply.notifications.error.generic');
  };

  useEffect(() => {
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;

    if (!linkId) {
      showError(t('share:apply.notifications.error.invalid'));
      navigate('/dashboard', { replace: true });
      return;
    }

    const applyLinkFn = async () => {
      try {
        const result = await applyLink({ linkId }).unwrap();

        if (result.kind === 'PERMISSIONS_KIND_LAYOUT') {
          showSuccess(
            t('share:apply.notifications.granted_layout', {
              targetId: result.targetId,
            })
          );
        } else {
          showSuccess(
            t('share:apply.notifications.granted_note', {
              targetId: result.targetId,
            })
          );
        }
      } catch (error) {
        const errorCode = getErrorCode(error);
        showError(getErrorMessage(errorCode));
      } finally {
        navigate('/dashboard', { replace: true });
      }
    };

    applyLinkFn();
  }, [linkId, applyLink, navigate, showError, showSuccess, t]);

  return null;
};
