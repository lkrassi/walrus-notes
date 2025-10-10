import { getMyLayouts } from 'features/layout/api';
import { useEffect, useState } from 'react';
import { Button } from 'shared';
import type { Layout } from 'shared/model/types/layouts';
import { useAppDispatch, useNotifications, useLocalization } from 'widgets';

export const LayoutList = () => {
  const { t } = useLocalization();
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useNotifications();
  const dispatch = useAppDispatch();

  const fetchLayouts = async () => {
    setIsLoading(true);
    try {
      const response = await getMyLayouts(dispatch);
      setLayouts(response.data.data || []);
      showSuccess(t('layout:layoutsLoadedSuccess'));
    } catch (err: any) {
      showError(t('layout:layoutsLoadError'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLayouts();
  }, []);

  const handleRefresh = () => {
    fetchLayouts();
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='border-primary h-8 w-8 animate-spin rounded-full border-b-2'></div>
        <span className='text-text dark:text-dark-text ml-3'>
          {t('layout:loadingLayouts')}
        </span>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-text dark:text-dark-text text-2xl font-bold'>
          {t('layout:myLayouts')}
        </h2>
        <Button
          onClick={handleRefresh}
          className='bg-btn-bg hover:bg-btn-hover px-4 py-2'
          disabled={isLoading}
        >
          {t('layout:refresh')}
        </Button>
      </div>

      {layouts.length === 0 ? (
        <div className='py-12 text-center'>
          <div className='mb-4 text-6xl'>📝</div>
          <h3 className='text-text dark:text-dark-text mb-2 text-xl font-semibold'>
            {t('layout:noLayoutsFound')}
          </h3>
          <p className='text-secondary dark:text-dark-secondary'>
            {t('layout:createFirstLayout')}
          </p>
        </div>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {layouts.map(layout => (
            <div
              key={layout.id}
              className='border-border dark:border-dark-border cursor-pointer rounded-xl border bg-white p-6 transition-shadow duration-200 hover:shadow-lg dark:bg-gray-800'
            >
              <h3 className='text-text dark:text-dark-text mb-2 text-lg font-semibold'>
                {layout.title}
              </h3>
              <div className='mt-4 flex gap-2'>
                <Button
                  className='bg-red-500 px-3 py-1 text-sm hover:bg-red-600'
                  onClick={() =>
                    showError(t('layout:backendNotImplemented'))
                  }
                >
                  {t('layout:delete')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
