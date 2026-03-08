import { Button } from '@/shared';
import { cn } from '@/shared/lib/core';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const Unavailable = () => {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'bg-bg',
        'dark:bg-dark-bg',
        'text-text',
        'dark:text-dark-text',
        'flex',
        'min-h-screen',
        'flex-1',
        'items-center',
        'justify-center',
        'p-4'
      )}
    >
      <div className={cn('mx-auto', 'max-w-2xl', 'text-center')}>
        <div className={cn('relative', 'mb-8')}>
          <div
            className={cn(
              'text-primary',
              'dark:text-dark-primary',
              'absolute',
              'inset-0',
              'flex',
              'items-center',
              'justify-center',
              'text-9xl',
              'font-bold',
              'opacity-10'
            )}
          >
            404
          </div>
          <div className={cn('relative')}>
            <h1
              className={cn(
                'from-primary',
                'to-primary-gradient',
                'dark:from-dark-primary',
                'dark:to-dark-primary-gradient',
                'mb-4',
                'bg-clip-text',
                'text-8xl',
                'font-bold',
                'text-transparent'
              )}
            >
              404
            </h1>
          </div>
        </div>

        <h2
          className={cn(
            'text-text',
            'dark:text-dark-text',
            'mb-4',
            'text-3xl',
            'font-bold'
          )}
        >
          {t('common:unavailable.title')}
        </h2>

        <p
          className={cn(
            'text-secondary',
            'dark:text-dark-secondary',
            'mx-auto',
            'mb-8',
            'max-w-md',
            'text-lg',
            'leading-relaxed'
          )}
        >
          {t('common:unavailable.description')}
        </p>

        <div
          className={cn(
            'mb-8',
            'flex',
            'flex-col',
            'items-center',
            'justify-center',
            'gap-4',
            'sm:flex-row'
          )}
        >
          <Link to='/main'>
            <Button variant='default' className={cn('w-60', 'px-8', 'py-3')}>
              {t('common:unavailable.goHome')}
            </Button>
          </Link>

          <Button
            onClick={() => window.history.back()}
            variant='submit'
            className={cn('w-60', 'px-8', 'py-3')}
          >
            {t('common:unavailable.goBack')}
          </Button>
        </div>

        <div
          className={cn(
            'border-border',
            'dark:border-dark-border',
            'bg-bg',
            'dark:bg-dark-bg',
            'text-secondary',
            'dark:text-dark-secondary',
            'mx-auto',
            'max-w-md',
            'rounded-lg',
            'border',
            'p-4',
            'text-sm'
          )}
        >
          <p>{t('common:unavailable.helpText')}</p>
        </div>
      </div>
    </div>
  );
};
