import { useApplyLinkMutation } from '@/entities';
import { useNotifications } from '@/entities/notification';
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

export const useApplyLinkAccessFlow = () => {
  const [applyLink] = useApplyLinkMutation();
  const { showSuccess, showError } = useNotifications();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const processedLinkIdRef = useRef<string | null>(null);

  useEffect(() => {
    const linkId = searchParams.get('linkId')?.trim();
    if (!linkId) {
      return;
    }

    const clearLinkQuery = () => {
      navigate(
        {
          pathname: location.pathname,
          search: '',
        },
        { replace: true }
      );
    };

    const applyGuardKey = `apply-link-processed:${linkId}`;
    if (sessionStorage.getItem(applyGuardKey) === '1') {
      clearLinkQuery();
      return;
    }

    if (processedLinkIdRef.current === linkId) {
      return;
    }

    processedLinkIdRef.current = linkId;

    void (async () => {
      try {
        await applyLink({ linkId }).unwrap();
        sessionStorage.setItem(applyGuardKey, '1');
        showSuccess('Доступ успешно предоставлен.');
      } catch {
        showError('Ошибка при получении доступа.');
      } finally {
        clearLinkQuery();
      }
    })();
  }, [searchParams, applyLink, showSuccess, showError, navigate, location]);
};
