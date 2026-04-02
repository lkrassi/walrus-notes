import { logoImage as logo } from '@/shared/assets';
import { cn } from '@/shared/lib/core';
import { useLocalization } from '@/widgets/hooks';
import { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MobileMenu } from './MobileMenu';

const PrivateHeaderComponent = () => {
  const { t } = useLocalization();
  const location = useLocation();
  const isProfilePage = location.pathname === '/profile';
  const isSettingsPage = location.pathname === '/settings';
  const isDashboardPage = location.pathname === '/dashboard';

  return (
    <header
      className={cn(
        'bg-bg',
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
        <div className={cn('flex', 'items-center', 'gap-2')}>
          {!isProfilePage && !isSettingsPage && !isDashboardPage && (
            <MobileMenu />
          )}
          <Link
            to='/main'
            className={cn('flex', 'items-center')}
            aria-label={t('common:header.goToHomepage')}
          >
            <img
              src={logo}
              alt={t('common:header.logoAlt')}
              className={cn(
                'h-12',
                'w-12',
                'min-h-12',
                'min-w-12',
                'max-h-12',
                'max-w-12'
              )}
              loading='lazy'
            />
            <div
              className={cn('flex', 'items-baseline', 'gap-1')}
              style={{ minHeight: '48px', alignItems: 'center' }}
            >
              <h1
                className={cn(
                  'text-text',
                  'dark:text-dark-text',
                  'text-xl',
                  'leading-none',
                  'font-bold'
                )}
                style={{ lineHeight: '48px', height: '48px' }}
              >
                Walrus
              </h1>
              <h1
                className={cn(
                  'text-primary',
                  'text-xl',
                  'leading-none',
                  'font-bold'
                )}
                style={{ lineHeight: '48px', height: '48px' }}
              >
                Notes
              </h1>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export const PrivateHeader = memo(PrivateHeaderComponent);
