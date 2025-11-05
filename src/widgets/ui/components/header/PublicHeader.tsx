import { memo } from 'react';
import { Link } from 'react-router-dom';

import logo from '../../../../assets/logo.png';

import { useLocalization } from 'widgets/hooks/useLocalization';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';

export const PublicHeader = memo(() => {
  const { t } = useLocalization();

  return (
    <header className='dark:bg-dark-bg border-border dark:border-dark-border flex flex-col items-center gap-4 border-b max-md:py-5 md:flex-row md:items-center md:justify-between md:px-5'>
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
          <h1 className='text-text dark:text-dark-text text-base font-bold sm:text-xl md:text-2xl'>
            Walrus
          </h1>
          <h1 className='text-primary text-base font-bold sm:text-xl md:text-2xl'>
            Notes
          </h1>
        </div>
      </Link>
      <div className='flex gap-x-2'>
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>
    </header>
  );
});

(PublicHeader as unknown as { displayName?: string }).displayName =
  'PublicHeader';
