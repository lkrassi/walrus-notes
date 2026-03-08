import { Button } from '@/shared';
import { logoImage as logo } from '@/shared/assets';
import { cn } from '@/shared/lib/core';
import { ThemeContext } from '@/shared/lib/react';
import { RussianFlagIcon } from '@/shared/ui/icons/RussianFlagIcon';
import { UKFlagIcon } from '@/shared/ui/icons/UKFlagIcon';
import { Moon, Sun } from 'lucide-react';
import { type FC, useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Login } from './Login';
import { Register } from './Register';

const LANGUAGES = [
  {
    code: 'en',
    name: 'EN',
    flag: <UKFlagIcon className={cn('h-16', 'w-16', 'sm:h-20', 'sm:w-20')} />,
  },
  {
    code: 'ru',
    name: 'RU',
    flag: (
      <RussianFlagIcon className={cn('h-16', 'w-16', 'sm:h-20', 'sm:w-20')} />
    ),
  },
];

const AuthThemeSwitcher: FC = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <Button
      onClick={toggleTheme}
      className={cn('px-2', 'py-2', 'sm:px-3')}
      aria-label={
        theme === 'dark'
          ? t('common:theme.switchToLight')
          : t('common:theme.switchToDark')
      }
      title={
        theme === 'dark'
          ? t('common:theme.switchToLight')
          : t('common:theme.switchToDark')
      }
      variant='default'
    >
      <span>
        {theme === 'dark' ? (
          <Sun className={cn('h-4', 'w-4')} />
        ) : (
          <Moon className={cn('h-4', 'w-4')} />
        )}
      </span>
    </Button>
  );
};

const AuthLanguageSwitcher: FC = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const currentLang =
    LANGUAGES.find(lang => lang.code === currentLanguage) || LANGUAGES[1];

  const handleToggleLanguage = async () => {
    const nextLanguage = currentLanguage === 'en' ? 'ru' : 'en';
    await i18n.changeLanguage(nextLanguage);
  };

  return (
    <Button
      onClick={() => {
        void handleToggleLanguage();
      }}
      variant='default'
      className={cn('px-2', 'py-2', 'sm:px-3')}
      title={t('common:header.changeLanguage')}
    >
      <div className={cn('flex', 'items-center', 'gap-3')}>
        <span
          className={cn('flex', 'h-6', 'w-8', 'items-center', 'justify-center')}
        >
          {currentLang.flag}
        </span>
        <span className={cn('text-base', 'font-semibold')}>
          {currentLang.name}
        </span>
      </div>
    </Button>
  );
};

const AuthHeader = () => {
  const { t } = useTranslation();

  return (
    <header
      className={cn(
        'dark:bg-dark-bg',
        'border-border',
        'dark:border-dark-border',
        'flex',
        'flex-col',
        'items-center',
        'gap-4',
        'border-b',
        'max-md:py-5',
        'md:flex-row',
        'md:items-center',
        'md:justify-between',
        'md:px-5'
      )}
    >
      <Link
        to='/'
        className={cn('flex', 'items-center', 'max-md:flex-col')}
        aria-label={t('common:header.goToHomepage')}
      >
        <img
          src={logo}
          alt={t('common:header.logoAlt')}
          className={cn('h-16', 'w-16', 'md:h-22', 'md:w-22')}
          loading='lazy'
        />
        <div className={cn('flex', 'items-baseline', 'gap-1')}>
          <h1 className={cn('text-text', 'dark:text-dark-text')}>Walrus</h1>
          <h1 className={cn('text-primary')}>Notes</h1>
        </div>
      </Link>
      <div className={cn('flex', 'gap-x-2')}>
        <AuthThemeSwitcher />
        <AuthLanguageSwitcher />
      </div>
    </header>
  );
};

export const Auth = () => {
  const [activeForm, setActiveForm] = useState<'login' | 'register'>('login');
  const { t } = useTranslation();
  const handleSwitchToLogin = useCallback(() => {
    setActiveForm('login');
  }, []);

  const handleSwitchToRegister = useCallback(() => {
    setActiveForm('register');
  }, []);

  return (
    <main>
      <AuthHeader />

      <div
        className={cn(
          'flex',
          'min-h-[80vh]',
          'items-center',
          'justify-center',
          'max-sm:min-h-full',
          'max-sm:py-10'
        )}
      >
        <div className={cn('w-full', 'max-w-md')}>
          <div
            className={cn(
              'mb-8',
              'flex',
              'gap-x-5',
              'p-2',
              'max-sm:flex-col',
              'max-sm:gap-y-5'
            )}
          >
            <Button
              type='button'
              onClick={() => setActiveForm('login')}
              className={cn('flex-1', 'px-8', 'py-4', 'text-sm', 'font-medium')}
              variant={activeForm === 'login' ? 'default' : 'disabled'}
            >
              {t('auth:common.loginTab')}
            </Button>
            <Button
              type='button'
              onClick={() => setActiveForm('register')}
              className={cn('flex-1', 'px-8', 'py-4', 'text-sm', 'font-medium')}
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
