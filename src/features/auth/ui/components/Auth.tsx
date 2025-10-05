import { useState } from 'react';

import { Button } from 'shared';
import { ThemeSwitcher } from 'widgets';

import { Login } from 'features/auth/ui/components/Login';
import { Register } from 'features/auth/ui/components/Register';

import { LanguageSwitcher } from 'widgets';
import { useLocalization } from 'widgets/hooks/useLocalization';

export const Auth = () => {
  const [activeForm, setActiveForm] = useState<'login' | 'register'>('login');
  const { t } = useLocalization();

  const activeClasses = `
    bg-[#4bbce8]
    shadow-[0_8px_0_0_#3d9ec4]
    hover:bg-[#4bc7e8]
  `;

  const inactiveClasses = `
    bg-[#a0a0a0]
    shadow-[0_8px_0_0_#7a7a7a]
    hover:bg-[#909090]
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
    <main className='py-5'>
      <div className='flex gap-x-5 justify-end pr-5 max-sm:justify-center max-sm:pr-0'>
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>

      <div className='flex items-center justify-center min-h-screen max-sm:mt-20'>
        <div className='max-w-md w-full'>
          <div className='flex max-sm:flex-col max-sm:gap-y-5 p-2 mb-8 gap-x-5'>
            <Button
              type='button'
              onClick={() => setActiveForm('login')}
              className={`flex-1 text-sm font-medium py-4 px-8 ${
                activeForm === 'login' ? activeClasses : inactiveClasses
              }`}
            >
              {t('auth:common.loginTab')}
            </Button>
            <Button
              type='button'
              onClick={() => setActiveForm('register')}
              className={`flex-1 text-sm font-medium py-4 px-8 ${
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

          <div className='text-center mt-8'>
            <p className='text-sm text-secondary'>
              {activeForm === 'login'
                ? t('auth:login.noAccount')
                : t('auth:register.haveAccount')}
              <button
                type='button'
                onClick={() =>
                  setActiveForm(activeForm === 'login' ? 'register' : 'login')
                }
                className='text-primary hover:underline focus:underline font-medium transition-colors duration-300 bg-transparent p-0'
              >
                {activeForm === 'login'
                  ? t('auth:login.switchToRegister')
                  : t('auth:register.switchToLogin')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};
