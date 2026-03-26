import { cn } from '@/shared/lib/core';
import { Button } from '@/shared/ui';
import { Settings } from 'lucide-react';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const SettingsButton: FC = () => {
  const navigate = useNavigate();

  const { t } = useTranslation();

  const handleOpenSettings = () => {
    navigate('/profile');
  };

  return (
    <Button
      variant='default'
      onClick={handleOpenSettings}
      className={cn(
        'flex',
        'h-10',
        'w-5',
        'items-center',
        'justify-center',
        'px-7',
        'py-2'
      )}
      title={t('settings:title')}
    >
      <span>
        <Settings size={18} />
      </span>
    </Button>
  );
};
