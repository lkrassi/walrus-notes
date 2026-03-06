import logo from '@/shared/assets/logo.avif';
import { cn } from '@/shared/lib';
import { LanguageSwitcher } from '@/shared/ui/components/LanguageSwitcher';
import { ThemeSwitcher } from '@/shared/ui/components/theme/ThemeSwitcher';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const PublicHeaderComponent = () => {
  const { t } = useTranslation();

  return (
    <header
      className={cn(
        'dark:bg-dark-bg',
        'border-border',
        'dark:border-dark-border',
        'flex',
        'flex-col',
        'items-center',
        'gap-4',
        'border-b',
        'max-md:py-5',
        'md:flex-row',
        'md:items-center',
        'md:justify-between',
        'md:px-5'
      )}
    >
      <Link
        to='/'
        className={cn('flex', 'items-center', 'max-md:flex-col')}
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
      <div className={cn('flex', 'gap-x-2')}>
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export const PublicHeader = memo(PublicHeaderComponent);
