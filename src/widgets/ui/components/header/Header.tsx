import React from 'react';

import { useNavigate } from 'react-router-dom';
import { Button } from 'shared';

import { useLocalization } from 'widgets/hooks/useLocalization';
import { LanguageSwitcher } from 'widgets/ui/components/LanguageSwitcher';
import { ThemeSwitcher } from 'widgets/ui/components/theme/ThemeSwitcher';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLocalization();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    navigate('/auth');
  };

  return (
    <header className='bg-bg/80 dark:bg-dark-bg/80 backdrop-blur-lg border-b border-border dark:border-dark-border px-4 py-4'>
      <div className='max-w-7xl mx-auto flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          <div className='w-10 h-10 bg-gradient-to-r from-primary to-primary-gradient rounded-2xl flex items-center justify-center shadow-lg'>
            <span>🐋</span>
          </div>
          <span className='text-2xl font-bold bg-gradient-to-r from-primary to-primary-gradient bg-clip-text text-transparent'>
            Walrus Notes
          </span>
        </div>

        <div className='flex items-center space-x-4'>
          <LanguageSwitcher />
          <ThemeSwitcher />
          <Button
            onClick={handleLogout}
            className='px-4 py-2 text-sm'
            variant='outline'
          >
            {t('common:buttons.logout')}
          </Button>
        </div>
      </div>
    </header>
  );
};
