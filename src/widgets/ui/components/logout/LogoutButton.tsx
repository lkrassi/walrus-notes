import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'shared';
import { logout } from 'shared/api/logout';
import cn from 'shared/lib/cn';
import { useLocalization } from 'widgets/hooks';

export const LogoutButton = () => {
  const { t } = useLocalization();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <Button
      data-tour='logout'
      onClick={handleLogout}
      className={cn(
        'flex',
        'h-10',
        'w-5',
        'items-center',
        'justify-center',
        'px-8',
        'py-5'
      )}
      aria-label='Выйти'
      variant='default'
      title={t('auth:common.logout')}
    >
      <span>
        <LogOut />
      </span>
    </Button>
  );
};
