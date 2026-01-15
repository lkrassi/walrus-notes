import { memo } from 'react';
import { Link } from 'react-router-dom';
import cn from 'shared/lib/cn';

import logo2 from '../../../../assets/logo2.png';
import logo from '../../../../assets/logo.png';

import { useLocalization } from 'widgets/hooks/useLocalization';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';
import Garland from '../Garland';
import { useHolidaySettings } from '../../../hooks/useHolidaySettings';

const PublicHeaderComponent = () => {
  const { t } = useLocalization();
  const { enabled, settings } = useHolidaySettings();

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
      <Garland active={!!settings?.garland && enabled} />

      <Link
        to='/'
        className={cn('flex', 'items-center', 'gap-2', 'max-md:flex-col')}
        aria-label={t('common:header.goToHomepage')}
      >
        <img
          src={enabled ? logo2 : logo}
          alt={t('common:header.logoAlt')}
          className={cn('h-14', 'w-14', 'md:h-18', 'md:w-18')}
          loading='lazy'
        />
        <div className={cn('flex', 'items-baseline', 'gap-1', 'max-md:hidden')}>
          <h1 className={cn('text-text', 'dark:text-dark-text')}>Walrus</h1>
          <h1 className={cn('text-primary')}>Notes</h1>
        </div>
      </Link>
      <div className={cn('flex', 'gap-x-2')}>
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export const PublicHeader = memo(PublicHeaderComponent);
PublicHeader.displayName = 'PublicHeader';
