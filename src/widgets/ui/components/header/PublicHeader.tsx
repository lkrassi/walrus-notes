import { logoImage as logo } from '@/shared/assets';
import { cn } from '@/shared/lib/core';
import { useLocalization } from '@/widgets/hooks/useLocalization';
import { LanguageSwitcher } from '@/widgets/ui/components/LanguageSwitcher';
import { ThemeSwitcher } from '@/widgets/ui/components/theme/ThemeSwitcher';
import { memo } from 'react';
import { Link } from 'react-router-dom';

const PublicHeaderComponent = () => {
  const { t } = useLocalization();

  return (
    <div className='px-5 pt-5'>
      <header
        className={cn(
          'border-border',
          'bg-bg/90',
          'sticky',
          'top-0',
          'z-40',
          'border',
          'backdrop-blur',
          'rounded-xl'
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
          <div className={cn('flex', 'gap-x-2')}>
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>
        </div>
      </header>
    </div>
  );
};

export const PublicHeader = memo(PublicHeaderComponent);
