import { cn } from '@/shared/lib/core';
import { useLocalization } from '@/widgets/hooks';
import { Link, useLocation } from 'react-router-dom';

type BreadcrumbItem = {
  key: 'workspace' | 'profile' | 'dashboard';
  to?: string;
  isCurrent?: boolean;
};

type NavigationState = {
  from?: string;
};

export const HeaderBreadcrumbs = () => {
  const { t } = useLocalization();
  const location = useLocation();

  const isProfilePage = location.pathname === '/profile';
  const isDashboardPage = location.pathname === '/dashboard';

  if (!isProfilePage && !isDashboardPage) {
    return null;
  }

  const state = location.state as NavigationState | null;
  const fromPath = state?.from;
  const cameFromProfile =
    isDashboardPage &&
    typeof fromPath === 'string' &&
    fromPath.startsWith('/profile');

  const items: BreadcrumbItem[] = [{ key: 'workspace', to: '/main' }];

  if (isProfilePage) {
    items.push({ key: 'profile', isCurrent: true });
  }

  if (isDashboardPage) {
    if (cameFromProfile) {
      items.push({ key: 'profile', to: '/profile' });
    }
    items.push({ key: 'dashboard', isCurrent: true });
  }

  return (
    <div className={cn('mt-4', 'flex', 'justify-center', 'px-4')}>
      <nav
        aria-label={t('common:breadcrumbs.ariaLabel')}
        className={cn(
          'inline-flex',
          'max-w-full',
          'items-center',
          'gap-2',
          'rounded-md',
          'border',
          'border-border/60',
          'bg-surface/90',
          'px-3',
          'py-1',
          'text-sm',
          'shadow-sm',
          'backdrop-blur-sm'
        )}
      >
        {items.map((item, index) => {
          const label = t(`common:navigation.${item.key}`);

          return (
            <div key={item.key} className={cn('flex', 'items-center', 'gap-2')}>
              {item.to && !item.isCurrent ? (
                <Link
                  to={item.to}
                  className={cn(
                    'text-muted-foreground',
                    'transition-colors',
                    'hover:text-primary',
                    'focus-visible:ring-ring',
                    'rounded-md',
                    'focus-visible:ring-2',
                    'focus-visible:outline-none',
                    'px-1',
                    'py-0.5'
                  )}
                >
                  {label}
                </Link>
              ) : (
                <span
                  className={cn(
                    item.isCurrent ? 'text-primary font-semibold' : 'text-muted-foreground'
                  )}
                  aria-current={item.isCurrent ? 'page' : undefined}
                >
                  {label}
                </span>
              )}

              {index < items.length - 1 && (
                <span className={cn('text-muted-foreground/70')} aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn('opacity-80')}>
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </span>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};
