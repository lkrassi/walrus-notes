import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'shared';
import { logout } from 'shared/api/logout';
import { cn } from 'shared/lib/cn';
import { useLocalization } from 'widgets/hooks';
import { useAppDispatch } from 'widgets/hooks/redux';

export const LogoutButton = () => {
  const { t } = useLocalization();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    logout(dispatch);
    navigate('/auth');
  };

  return (
    <Button
      data-tour='logout'
      onClick={handleLogout}
      className={cn(
        'flex',
        'h-10',
        'w-30',
        'items-center',
        'justify-center',
        'px-7',
        'py-2'
      )}
      aria-label='Выйти'
      variant='default'
      title={t('auth:common.logout')}
    >
      <span>
        <LogOut className={cn('h-4', 'w-4')} />
      </span>
    </Button>
  );
};
