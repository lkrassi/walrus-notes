import { cn } from '@/shared/lib';
import { Button } from '@/shared/ui';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const OpenPermissionsDashboardButton: FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleOpen = () => {
    navigate('/dashboard');
  };

  return (
    <Button
      onClick={handleOpen}
      className={cn(
        'flex',
        'h-10',
        'w-30',
        'items-center',
        'justify-center',
        'px-7',
        'py-2'
      )}
      title={t('settings:sections.permissionsDashboard.title')}
    >
      {t('settings:buttons.goTo')}
    </Button>
  );
};
