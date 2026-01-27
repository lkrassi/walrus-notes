import { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from 'shared/lib/cn';
import { useLocalization } from 'widgets/hooks';
import logo from '../../../../assets/logo.png';
import { MobileMenu } from './MobileMenu';

const PrivateHeaderComponent = () => {
  const { t } = useLocalization();
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
        'md:px-0.5'
      )}
    >
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
              src={logo}
              alt={t('common:header.logoAlt')}
              className={cn('h-14', 'w-14', 'md:h-18', 'md:w-18')}
              loading='lazy'
            />
            <div
              className={cn('flex', 'items-baseline', 'gap-1', 'max-md:hidden')}
            >
              <h1 className={cn('text-text', 'dark:text-dark-text')}>Walrus</h1>
              <h1 className={cn('text-primary')}>Notes</h1>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export const PrivateHeader = memo(PrivateHeaderComponent);
PrivateHeader.displayName = 'PrivateHeader';
