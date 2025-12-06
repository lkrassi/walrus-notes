import { SettingsButton } from 'features/settings';
import { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import cn from 'shared/lib/cn';
import { BackButton } from 'shared/ui/components/BackButton';
import { useLocalization } from 'widgets/hooks';
import logo2 from '../../../../assets/logo2.png';
import logo from '../../../../assets/logo.png';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { LogoutButton } from '../logout/LogoutButton';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';
import Garland from '../Garland';
import { useHolidaySettings } from '../../../hooks/useHolidaySettings';

const PrivateHeaderComponent = () => {
  const { t } = useLocalization();
  const location = useLocation();
  const isSettingsPage = location.pathname === '/settings';
  const { enabled, settings } = useHolidaySettings();

  return (
    <header
      className={cn(
        'dark:bg-dark-bg',
        'border-border',
        'dark:border-dark-border',
        'flex',
        'flex-col',
        'gap-3',
        'border-b',
        'max-md:py-5',
        'md:px-5'
      )}
    >
      <Garland active={!!settings?.garland && enabled} />

      <div
        className={cn(
          'flex',
          'flex-col',
          'items-center',
          'gap-3',
          'md:flex-row',
          'md:items-center',
          'md:justify-between'
        )}
      >
        <div className={cn('w-6', 'md:hidden')} />
        <Link
          to='/dashboard'
          className={cn(
            'flex',
            'flex-col',
            'items-center',
            'gap-2',
            'max-md:hidden',
            'md:flex-row',
            'md:gap-3'
          )}
          aria-label={t('common:header.goToHomepage')}
        >
          <img
            src={enabled ? logo2 : logo}
            alt={t('common:header.logoAlt')}
            className={cn('h-25', 'w-25')}
            loading='lazy'
          />
          <div className={cn('flex', 'items-baseline', 'gap-1')}>
            <h1
              className={cn(
                'text-text',
                'dark:text-dark-text',
                'text-base',
                'font-bold',
                'sm:text-xl',
                'md:text-2xl'
              )}
            >
              Walrus
            </h1>
            <h1
              className={cn(
                'text-primary',
                'text-base',
                'font-bold',
                'sm:text-xl',
                'md:text-2xl'
              )}
            >
              Notes
            </h1>
          </div>
        </Link>
        <div
          className={cn(
            'flex',
            'items-center',
            'gap-2',
            'max-md:flex-col',
            'max-md:gap-3'
          )}
        >
          <div className={cn('flex', 'gap-2', 'items-center')}>
            <LogoutButton />
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>

          <div className={cn('flex', 'items-center')}>
            {isSettingsPage ? (
              <BackButton
                title={t('common:back')}
                ariaLabel={t('common:back') as string}
              />
            ) : (
              <SettingsButton />
            )}
          </div>
        </div>
        <Link
          to='/dashboard'
          className={cn(
            'flex',
            'items-center',
            'justify-center',
            'max-md:absolute',
            'max-md:right-4',
            'md:hidden'
          )}
          aria-label={t('common:header.goToHomepage')}
        >
          <img
            src={enabled ? logo2 : logo}
            alt={t('common:header.logoAlt')}
            className={cn('h-15', 'w-15')}
            loading='lazy'
          />
        </Link>
      </div>
    </header>
  );
};

export const PrivateHeader = memo(PrivateHeaderComponent);
PrivateHeader.displayName = 'PrivateHeader';
