import React from 'react';
import { PrivateHeader } from 'widgets/ui';
import { settingsSections } from '../../models/variants';
import { useLocalization } from 'widgets/hooks';

export const Settings: React.FC = () => {
  const { t } = useLocalization();

  return (
    <div className='bg-bg dark:bg-dark-bg min-h-screen'>
      <PrivateHeader />

      <main className='container mx-auto px-4 py-8'>
        <div className='mx-auto max-w-4xl'>
          <div className='dark:bg-dark-bg border-border dark:border-dark-border mb-8 rounded-2xl border bg-white p-6 shadow-sm'>
            <div className='flex items-center gap-4'>
              <div>
                <h2 className='text-text dark:text-dark-text mb-1 text-xl font-semibold'>
                  {t('settings:welcome.title')}
                </h2>
                <p className='text-secondary dark:text-dark-secondary'>
                  {t('settings:welcome.subtitle')}
                </p>
              </div>
            </div>
          </div>

          <div className='space-y-4'>
            {settingsSections.map(section => (
              <div
                key={section.title}
                className='dark:bg-dark-bg border-border dark:border-dark-border rounded-xl border bg-white p-6 transition-shadow duration-200 hover:shadow-md'
              >
                <div className='flex items-center justify-between'>
                  <div className='flex flex-1 items-center gap-4'>
                    <div>
                      <div className='bg-primary/10 dark:bg-dark-primary/10 text-primary dark:text-dark-primary rounded-lg p-2'>
                        <section.icon className='h-5 w-5' />
                      </div>
                    </div>
                    <div className='flex-1'>
                      <h3 className='text-text dark:text-dark-text mb-1 text-lg font-semibold'>
                        {t(`settings:sections.${section.id}.title`)}
                      </h3>
                      <p className='text-secondary dark:text-dark-secondary text-sm'>
                        {t(`settings:sections.${section.id}.description`)}
                      </p>
                    </div>
                  </div>
                  <div>{section.action}</div>
                </div>
              </div>
            ))}
          </div>

          <div className='dark:bg-dark-bg border-border dark:border-dark-border mt-8 rounded-2xl border bg-white p-6'>
            <h3 className='text-text dark:text-dark-text mb-4 text-lg font-semibold'>
              {t('settings:about.title')}
            </h3>
            <div className='grid grid-cols-1 gap-4 text-sm md:grid-cols-3'>
              <div>
                <p className='text-secondary dark:text-dark-secondary mb-1'>
                  {t('settings:about.version')}
                </p>
                <p className='text-text dark:text-dark-text font-medium'>
                  1.0.0
                </p>
              </div>
              <div>
                <p className='text-secondary dark:text-dark-secondary mb-1'>
                  {t('settings:about.license')}
                </p>
                <p className='text-text dark:text-dark-text font-medium'>MIT</p>
              </div>
              <div>
                <p className='text-secondary dark:text-dark-secondary mb-1'>
                  {t('settings:about.support')}
                </p>
                <p className='text-text dark:text-dark-text font-medium'>
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
