import { SettingsButton } from 'features/settings';
import { memo } from 'react';
import { Link } from 'react-router-dom';
import cn from 'shared/lib/cn';
import { useLocalization } from 'widgets/hooks';
import logo from '../../../../assets/logo.png';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { LogoutButton } from '../logout/LogoutButton';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';

const PrivateHeaderComponent = () => {
  const { t } = useLocalization();

  return (
    <header
      className={cn(
        'dark:bg-dark-bg',
        'border-border',
        'dark:border-dark-border',
        'flex',
        'flex-col',
        'gap-4',
        'border-b',
        'max-md:py-5',
        'md:px-5'
      )}
    >
      <div
        className={cn(
          'flex',
          'flex-col',
          'items-center',
          'gap-4',
          'md:flex-row',
          'md:items-center',
          'md:justify-between'
        )}
      >
        <Link
          to='/dashboard'
          className={cn(
            'flex',
            'flex-col',
            'items-center',
            'gap-2',
            'md:flex-row',
            'md:gap-3'
          )}
          aria-label={t('common:header.goToHomepage')}
        >
          <img
            src={logo}
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

        <div className={cn('flex', 'gap-x-2', 'max-md:flex-col')}>
          <div className={cn('flex', 'gap-x-2', 'max-md:justify-center')}>
            <LogoutButton />
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>

          <div
            className={cn(
              'flex',
              'w-full',
              'flex-col',
              'items-stretch',
              'gap-2',
              'max-md:mt-5',
              'max-md:items-center',
              'md:w-auto',
              'md:flex-row',
              'md:gap-x-2'
            )}
          >
            <SettingsButton />
          </div>
        </div>
      </div>{' '}
    </header>
  );
};

export const PrivateHeader = memo(PrivateHeaderComponent);
PrivateHeader.displayName = 'PrivateHeader';
