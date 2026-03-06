import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from 'shared/lib/cn';
import { Button } from 'shared/ui';
import { useLocalization } from 'widgets/hooks';

export const OpenPermissionsDashboardButton: FC = () => {
  const navigate = useNavigate();
  const { t } = useLocalization();

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
