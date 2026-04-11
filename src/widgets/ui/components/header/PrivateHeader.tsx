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
  const sectionLabel = isProfilePage
    ? t('common:navigation.profile')
    : isSettingsPage
      ? t('common:navigation.settings')
      : isDashboardPage
        ? t('common:navigation.dashboard')
        : t('common:navigation.workspace');

  return (
    <header
      className={cn(
        'border-border',
        'bg-bg/90',
        'sticky',
        'top-0',
        'z-40',
        'border-b',
        'backdrop-blur'
      )}
    >
      <div
        className={cn(
          'flex',
          'h-14',
          'items-center',
          'justify-between',
          'px-3',
          'md:px-4'
        )}
      >
        <div className={cn('flex', 'items-center', 'gap-2.5', 'min-w-0')}>
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
                'h-10',
                'w-10',
                'min-h-10',
                'min-w-10',
                'max-h-10',
                'max-w-10'
              )}
              loading='lazy'
            />
            <div className={cn('flex', 'items-baseline', 'gap-1')}>
              <h1
                className={cn(
                  'text-text',
                  'text-lg',
                  'leading-none',
                  'font-bold'
                )}
              >
                Walrus
              </h1>
              <h1
                className={cn(
                  'text-primary',
                  'text-lg',
                  'leading-none',
                  'font-bold'
                )}
              >
                Notes
              </h1>
            </div>
          </Link>
        </div>

        <div
          className={cn(
            'text-muted-foreground',
            'hidden',
            'items-center',
            'gap-2',
            'rounded-full',
            'border',
            'border-border/80',
            'bg-surface/80',
            'px-3',
            'py-1',
            'text-xs',
            'font-medium',
            'md:flex'
          )}
        >
          <span
            className={cn('h-1.5', 'w-1.5', 'rounded-full', 'bg-primary')}
          />
          <span className={cn('max-w-45', 'truncate')}>{sectionLabel}</span>
        </div>
      </div>
    </header>
  );
};

export const PrivateHeader = memo(PrivateHeaderComponent);
