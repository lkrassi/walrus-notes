import { Link } from 'react-router-dom';
import { Button } from 'shared';
import { PublicHeader } from 'widgets';
import { useLocalization } from 'widgets/hooks';

export const NotFound = () => {
  const { t } = useLocalization();

  return (
    <div className='flex min-h-screen flex-col'>
      <PublicHeader />
      <div className='bg-bg dark:bg-dark-bg text-text dark:text-dark-text flex flex-1 items-center justify-center p-4'>
        <div className='mx-auto max-w-2xl text-center'>
          <div className='relative mb-8'>
            <div className='text-primary dark:text-dark-primary absolute inset-0 flex items-center justify-center text-9xl font-bold opacity-10'>
              404
            </div>
            <div className='relative'>
              <h1 className='from-primary to-primary-gradient dark:from-dark-primary dark:to-dark-primary-gradient mb-4 bg-gradient-to-br bg-clip-text text-8xl font-bold text-transparent'>
                404
              </h1>
            </div>
          </div>

          <h2 className='text-text dark:text-dark-text mb-4 text-3xl font-bold'>
            {t('common:notFound.title')}
          </h2>

          <p className='text-secondary dark:text-dark-secondary mx-auto mb-8 max-w-md text-lg leading-relaxed'>
            {t('common:notFound.description')}
          </p>

          <div className='mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row'>
            <Link to='/dashboard'>
              <Button variant='default' className='w-60 px-8 py-3'>
                {t('common:notFound.goHome')}
              </Button>
            </Link>

            <Button
              onClick={() => window.history.back()}
              variant='submit'
              className='w-60 px-8 py-3'
            >
              {t('common:notFound.goBack')}
            </Button>
          </div>

          <div className='border-border dark:border-dark-border bg-bg dark:bg-dark-bg text-secondary dark:text-dark-secondary mx-auto max-w-md rounded-lg border p-4 text-sm'>
            <p>{t('common:notFound.helpText')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
