import { ProfileButton } from 'features/profile';
import { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import cn from 'shared/lib/cn';
import { useLocalization } from 'widgets/hooks';
import logo2 from '../../../../assets/logo2.png';
import logo from '../../../../assets/logo.png';
import Garland from '../Garland';
import { useHolidaySettings } from '../../../hooks/useHolidaySettings';
import { MobileMenu } from './MobileMenu';

const PrivateHeaderComponent = () => {
  const { t } = useLocalization();
  const { enabled, settings } = useHolidaySettings();
  const location = useLocation();
  const isProfilePage = location.pathname === '/profile';

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
          'items-center',
          'justify-between',
          'px-4',
          'md:px-0'
        )}
      >
        <div className={cn('flex', 'items-center', 'gap-2', 'md:gap-3')}>
          {!isProfilePage && <MobileMenu />}
          <Link
            to='/dashboard'
            className={cn('flex', 'items-center', 'gap-2', 'md:gap-3')}
            aria-label={t('common:header.goToHomepage')}
          >
            <img
              src={enabled ? logo2 : logo}
              alt={t('common:header.logoAlt')}
              className={cn('h-15', 'w-15', 'md:h-25', 'md:w-25')}
              loading='lazy'
            />
            <div
              className={cn('flex', 'items-baseline', 'gap-1', 'max-md:hidden')}
            >
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
        </div>

        <ProfileButton />
      </div>
    </header>
  );
};

export const PrivateHeader = memo(PrivateHeaderComponent);
PrivateHeader.displayName = 'PrivateHeader';
