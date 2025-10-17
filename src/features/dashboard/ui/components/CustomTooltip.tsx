import React from 'react';
import { Button } from 'shared';
import { useLocalization } from 'widgets/hooks/useLocalization';

export const CustomTooltip: React.FC<any> = ({
  continuous,
  index,
  step,
  backProps,
  primaryProps,
  skipProps,
  tooltipProps,
  size,
}) => {
  const { t } = useLocalization();

  return (
    <div
      {...tooltipProps}
      className='dark:bg-dark-bg border-border dark:border-dark-border max-w-sm rounded-xl border bg-white p-6 shadow-xl'
    >
      <div className='mb-6'>{step.content}</div>

      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          {index > 0 && (
            <Button
              {...backProps}
              variant='default'
              className='px-4 py-2 text-sm'
              title={t('common:onboarding:back')}
            >
              {t('common:onboarding:back')}
            </Button>
          )}
        </div>

        <div className='flex items-center gap-2'>
          {continuous && (
            <Button
              {...skipProps}
              variant='escape'
              className='px-4 py-2 text-sm'
              title={t('common:onboarding:skip')}
            >
              {t('common:onboarding:skip')}
            </Button>
          )}

          {continuous && index < size - 1 ? (
            <Button
              {...primaryProps}
              variant='submit'
              className='px-4 py-2 text-sm'
              title={t('common:onboarding:next')}
            >
              {t('common:onboarding:next')}
            </Button>
          ) : (
            <Button
              {...primaryProps}
              variant='submit'
              className='px-4 py-2 text-sm'
              title={t('common:onboarding:last')}
            >
              {t('common:onboarding:last')}
            </Button>
          )}
        </div>
      </div>

      <div className='mt-4'>
        <div className='mb-1 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400'>
          <span>Прогресс</span>
          <span>
            {index + 1} из {size}
          </span>
        </div>
        <div className='h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700'>
          <div
            className='bg-primary dark:bg-dark-primary h-2 rounded-full'
            style={{ width: `${((index + 1) / size) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
