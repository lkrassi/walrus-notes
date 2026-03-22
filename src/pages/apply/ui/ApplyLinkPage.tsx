import { useNotifications } from '@/entities/notification';
import { useDashboardPermissions } from '@/features/dashboard';
import React, { useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ApplyLinkPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleApplyLink } = useDashboardPermissions();
  const { showSuccess, showError } = useNotifications();

  const hasProcessedRef = useRef(false);

  const processLink = useCallback(async () => {
    const linkId = searchParams.get('linkId');
    if (!linkId || linkId.trim() === '') {
      navigate('/unavailable');
      return;
    }

    if (hasProcessedRef.current) return;

    hasProcessedRef.current = true;
    try {
      await handleApplyLink(linkId);
      showSuccess('Доступ успешно предоставлен.');
      navigate('/main');
    } catch (error: unknown) {
      console.error('Error applying link:', error);
      showError('Ошибка при получении доступа.');
      navigate('/main');
    }
  }, [searchParams, handleApplyLink, navigate, showSuccess, showError]);

  useEffect(() => {
    processLink();
  }, [processLink]);

  return <div>Processing your access request...</div>;
};

export { ApplyLinkPage };
