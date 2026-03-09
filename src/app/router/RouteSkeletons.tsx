import { useTabs } from '@/entities';
import { cn } from '@/shared/lib/core';
import { useIsMobile } from '@/shared/lib/react/hooks';
import { Skeleton } from '@/shared/ui';

const BrandSkeleton = () => {
  return (
    <div className={cn('flex', 'items-center', 'gap-2')}>
      <Skeleton className='h-18 w-18 rounded-full' />
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
        'h-20',
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

export const FirstPageSkeleton = () => {
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

export const MainPageSkeleton = () => {
  const { openTabs } = useTabs();
  const isMobile = useIsMobile();
  const activeTab = openTabs.find(tab => tab.isActive) ?? null;

  const mainState: 'empty' | 'graph' | 'note' = !activeTab
    ? 'empty'
    : activeTab.item.type === 'note'
      ? 'note'
      : 'graph';

  const SidebarSkeleton = () => (
    <aside
      className={cn(
        'border-border dark:border-dark-border',
        'dark:bg-dark-bg flex h-full min-h-0 w-67.5 flex-col border-r bg-white'
      )}
    >
      <div className='px-4 pt-5 pb-4'>
        <div className='mb-3 flex items-center justify-between'>
          <Skeleton className='h-8 w-3/4' />
          <Skeleton className='h-6 w-6 rounded-sm' />
        </div>
        <div className='bg-border dark:bg-dark-border mb-3 h-px w-full' />
        <Skeleton className='h-9 w-full rounded-lg' />
      </div>

      <div className='min-h-0 flex-1 overflow-hidden p-2'>
        <Skeleton className='mb-2 h-9 w-full rounded-lg' />
        <Skeleton className='mb-3 h-8 w-full rounded-md' />
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className='mb-2 h-8 w-full rounded-md' />
        ))}
      </div>

      <div className='border-border dark:border-dark-border mt-auto border-t p-4'>
        <Skeleton className='mb-3 h-10 w-full rounded-lg' />
        <div className='flex items-center gap-3'>
          <Skeleton className='h-9 w-9 rounded-full' />
          <Skeleton className='h-4 w-20' />
        </div>
      </div>
    </aside>
  );

  const DesktopTabsSkeleton = () => (
    <div className='border-border dark:border-dark-border flex h-12 items-center gap-2 border-b px-3'>
      <Skeleton className='h-8 w-28 rounded-md' />
      <Skeleton className='h-8 w-24 rounded-md' />
      <Skeleton className='h-8 w-20 rounded-md' />
    </div>
  );

  const DesktopEmptyStateSkeleton = () => (
    <div className='flex h-full items-center justify-center'>
      <div className='text-center'>
        <Skeleton className='mx-auto mb-4 h-14 w-14 rounded-lg' />
        <Skeleton className='mx-auto mb-3 h-7 w-72 max-w-full' />
        <Skeleton className='mx-auto h-4 w-96 max-w-full' />
      </div>
    </div>
  );

  const GraphCanvasSkeleton = ({ mobile = false }: { mobile?: boolean }) => (
    <div className='relative h-full w-full overflow-hidden'>
      <div className='h-full w-full bg-[radial-gradient(circle,rgba(100,116,139,0.35)_1px,transparent_1px)] bg-size-[24px_24px]' />

      <Skeleton
        className={cn(
          'absolute rounded-xl',
          mobile
            ? 'top-1/2 left-1/2 h-18 w-45 -translate-x-1/2 -translate-y-1/2'
            : 'top-1/2 left-1/2 h-28 w-65 -translate-x-1/2 -translate-y-1/2'
        )}
      />

      <div className='absolute top-4 right-4'>
        <Skeleton className='h-8 w-18 rounded-md' />
      </div>

      <div className='absolute bottom-3 left-3 flex flex-col gap-2'>
        <Skeleton className='h-8 w-8 rounded-sm' />
        <Skeleton className='h-8 w-8 rounded-sm' />
        <Skeleton className='h-8 w-8 rounded-sm' />
      </div>

      <div className='absolute right-3 bottom-3'>
        <Skeleton className='h-24 w-40 rounded-md' />
      </div>
    </div>
  );

  const DesktopNoteStateSkeleton = () => (
    <div className='flex h-full flex-col'>
      <div className='px-3 py-3'>
        <div className='flex items-center justify-between gap-3'>
          <Skeleton className='h-6 w-28' />
          <div className='flex gap-2'>
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className='h-8 w-11 rounded-md' />
            ))}
          </div>
        </div>
        <div className='bg-border dark:bg-dark-border my-3 h-px w-full' />
        <div className='flex justify-end gap-2'>
          <Skeleton className='h-7 w-52 rounded-md' />
          <Skeleton className='h-7 w-52 rounded-md' />
        </div>
      </div>
      <div className='flex-1 space-y-1.5 overflow-hidden p-3'>
        {Array.from({ length: 18 }).map((_, index) => (
          <Skeleton key={index} className='h-4.5 w-full rounded-sm' />
        ))}
      </div>
    </div>
  );

  const MobileTabsSkeleton = ({ note = false }: { note?: boolean }) => (
    <div className='border-border dark:border-dark-border flex h-10 items-center gap-2 border-b px-2'>
      <Skeleton className='h-7 w-20 rounded-md' />
      {note && <Skeleton className='h-7 w-26 rounded-md' />}
      <Skeleton className='h-7 w-18 rounded-md' />
    </div>
  );

  const MobileEmptyStateSkeleton = () => (
    <div className='h-full overflow-y-auto p-4'>
      <div className='mx-auto flex max-w-2xl flex-col items-center py-8'>
        <div className='mb-8 w-full'>
          <Skeleton className='h-18 w-full rounded-xl' />
        </div>

        <div className='mb-8 text-center'>
          <Skeleton className='mx-auto mb-3 h-8 w-40' />
          <Skeleton className='mx-auto h-4 w-24' />
        </div>

        <div className='grid w-full grid-cols-1 gap-4 sm:grid-cols-2'>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'border-border dark:border-dark-border rounded-xl border p-4'
              )}
            >
              <div className='mb-3 flex items-center justify-between'>
                <Skeleton className='h-5 w-20' />
                <div className='flex gap-1'>
                  <Skeleton className='h-5 w-5 rounded-sm' />
                  <Skeleton className='h-5 w-5 rounded-sm' />
                </div>
              </div>
              <Skeleton className='h-4 w-18' />
            </div>
          ))}
        </div>

        <Skeleton className='mt-8 h-12 w-42 rounded-lg' />
      </div>
    </div>
  );

  const MobileNoteStateSkeleton = () => (
    <div className='flex h-full flex-col'>
      <MobileTabsSkeleton note />
      <div className='px-3 py-2'>
        <Skeleton className='mx-auto mb-2 h-5 w-24' />
        <div className='mb-2 flex justify-center gap-2'>
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className='h-7 w-9 rounded-md' />
          ))}
        </div>
        <div className='bg-border dark:bg-dark-border my-2 h-px w-full' />
        <div className='flex justify-center gap-2'>
          <Skeleton className='h-7 w-32 rounded-md' />
          <Skeleton className='h-7 w-32 rounded-md' />
        </div>
      </div>

      <div className='flex-1 space-y-1.5 overflow-hidden p-3'>
        {Array.from({ length: 12 }).map((_, index) => (
          <Skeleton key={index} className='h-4 w-full rounded-sm' />
        ))}
      </div>
    </div>
  );

  return (
    <div className={cn('bg-bg dark:bg-dark-bg', 'flex h-screen flex-col')}>
      <PrivateHeaderSkeleton showMobileMenu />

      {isMobile ? (
        <div className='min-h-0 flex-1'>
          {mainState === 'empty' && <MobileEmptyStateSkeleton />}
          {mainState === 'graph' && (
            <div className='flex h-full flex-col'>
              <MobileTabsSkeleton />
              <div className='min-h-0 flex-1'>
                <GraphCanvasSkeleton mobile />
              </div>
            </div>
          )}
          {mainState === 'note' && <MobileNoteStateSkeleton />}
        </div>
      ) : (
        <div className='hidden min-h-0 flex-1 md:flex'>
          <SidebarSkeleton />

          <main className='flex min-h-0 flex-1 flex-col'>
            {mainState !== 'empty' && <DesktopTabsSkeleton />}
            <div className='min-h-0 flex-1'>
              {mainState === 'empty' && <DesktopEmptyStateSkeleton />}
              {mainState === 'graph' && <GraphCanvasSkeleton />}
              {mainState === 'note' && <DesktopNoteStateSkeleton />}
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export const DashboardPageSkeleton = () => {
  return (
    <div className={cn('bg-bg dark:bg-dark-bg min-h-screen')}>
      <PrivateHeaderSkeleton showMobileMenu />

      <main className={cn('mx-auto w-full max-w-6xl p-4 md:p-8')}>
        <div className={cn('grid gap-6 xl:grid-cols-2')}>
          {Array.from({ length: 2 }).map((_, columnIndex) => (
            <section
              key={columnIndex}
              className={cn(
                'border-border dark:border-dark-border dark:bg-dark-bg rounded-2xl border bg-white p-4 md:p-5'
              )}
            >
              <Skeleton className='mb-4 h-6 w-52 max-w-full' />

              <div className={cn('space-y-3')}>
                {Array.from({ length: 3 }).map((__, cardIndex) => (
                  <div
                    key={cardIndex}
                    className={cn(
                      'border-border dark:border-dark-border dark:bg-dark-bg/60 rounded-xl border bg-white/80 p-4'
                    )}
                  >
                    <div
                      className={cn('mb-3 flex items-center justify-between')}
                    >
                      <Skeleton className='h-5 w-24' />
                      {columnIndex === 1 && (
                        <Skeleton className='h-6 w-16 rounded-md' />
                      )}
                    </div>

                    <div
                      className={cn(
                        'mb-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40'
                      )}
                    >
                      <Skeleton className='mb-2 h-3 w-24' />
                      <Skeleton className='h-4 w-full' />
                    </div>

                    <div className={cn('mb-3 flex min-h-7 flex-wrap gap-2')}>
                      <Skeleton className='h-6 w-20 rounded-full' />
                      <Skeleton className='h-6 w-24 rounded-full' />
                    </div>

                    {columnIndex === 1 && (
                      <>
                        <div
                          className={cn(
                            'grid grid-cols-1 gap-2 sm:grid-cols-3'
                          )}
                        >
                          <Skeleton className='h-10 w-full rounded-lg' />
                          <Skeleton className='h-10 w-full rounded-lg' />
                          <Skeleton className='h-10 w-full rounded-lg' />
                        </div>
                        <div className={cn('mt-3 flex justify-end')}>
                          <Skeleton className='h-8 w-20 rounded-md' />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
};

export const SettingsPageSkeleton = () => {
  return (
    <div className={cn('bg-bg dark:bg-dark-bg', 'min-h-screen')}>
      <PrivateHeaderSkeleton />
      <main className='container mx-auto px-4 py-8'>
        <div className='mx-auto max-w-7xl'>
          <div className='grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]'>
            <aside className={cn('card p-6', 'max-sm:rounded-lg max-sm:p-4')}>
              <div className='flex items-center gap-x-10'>
                <div className='relative'>
                  <Skeleton className='h-16 w-16 rounded-full max-sm:h-12 max-sm:w-12' />
                  <Skeleton className='absolute right-0 bottom-0 h-6 w-6 rounded-full' />
                </div>
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-6 w-40 max-sm:h-5 max-sm:w-32' />
                  <Skeleton className='h-4 w-48 max-w-full max-sm:h-3.5 max-sm:w-36' />
                </div>
              </div>
            </aside>

            <div className='grid grid-cols-1 gap-4 max-sm:gap-3 md:grid-cols-2'>
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'card flex h-full p-6',
                    'max-sm:rounded-lg max-sm:p-4'
                  )}
                >
                  <div className='flex w-full items-center justify-between max-sm:flex-col max-sm:items-start max-sm:gap-3'>
                    <div className='flex flex-1 items-center gap-4 max-sm:w-full'>
                      <Skeleton className='h-10 w-10 rounded-lg max-sm:h-8 max-sm:w-8 max-sm:rounded-md' />
                      <div className='flex-1 space-y-2'>
                        <Skeleton className='h-5 w-40 max-w-full max-sm:h-4 max-sm:w-32' />
                        <Skeleton className='h-4 w-3/4 max-sm:h-3.5' />
                      </div>
                    </div>
                    <div className='max-sm:flex max-sm:w-full max-sm:justify-end'>
                      <Skeleton className='h-10 w-24 rounded-lg max-sm:h-9 max-sm:w-22' />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export const UnavailablePageSkeleton = () => {
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
