import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from 'shared/lib/cn';
import { Button } from 'shared/ui/components/Button';
import { useLocalization } from 'widgets';

export const SettingsButton: React.FC = () => {
  const navigate = useNavigate();

  const { t } = useLocalization();

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
