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
    <div className={cn('mt-3', 'flex', 'justify-center', 'px-2')}>
      <nav
        aria-label={t('common:breadcrumbs.ariaLabel')}
        className={cn(
          'inline-flex',
          'max-w-full',
          'items-center',
          'gap-1.5',
          'rounded-full',
          'border',
          'border-border/80',
          'bg-surface/80',
          'px-3',
          'py-1.5',
          'text-sm',
          'backdrop-blur'
        )}
      >
        {items.map((item, index) => {
          const label = t(`common:navigation.${item.key}`);

          return (
            <div
              key={item.key}
              className={cn('flex', 'items-center', 'gap-1.5')}
            >
              {item.to && !item.isCurrent ? (
                <Link
                  to={item.to}
                  className={cn(
                    'text-muted-foreground',
                    'transition-colors',
                    'hover:text-text',
                    'focus-visible:ring-ring',
                    'rounded-sm',
                    'focus-visible:ring-2',
                    'focus-visible:outline-none'
                  )}
                >
                  {label}
                </Link>
              ) : (
                <span
                  className={cn(
                    item.isCurrent
                      ? 'text-primary font-semibold'
                      : 'text-muted-foreground'
                  )}
                  aria-current={item.isCurrent ? 'page' : undefined}
                >
                  {label}
                </span>
              )}

              {index < items.length - 1 && (
                <span
                  className={cn('text-muted-foreground/80')}
                  aria-hidden='true'
                >
                  {'>'}
                </span>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};
