import logo from '@/shared/assets/logo.avif';
import { cn } from '@/shared/lib';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { MobileMenu } from './MobileMenu';

const PrivateHeaderComponent = () => {
  const { t } = useTranslation();
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
      <div
        className={cn(
          'flex',
          'items-center',
          'justify-between',
          'px-4',
          'md:px-0'
        )}
      >
        <div className={cn('flex', 'items-center')}>
          {!isProfilePage && <MobileMenu />}
          <Link
            to='/main'
            className={cn('flex', 'items-center')}
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
        </div>
      </div>
    </header>
  );
};

export const PrivateHeader = memo(PrivateHeaderComponent);
