import React from 'react';
import cn from 'shared/lib/cn';
import { useLocalization } from 'widgets/hooks';
import { PrivateHeader } from 'widgets/ui';
import { settingsSections } from '../../models/variants';
import { useHolidaySettings } from 'widgets/hooks/useHolidaySettings';
import { Button } from 'shared/ui/components/Button';
import { useModalActions } from 'widgets/hooks/useModalActions';
import { HolidaySettingsModal } from './HolidaySettingsModal';

const HolidayToggle: React.FC = () => {
  const { t } = useLocalization();
  const { openModalFromTrigger } = useModalActions();

  const handleOpen = openModalFromTrigger(<HolidaySettingsModal />, {
    title: t('settings:holiday.title') || 'Новогодние украшения',
    size: 'md',
    closeOnOverlayClick: true,
  });

  return (
    <Button
      variant='default'
      className={cn('h-10', 'w-30')}
      onClick={handleOpen}
    >
      {t('settings:holiday.settingsButton')}
    </Button>
  );
};

export const Settings: React.FC = () => {
  const { t } = useLocalization();

  return (
    <div className={cn('bg-bg', 'dark:bg-dark-bg', 'min-h-screen')}>
      <PrivateHeader />

      <main className={cn('container', 'mx-auto', 'px-4', 'py-8')}>
        <div className={cn('mx-auto', 'max-w-4xl')}>
          <div className={cn('card', 'mb-8', 'rounded-2xl', 'p-6')}>
            <div className={cn('flex', 'items-center', 'gap-4')}>
              <div>
                <h2 className={cn('section-title')}>
                  {t('settings:welcome.title')}
                </h2>
                <p className={cn('muted-text')}>
                  {t('settings:welcome.subtitle')}
                </p>
              </div>
            </div>
          </div>

          <div className={cn('space-y-4', 'max-sm:space-y-3')}>
            {settingsSections.map(section => (
              <div
                key={section.title}
                className={cn(
                  'card',
                  'p-6',
                  'transition-shadow duration-200 hover:shadow-md',
                  'max-sm:rounded-lg max-sm:p-4'
                )}
              >
                <div
                  className={cn(
                    'flex',
                    'items-center',
                    'justify-between',
                    'max-sm:flex-col',
                    'max-sm:items-start',
                    'max-sm:gap-3'
                  )}
                >
                  <div
                    className={cn('flex', 'flex-1', 'items-center', 'gap-4')}
                  >
                    <div>
                      <div
                        className={cn(
                          'bg-primary/10',
                          'dark:bg-dark-primary/10',
                          'text-primary',
                          'dark:text-dark-primary',
                          'rounded-lg',
                          'p-2',
                          'max-sm:rounded-md',
                          'max-sm:p-1.5'
                        )}
                      >
                        <section.icon
                          className={cn(
                            'h-5',
                            'w-5',
                            'max-sm:h-4',
                            'max-sm:w-4'
                          )}
                        />
                      </div>
                    </div>
                    <div className={cn('flex-1', 'max-sm:flex-initial')}>
                      <h3 className={cn('section-title')}>
                        {t(`settings:sections.${section.id}.title`)}
                      </h3>
                      <p
                        className={cn(
                          'muted-text',
                          'text-sm',
                          'max-sm:text-xs'
                        )}
                      >
                        {t(`settings:sections.${section.id}.description`)}
                      </p>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'max-sm:flex',
                      'max-sm:w-full',
                      'max-sm:justify-end'
                    )}
                  >
                    {section.action}
                  </div>
                </div>
              </div>
            ))}
            <div
              className={cn(
                'card',
                'p-6',
                'transition-shadow duration-200 hover:shadow-md',
                'max-sm:rounded-lg',
                'max-sm:p-4'
              )}
            >
              <div
                className={cn(
                  'flex',
                  'items-center',
                  'justify-between',
                  'max-sm:flex-col',
                  'max-sm:items-start',
                  'max-sm:gap-3'
                )}
              >
                <div className={cn('flex', 'flex-1', 'items-center', 'gap-4')}>
                  <div>
                    <div
                      className={cn(
                        'bg-primary/10',
                        'dark:bg-dark-primary/10',
                        'text-primary',
                        'dark:text-dark-primary',
                        'rounded-lg',
                        'p-2',
                        'max-sm:rounded-md',
                        'max-sm:p-1.5'
                      )}
                    >
                      <svg
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          d='M12 2L13.545 8.455L20 10.001L13.545 11.546L12 18L10.455 11.546L4 10.001L10.455 8.455L12 2Z'
                          fill='currentColor'
                        />
                      </svg>
                    </div>
                  </div>
                  <div className={cn('flex-1', 'max-sm:flex-initial')}>
                    <h3 className={cn('section-title')}>
                      {t('settings:holiday.title')}
                    </h3>
                    <p
                      className={cn('muted-text', 'text-sm', 'max-sm:text-xs')}
                    >
                      {t('settings:holiday.description')}
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    'max-sm:flex',
                    'max-sm:w-full',
                    'max-sm:justify-end'
                  )}
                >
                  <HolidayToggle />
                </div>
              </div>
            </div>
          </div>

          <div className={cn('card', 'mt-8', 'p-6')}>
            <h3 className={cn('section-title', 'mb-4')}>
              {t('settings:about.title')}
            </h3>
            <div
              className={cn(
                'grid',
                'grid-cols-1',
                'gap-4',
                'text-sm',
                'md:grid-cols-3'
              )}
            >
              <div>
                <p className={cn('muted-text', 'mb-1')}>
                  {t('settings:about.version')}
                </p>
                <p
                  className={cn(
                    'text-text',
                    'dark:text-dark-text',
                    'font-medium'
                  )}
                >
                  1.0.0
                </p>
              </div>
              <div>
                <p className={cn('muted-text', 'mb-1')}>
                  {t('settings:about.license')}
                </p>
                <p
                  className={cn(
                    'text-text',
                    'dark:text-dark-text',
                    'font-medium'
                  )}
                >
                  MIT
                </p>
              </div>
              <div>
                <p className={cn('muted-text', 'mb-1')}>
                  {t('settings:about.support')}
                </p>
                <p
                  className={cn(
                    'text-text',
                    'dark:text-dark-text',
                    'font-medium'
                  )}
                >
                  {t('settings:about.supportEmail')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
