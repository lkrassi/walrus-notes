import logo from '@/shared/assets/logo.avif';
import { cn } from '@/shared/lib';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { DashboardContent } from './permissions';

const DashboardHeader = () => {
  const { t } = useTranslation();

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

export const DashBoard: FC = () => {
  return (
    <div
      className={cn(
        'bg-bg dark:bg-dark-bg text-text dark:text-dark-text min-h-screen'
      )}
    >
      <DashboardHeader />
      <DashboardContent />
    </div>
  );
};
