import { useState } from 'react';

import { Button } from 'shared';

import { Login } from 'features/auth/ui/components/Login';
import { Register } from 'features/auth/ui/components/Register';
import { useLocalization } from 'widgets/hooks/useLocalization';

import { PublicHeader } from 'widgets/ui/components';

export const Auth = () => {
  const [activeForm, setActiveForm] = useState<'login' | 'register'>('login');
  const { t } = useLocalization();

  const handleSwitchToLogin = () => {
    setActiveForm('login');
  };

  const handleSwitchToRegister = () => {
    setActiveForm('register');
  };

  return (
    <main>
      <PublicHeader />

      <div className='flex items-center justify-center max-sm:min-h-full max-sm:py-10 min-h-[80vh]'>
        <div className='w-full max-w-md'>
          <div className='mb-8 flex gap-x-5 p-2 max-sm:flex-col max-sm:gap-y-5'>
            <Button
              type='button'
              onClick={() => setActiveForm('login')}
              className='flex-1 px-8 py-4 text-sm font-medium'
              variant={activeForm === 'login' ? 'default' : 'disabled'}
            >
              {t('auth:common.loginTab')}
            </Button>
            <Button
              type='button'
              onClick={() => setActiveForm('register')}
              className='flex-1 px-8 py-4 text-sm font-medium'
              variant={activeForm === 'login' ? 'disabled' : 'default'}
            >
              {t('auth:common.registerTab')}
            </Button>
          </div>

          <div>
            {activeForm === 'login' ? (
              <Login onSwitchToRegister={handleSwitchToRegister} />
            ) : (
              <Register onSwitchToLogin={handleSwitchToLogin} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
