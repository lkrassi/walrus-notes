import { cn } from 'shared/lib/cn';
import { Skeleton } from 'shared/ui/components/Skeleton';

const BrandSkeleton = () => {
  return (
    <div className={cn('flex', 'items-center', 'gap-2')}>
      <Skeleton className='h-24 w-24 rounded-full md:h-28 md:w-28' />
      <div className={cn('flex', 'items-baseline', 'gap-2')}>
        <Skeleton className='h-7 w-20' />
        <Skeleton className='h-7 w-16' />
      </div>
    </div>
  );
};

const PublicHeaderSkeleton = () => {
  return (
    <header
      className={cn(
        'dark:bg-dark-bg',
        'border-border dark:border-dark-border',
        'flex flex-col items-center gap-4 border-b',
        'max-md:py-5',
        'md:flex-row md:items-center md:justify-between md:px-5'
      )}
    >
      <BrandSkeleton />
      <div className='flex items-center gap-2'>
        <Skeleton className='h-9 w-14 rounded-lg sm:w-16' />
        <Skeleton className='h-9 w-14 rounded-lg sm:w-16' />
      </div>
    </header>
  );
};

const PrivateHeaderSkeleton = ({
  showMobileMenu = false,
}: {
  showMobileMenu?: boolean;
}) => {
  return (
    <header
      className={cn(
        'dark:bg-dark-bg',
        'border-border dark:border-dark-border',
        'flex flex-col gap-3 border-b',
        'max-md:py-5',
        'md:px-5'
      )}
    >
      <div className={cn('flex items-center justify-between px-4 md:px-0')}>
        <div className='flex items-center'>
          {showMobileMenu && (
            <Skeleton className='mr-2 h-10 w-10 rounded-lg md:hidden' />
          )}
          <BrandSkeleton />
        </div>
      </div>
    </header>
  );
};

export const MainPageSkeleton = () => {
  return (
    <div className={cn('bg-bg dark:bg-dark-bg', 'min-h-screen')}>
      <PublicHeaderSkeleton />
      <main className={cn('flex min-h-[80vh] items-center justify-center')}>
        <div
          className={cn(
            'w-full',
            'mx-40 max-lg:m-10',
            'flex flex-col items-start gap-12',
            'lg:flex-row lg:items-center lg:gap-16'
          )}
        >
          <section className='min-w-0 flex-1 text-left max-lg:w-full max-lg:text-center'>
            <Skeleton className='mb-4 h-14 w-full max-lg:mx-auto' />
            <Skeleton className='mb-8 h-14 w-4/5 max-lg:mx-auto' />
            <Skeleton className='mb-3 h-6 w-full max-lg:mx-auto' />
            <Skeleton className='mb-3 h-6 w-full max-lg:mx-auto' />
            <Skeleton className='mb-3 h-6 w-11/12 max-lg:mx-auto' />
            <Skeleton className='h-12 w-40 rounded-lg max-lg:mx-auto' />
          </section>

          <section className='min-w-0 flex-1 max-lg:w-full'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'border-border dark:border-dark-border rounded-xl border p-4'
                  )}
                >
                  <Skeleton className='mb-3 h-10 w-10 rounded-lg' />
                  <Skeleton className='mb-3 h-5 w-3/5' />
                  <Skeleton className='mb-2 h-4 w-full' />
                  <Skeleton className='h-4 w-4/5' />
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export const AuthPageSkeleton = () => {
  return (
    <div className={cn('bg-bg dark:bg-dark-bg', 'min-h-screen')}>
      <PublicHeaderSkeleton />
      <main className='flex min-h-[80vh] items-center justify-center px-4 py-10'>
        <div className='w-full max-w-md space-y-4'>
          <div className='mb-8 flex gap-x-5 p-2 max-sm:flex-col max-sm:gap-y-5'>
            <Skeleton className='h-11 flex-1 rounded-xl' />
            <Skeleton className='h-11 flex-1 rounded-xl' />
          </div>
          <div
            className={cn(
              'border-border dark:border-dark-border rounded-2xl border p-6 md:p-8'
            )}
          >
            <Skeleton className='mx-auto mb-6 h-10 w-64 max-w-full' />
            <Skeleton className='mb-4 h-14 w-full' />
            <Skeleton className='mb-4 h-14 w-full' />
            <div className='my-15'></div>
            <Skeleton className='h-12 w-full rounded-xl' />
            <Skeleton className='mx-auto mt-5 h-5 w-36' />
          </div>
        </div>
      </main>
    </div>
  );
};

export const ApplyPageSkeleton = () => {
  return (
    <div
      className={cn(
        'bg-bg dark:bg-dark-bg',
        'flex min-h-screen items-center justify-center px-4'
      )}
    >
      <div
        className={cn(
          'border-border dark:border-dark-border w-full max-w-md rounded-lg border p-6'
        )}
      >
        <Skeleton className='mx-auto mb-4 h-12 w-12 rounded-full' />
        <Skeleton className='mx-auto mb-2 h-6 w-56 max-w-full' />
        <Skeleton className='mx-auto h-4 w-64 max-w-full' />
      </div>
    </div>
  );
};

