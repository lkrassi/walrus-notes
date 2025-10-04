import { useState } from 'react';
import { Button } from 'shared';
import { ThemeSwitcher } from 'widgets';
import { Login } from './Login';
import { Register } from './Register';

export const Auth = () => {
  const [activeForm, setActiveForm] = useState<'login' | 'register'>('login');

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
    <>
      <div className='fixed p-5 top-0 right-0 w-fit max-sm:left-0 max-sm:mx-auto'>
        <ThemeSwitcher />
      </div>

      <div className='flex items-center justify-center min-h-screen'>
        <div className='max-w-md w-full'>
          <div className='flex max-sm:flex-col max-sm:gap-y-5 p-2 mb-8 gap-x-5'>
            <Button
              type='button'
              onClick={() => setActiveForm('login')}
              className={`flex-1 text-sm font-medium py-4 px-8 ${
                activeForm === 'login' ? activeClasses : inactiveClasses
              }`}
            >
              Вход
            </Button>
            <Button
              type='button'
              onClick={() => setActiveForm('register')}
              className={`flex-1 text-sm font-medium py-4 px-8 ${
                activeForm === 'register' ? activeClasses : inactiveClasses
              }`}
            >
              Регистрация
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
                ? 'Ещё нет аккаунта? '
                : 'Уже есть аккаунт? '}
              <button
                type='button'
                onClick={() =>
                  setActiveForm(activeForm === 'login' ? 'register' : 'login')
                }
                className='text-primary hover:underline focus:underline font-medium transition-colors duration-300 bg-transparent p-0'
              >
                {activeForm === 'login' ? 'Зарегистрироваться' : 'Войти'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
