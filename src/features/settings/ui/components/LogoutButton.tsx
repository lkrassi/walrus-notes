import type { AppDispatch } from '@/app/store';
import { logout } from '@/shared/api/logout';
import { cn } from '@/shared/lib';
import { Button } from '@/shared/ui';
import { LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export const LogoutButton = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

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
