import { cn } from '@/shared/lib/core';
import { Button } from '@/shared/ui';
import { LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLogoutAction } from '../../model';

export const LogoutActionButton = () => {
  const { t } = useTranslation();
  const { handleLogout } = useLogoutAction();

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
