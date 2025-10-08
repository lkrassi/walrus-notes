import { useState } from 'react';

import { Button } from 'shared';

import { Login } from 'features/auth/ui/components/Login';
import { Register } from 'features/auth/ui/components/Register';
import { useLocalization } from 'widgets/hooks/useLocalization';

import { PublicHeader } from 'widgets/ui/components';

export const Auth = () => {
  const [activeForm, setActiveForm] = useState<'login' | 'register'>('login');
  const { t } = useLocalization();

  const activeClasses = `
    bg-btn-bg
    shadow-[0_8px_0_0_#6f46d0]
    hover:bg-btn-hover
  `;

  const inactiveClasses = `
    bg-[#a0a0a0]
    shadow-[0_8px_0_0_#7a7a7a]
    hover:bg-[#909090]
    active:bg-btn-bg
    active:shadow-[0_1px_0_0_#7a7a7a]
    active:translate-y-1.5
  `;

  const handleSwitchToLogin = () => {
    setActiveForm('login');
  };

  const handleSwitchToRegister = () => {
    setActiveForm('register');
  };

  return (
    <main>
      <PublicHeader />

      <div className='flex items-center justify-center max-sm:min-h-full max-sm:py-10'>
        <div className='w-full max-w-md'>
          <div className='mb-8 flex gap-x-5 p-2 max-sm:flex-col max-sm:gap-y-5'>
            <Button
              type='button'
              onClick={() => setActiveForm('login')}
              className={`flex-1 px-8 py-4 text-sm font-medium ${
                activeForm === 'login' ? activeClasses : inactiveClasses
              }`}
            >
              {t('auth:common.loginTab')}
            </Button>
            <Button
              type='button'
              onClick={() => setActiveForm('register')}
              className={`focus:bg-btn-bg flex-1 px-8 py-4 text-sm font-medium ${
                activeForm === 'register' ? activeClasses : inactiveClasses
              }`}
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
