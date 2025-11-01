import { SettingsButton } from 'features/settings';
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useLocalization } from 'widgets/hooks';
import logo from '../../../../assets/logo.png';
import { Breadcrumbs } from '../breadcrumbs/Breadcrumbs';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { LogoutButton } from '../logout/LogoutButton';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';

export const PrivateHeader = memo(() => {
  const { t } = useLocalization();

  return (
    <header className='dark:bg-dark-bg border-border dark:border-dark-border flex flex-col gap-4 border-b max-md:py-5 md:px-5'>
      <div className='flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-between'>
        <Link
          to='/dashboard'
          className='flex flex-col items-center gap-2 md:flex-row md:gap-3'
          aria-label={t('common:header.goToHomepage')}
        >
          <img
            src={logo}
            alt={t('common:header.logoAlt')}
            className='h-25 w-25'
            loading='lazy'
          />
          <div className='flex items-baseline gap-1'>
            <h1 className='text-text dark:text-dark-text text-base font-bold sm:text-xl md:text-2xl'>
              Walrus
            </h1>
            <h1 className='from-primary to-primary-gradient bg-clip-text text-base font-bold text-transparent sm:text-xl md:text-2xl'>
              Notes
            </h1>
          </div>
        </Link>

        <div className='flex gap-x-2 max-md:flex-col'>
          <div className='flex gap-x-2 max-md:justify-center'>
            <LogoutButton />
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>

          <div className='flex w-full flex-col items-stretch gap-2 max-md:mt-5 max-md:items-center md:w-auto md:flex-row md:gap-x-2'>
            <SettingsButton />
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4'>
        <Breadcrumbs />
      </div>
    </header>
  );
});
