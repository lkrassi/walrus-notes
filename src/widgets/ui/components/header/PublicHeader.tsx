import { Link } from 'react-router-dom';

import logo from '../../../../assets/logo.png';

import { useLocalization } from 'widgets/hooks/useLocalization';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';

export const PublicHeader = () => {
  const { t } = useLocalization();

  return (
    <header className='dark:bg-dark-bg border-border dark:border-dark-border border-b px-5'>
      <div className='flex items-center justify-between'>
        <Link
          to='/'
          className='flex items-center gap-2 max-md:flex-col'
          aria-label={t('common:header.goToHomepage')}
        >
          <img
            src={logo}
            alt={t('common:header.logoAlt')}
            className='h-25 w-25'
            loading='lazy'
          />
          <div className='flex items-baseline gap-1'>
            <h1 className='text-text dark:text-dark-text text-xl font-bold sm:text-2xl'>
              Walrus
            </h1>
            <h1 className='from-primary to-primary-gradient bg-gradient-to-r bg-clip-text text-xl font-bold text-transparent sm:text-2xl'>
              Notes
            </h1>
          </div>
        </Link>
        <div className='flex gap-x-3 sm:gap-x-4 lg:gap-x-5'>
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};