export const DashboardPageSkeleton = () => {
  return (
    <div className={cn('bg-bg dark:bg-dark-bg', 'flex h-screen flex-col')}>
      <PrivateHeaderSkeleton showMobileMenu />

      <div className='hidden min-h-0 flex-1 md:flex'>
        <aside
          className={cn(
            'border-border dark:border-dark-border',
            'w-67.5 border-r'
          )}
        >
          <div className='border-border dark:border-dark-border border-b px-4 pt-5 pb-4'>
            <Skeleton className='mb-3 h-8 w-3/4' />
            <Skeleton className='h-9 w-full rounded-lg' />
          </div>

          <div className='p-2'>
            <Skeleton className='mb-2 h-9 w-full rounded-lg' />
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className='mb-2 h-8 w-full rounded-md' />
            ))}
          </div>

          <div className='border-border dark:border-dark-border mt-auto border-t p-4'>
            <div className='flex items-center gap-3'>
              <Skeleton className='h-9 w-9 rounded-full' />
              <Skeleton className='h-4 w-20' />
            </div>
          </div>
        </aside>

        <main className='flex min-h-0 flex-1 flex-col'>
          <div className='border-border dark:border-dark-border flex h-12 items-center gap-2 border-b px-3'>
            <Skeleton className='h-8 w-28 rounded-md' />
            <Skeleton className='h-8 w-28 rounded-md' />
            <Skeleton className='h-8 w-20 rounded-md' />
          </div>

          <div className='flex min-h-0 flex-1'>
            <div className='flex min-h-0 flex-1 flex-col p-4'>
              <Skeleton className='mb-8 h-6 w-24' />
              <Skeleton className='h-6 w-48' />
            </div>

            <aside className='hidden w-95 p-4 xl:block'>
              <div className='mb-4 flex justify-end gap-2'>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className='h-9 w-14 rounded-lg' />
                ))}
              </div>
              <div className='space-y-2'>
                <Skeleton className='h-8 w-full rounded-lg' />
                <Skeleton className='h-8 w-full rounded-lg' />
              </div>
            </aside>
          </div>
        </main>
      </div>

      <div className='min-h-0 flex-1 md:hidden'>
        <div className='h-full overflow-y-auto p-4'>
          <div className='mx-auto flex max-w-2xl flex-col items-center py-8'>
            <div className='mb-8 w-full'>
              <Skeleton className='h-14 w-full rounded-xl' />
            </div>

            <div className='mb-8 text-center'>
              <Skeleton className='mx-auto mb-3 h-8 w-40' />
              <Skeleton className='mx-auto h-4 w-28' />
            </div>

            <div className='grid w-full grid-cols-1 gap-4 sm:grid-cols-2'>
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'border-border dark:border-dark-border rounded-xl border p-4'
                  )}
                >
                  <Skeleton className='mb-3 h-10 w-10 rounded-lg' />
                  <Skeleton className='mb-2 h-5 w-3/4' />
                  <Skeleton className='h-4 w-full' />
                </div>
              ))}
            </div>

            <Skeleton className='mt-8 h-12 w-48 rounded-lg' />
          </div>
        </div>
      </div>
    </div>
  );
};

export const SettingsPageSkeleton = () => {
  return (
    <div className={cn('bg-bg dark:bg-dark-bg', 'min-h-screen')}>
      <PrivateHeaderSkeleton />
      <main className='container mx-auto max-w-4xl px-4 py-8'>
        <div
          className={cn(
            'border-border dark:border-dark-border mb-6 rounded-xl border p-6'
          )}
        >
          <div className='flex items-center gap-4'>
            <Skeleton className='h-16 w-16 rounded-full' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-6 w-48' />
              <Skeleton className='h-4 w-64 max-w-full' />
            </div>
          </div>
        </div>

        <div className='space-y-4'>
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'border-border dark:border-dark-border rounded-xl border p-6'
              )}
            >
              <div className='flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start max-sm:gap-3'>
                <div className='flex flex-1 items-center gap-4'>
                  <Skeleton className='h-10 w-10 rounded-lg' />
                  <div className='flex-1 space-y-2'>
                    <Skeleton className='h-5 w-44 max-w-full' />
                    <Skeleton className='h-4 w-3/4' />
                  </div>
                </div>
                <Skeleton className='h-10 w-24 rounded-lg max-sm:ml-auto' />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export const NotFoundPageSkeleton = () => {
  return (
    <div className={cn('bg-bg dark:bg-dark-bg', 'min-h-screen')}>
      <PublicHeaderSkeleton />
      <main className='flex min-h-[80vh] items-center justify-center px-4'>
        <div className='w-full max-w-2xl text-center'>
          <Skeleton className='mx-auto mb-4 h-24 w-48 max-w-full' />
          <Skeleton className='mx-auto mb-4 h-9 w-96 max-w-full' />
          <Skeleton className='mx-auto mb-2 h-5 w-full max-w-2xl' />
          <Skeleton className='mx-auto mb-8 h-5 w-5/6 max-w-2xl' />
          <div className='mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row'>
            <Skeleton className='h-12 w-60 rounded-xl' />
            <Skeleton className='h-12 w-60 rounded-xl' />
          </div>
          <Skeleton className='mx-auto h-20 w-full max-w-md rounded-xl' />
        </div>
      </main>
    </div>
  );
};
