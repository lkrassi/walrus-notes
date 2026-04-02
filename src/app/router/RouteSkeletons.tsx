import { useTabs } from '@/entities';
import { cn } from '@/shared/lib/core';
import { useIsMobile } from '@/shared/lib/react/hooks';
import { Skeleton } from '@/shared/ui';

const BrandSkeleton = () => {
  return (
    <div className={cn('flex', 'items-center', 'gap-2', 'ml-5')}>
      <Skeleton className='h-16 w-16 rounded-none' />
      <div className={cn('flex', 'items-baseline', 'gap-2')}>
        <Skeleton className='h-7 w-20 rounded-none' />
        <Skeleton className='h-7 w-16 rounded-none' />
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
        <Skeleton className='h-9 w-14 rounded-none sm:w-16' />
        <Skeleton className='h-9 w-14 rounded-none sm:w-16' />
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
        'md:px-2'
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
      <main
        className={cn(
          'flex min-h-[80vh] items-center justify-center px-4 py-10'
        )}
      >
        <div
          className={cn(
            'w-full',
            'mx-40 max-lg:m-0 max-lg:mx-auto max-lg:max-w-5xl',
            'flex flex-col items-start gap-12',
            'lg:flex-row lg:items-center lg:gap-16'
          )}
        >
          <section className='min-w-0 flex-1 text-left max-lg:w-full max-lg:text-center'>
            <Skeleton className='mb-4 h-16 w-full rounded-none max-lg:mx-auto' />
            <Skeleton className='mb-8 h-16 w-4/5 rounded-none max-lg:mx-auto' />
            <Skeleton className='mb-3 h-6 w-full rounded-none max-lg:mx-auto' />
            <Skeleton className='mb-3 h-6 w-full rounded-none max-lg:mx-auto' />
            <Skeleton className='mb-3 h-6 w-11/12 rounded-none max-lg:mx-auto' />
            <Skeleton className='h-12 w-44 rounded-none max-lg:mx-auto' />
          </section>

          <section className='min-w-0 flex-1 max-lg:w-full'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'border-border dark:border-dark-border border p-4'
                  )}
                >
                  <Skeleton className='mb-3 h-10 w-10 rounded-none' />
                  <Skeleton className='mb-3 h-5 w-3/5 rounded-none' />
                  <Skeleton className='mb-2 h-4 w-full rounded-none' />
                  <Skeleton className='h-4 w-4/5 rounded-none' />
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
            <Skeleton className='h-11 flex-1 rounded-none' />
            <Skeleton className='h-11 flex-1 rounded-none' />
          </div>
          <div
            className={cn(
              'border-border dark:border-dark-border border p-6 md:p-8'
            )}
          >
            <Skeleton className='mx-auto mb-6 h-10 w-64 max-w-full rounded-none' />
            <Skeleton className='mb-3 h-4 w-16 rounded-none' />
            <Skeleton className='mb-4 h-14 w-full rounded-none' />
            <Skeleton className='mb-3 h-4 w-14 rounded-none' />
            <Skeleton className='mb-4 h-14 w-full rounded-none' />
            <Skeleton className='h-12 w-full rounded-none' />
            <Skeleton className='mx-auto mt-5 h-5 w-36 rounded-none' />
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

  const MainHeaderSkeleton = () => (
    <header
      className={cn(
        'bg-bg dark:bg-dark-bg',
        'border-border dark:border-dark-border',
        'flex h-20 items-center justify-between border-b px-4 md:px-5'
      )}
    >
      <div className='flex items-center gap-2 md:gap-3'>
        <Skeleton className='h-10 w-10 rounded-none md:hidden' />
        <div className='flex items-center gap-2'>
          <Skeleton className='h-14 w-14 rounded-none md:h-18 md:w-18' />
          <div className='flex items-baseline gap-1'>
            <Skeleton className='h-6 w-24 rounded-none' />
            <Skeleton className='h-6 w-18 rounded-none' />
          </div>
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <Skeleton className='h-9 w-14 rounded-none sm:w-16' />
        <Skeleton className='h-9 w-14 rounded-none sm:w-16' />
      </div>
    </header>
  );

  const SidebarSkeleton = () => (
    <aside
      className={cn(
        'border-border dark:border-dark-border',
        'dark:bg-dark-bg flex h-full min-h-0 w-67.5 flex-col border-r bg-white'
      )}
    >
      <div className='border-border dark:border-dark-border border-b px-4 pt-5 pb-4'>
        <div className='mb-3 flex items-center justify-between gap-3'>
          <div className='flex min-w-0 items-center gap-3'>
            <Skeleton className='h-8 w-8 rounded-none' />
            <div className='min-w-0 space-y-1'>
              <Skeleton className='h-5 w-32 max-w-full rounded-none' />
              <Skeleton className='h-4 w-24 max-w-full rounded-none' />
            </div>
          </div>
          <Skeleton className='h-6 w-6 rounded-none' />
        </div>

        <Skeleton className='h-9 w-full rounded-none' />
        <Skeleton className='mt-3 h-9 w-full rounded-none' />
      </div>

      <div className='min-h-0 flex-1 overflow-hidden p-2'>
        <div className='bg-surface dark:bg-dark-surface mb-3 flex items-center gap-2 px-3 py-2'>
          <Skeleton className='h-4 w-4 rounded-none' />
          <Skeleton className='h-4 w-28 rounded-none' />
        </div>

        <div className='bg-surface dark:bg-dark-surface mb-3 flex items-center gap-2 px-3 py-2'>
          <Skeleton className='h-4 w-4 rounded-none' />
          <Skeleton className='h-4 w-20 rounded-none' />
        </div>

        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className='mb-2 flex items-center gap-2 px-3 py-2'>
            <Skeleton className='h-4 w-4 rounded-none' />
            <Skeleton className='h-4 w-full max-w-[60%] rounded-none' />
          </div>
        ))}

        <Skeleton className='mt-2 h-4 w-24 rounded-none' />
      </div>

      <div className='border-border dark:border-dark-border mt-auto border-t p-4'>
        <Skeleton className='mb-3 h-10 w-full rounded-none' />
        <div className='flex items-center gap-3'>
          <Skeleton className='h-9 w-9 rounded-none' />
          <Skeleton className='h-4 w-20 rounded-none' />
        </div>
      </div>
    </aside>
  );

  const DesktopTabsSkeleton = () => (
    <div className='border-border dark:border-dark-border flex h-12 items-center gap-2 overflow-hidden border-b px-3'>
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn(
            'h-8 rounded-none',
            index === 0
              ? 'bg-primary/25 dark:bg-primary/35 w-28'
              : index === 1
                ? 'w-24'
                : index === 2
                  ? 'w-20'
                  : index === 3
                    ? 'w-26'
                    : index === 4
                      ? 'w-18'
                      : 'w-22'
          )}
        />
      ))}
    </div>
  );

  const DesktopEmptyStateSkeleton = () => (
    <div className='flex h-full items-center justify-center'>
      <div className='text-center'>
        <Skeleton className='mx-auto mb-4 h-14 w-14 rounded-none' />
        <Skeleton className='mx-auto mb-3 h-7 w-72 max-w-full rounded-none' />
        <Skeleton className='mx-auto h-4 w-96 max-w-full rounded-none' />
      </div>
    </div>
  );

  const GraphCanvasSkeleton = ({ mobile = false }: { mobile?: boolean }) => (
    <div className='relative h-full w-full overflow-hidden'>
      <div className='h-full w-full bg-[radial-gradient(circle,rgba(100,116,139,0.35)_1px,transparent_1px)] bg-size-[24px_24px]' />

      <Skeleton
        className={cn(
          'absolute rounded-none',
          mobile
            ? 'top-1/2 left-1/2 h-18 w-45 -translate-x-1/2 -translate-y-1/2'
            : 'top-1/2 left-1/2 h-28 w-65 -translate-x-1/2 -translate-y-1/2'
        )}
      />

      <div className='absolute top-4 right-4'>
        <Skeleton className='h-8 w-18 rounded-none' />
      </div>

      <div className='absolute bottom-3 left-3 flex flex-col gap-2'>
        <Skeleton className='h-8 w-8 rounded-none' />
        <Skeleton className='h-8 w-8 rounded-none' />
        <Skeleton className='h-8 w-8 rounded-none' />
      </div>

      <div className='absolute right-3 bottom-3'>
        <Skeleton className='h-24 w-40 rounded-none' />
      </div>
    </div>
  );

  const NoteHeaderSkeleton = ({ compact = false }: { compact?: boolean }) => (
    <div className='border-border dark:border-dark-border border-b px-4 py-3 md:px-5'>
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <Skeleton className='h-6 w-40 max-w-full rounded-none' />

        <div className='flex flex-wrap items-center gap-2 md:justify-end'>
          {Array.from({ length: compact ? 5 : 6 }).map((_, index) => (
            <Skeleton key={index} className='h-8 w-11 rounded-none' />
          ))}
        </div>
      </div>
    </div>
  );

  const NoteViewerSkeleton = ({ mobile = false }: { mobile?: boolean }) => (
    <div className='relative h-full min-h-0 overflow-hidden p-4 md:p-5'>
      <div
        className={cn(
          'pointer-events-none flex gap-2',
          mobile ? 'mb-4 flex-wrap' : 'absolute top-4 right-4 z-10'
        )}
      >
        <Skeleton className='h-8 w-44 rounded-none' />
        <Skeleton className='h-8 w-44 rounded-none' />
      </div>

      <div className={cn('space-y-3', mobile ? 'pt-1' : 'pt-14')}>
        {Array.from({ length: mobile ? 10 : 12 }).map((_, index) => (
          <Skeleton
            key={index}
            className={cn(
              'h-4 rounded-none',
              index === 0
                ? 'h-6 w-1/3'
                : index === 2
                  ? 'w-11/12'
                  : index === 3
                    ? 'w-10/12'
                    : index === 5
                      ? 'w-9/12'
                      : index === 6
                        ? 'w-11/12'
                        : index === 7
                          ? 'w-8/12'
                          : index === 9
                            ? 'mt-4 w-5/6'
                            : index === 10
                              ? 'w-4/5'
                              : 'w-full'
            )}
          />
        ))}
      </div>
    </div>
  );

  const DesktopNoteStateSkeleton = () => (
    <div className='flex h-full min-h-0 flex-col'>
      <NoteHeaderSkeleton />
      <div className='min-h-0 flex-1'>
        <NoteViewerSkeleton />
      </div>
    </div>
  );

  const MobileTabsSkeleton = ({ note = false }: { note?: boolean }) => (
    <div className='border-border dark:border-dark-border flex h-10 items-center gap-2 overflow-hidden border-b px-2'>
      <Skeleton className='h-7 w-20 rounded-none' />
      {note && <Skeleton className='h-7 w-26 rounded-none' />}
      <Skeleton className='h-7 w-18 rounded-none' />
      <Skeleton className='h-7 w-24 rounded-none' />
    </div>
  );

  const MobileEmptyStateSkeleton = () => (
    <div className='h-full overflow-y-auto p-4'>
      <div className='mx-auto flex max-w-2xl flex-col items-center py-8'>
        <div className='mb-8 w-full'>
          <Skeleton className='h-18 w-full rounded-none' />
        </div>

        <div className='mb-8 text-center'>
          <Skeleton className='mx-auto mb-3 h-8 w-40 rounded-none' />
          <Skeleton className='mx-auto h-4 w-24 rounded-none' />
        </div>

        <div className='grid w-full grid-cols-1 gap-4 sm:grid-cols-2'>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className='border-border dark:border-dark-border border p-4'
            >
              <div className='mb-3 flex items-center justify-between'>
                <Skeleton className='h-5 w-20 rounded-none' />
                <div className='flex gap-1'>
                  <Skeleton className='h-5 w-5 rounded-none' />
                  <Skeleton className='h-5 w-5 rounded-none' />
                </div>
              </div>
              <Skeleton className='h-4 w-18 rounded-none' />
            </div>
          ))}
        </div>

        <Skeleton className='mt-8 h-12 w-42 rounded-none' />
      </div>
    </div>
  );

  const MobileNoteStateSkeleton = () => (
    <div className='flex h-full flex-col'>
      <MobileTabsSkeleton note />
      <NoteHeaderSkeleton compact />
      <div className='min-h-0 flex-1'>
        <NoteViewerSkeleton mobile />
      </div>
    </div>
  );

  return (
    <div className={cn('bg-bg dark:bg-dark-bg', 'flex h-screen flex-col')}>
      <MainHeaderSkeleton />

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
    <div className={cn('bg-bg dark:bg-dark-bg', 'min-h-screen')}>
      <PrivateHeaderSkeleton showMobileMenu />

      <main className={cn('mx-auto w-full max-w-6xl p-4 md:p-8')}>
        <div className={cn('grid gap-6 xl:grid-cols-2')}>
          {Array.from({ length: 2 }).map((_, columnIndex) => (
            <section
              key={columnIndex}
              className={cn(
                'border-border dark:border-dark-border dark:bg-dark-bg/80 rounded-none border bg-white p-5'
              )}
            >
              <div className='mb-4 flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-8 w-8 rounded-none' />
                  <Skeleton className='h-5 w-44 max-w-full rounded-none' />
                </div>
                <Skeleton className='h-5 w-6 rounded-full' />
              </div>

              <div className='space-y-3'>
                {Array.from({ length: columnIndex === 0 ? 2 : 1 }).map(
                  (_, cardIndex) => (
                    <div
                      key={cardIndex}
                      className={cn(
                        'border-border dark:border-dark-border dark:bg-dark-bg/60 rounded-none border bg-white/80 p-4'
                      )}
                    >
                      <div className='mb-4 flex items-start justify-between gap-3'>
                        <div className='flex items-center gap-2'>
                          <Skeleton className='h-4 w-4 rounded-none' />
                          <Skeleton className='h-4 w-20 rounded-none' />
                        </div>
                        <Skeleton className='h-8 w-24 rounded-none' />
                      </div>

                      <div className='border-border mb-4 rounded-none border bg-gray-50 p-3 dark:bg-gray-900/40'>
                        <Skeleton className='mb-2 h-3 w-24 rounded-none' />
                        <Skeleton className='h-4 w-3/5 rounded-none' />
                      </div>

                      <div className='mb-4 flex items-center gap-3'>
                        <Skeleton className='h-10 w-10 rounded-none' />
                        <div className='space-y-2'>
                          <Skeleton className='h-4 w-28 rounded-none' />
                          <Skeleton className='h-3 w-40 rounded-none' />
                        </div>
                      </div>

                      {columnIndex === 1 ? (
                        <>
                          <div className='space-y-2'>
                            <div className='flex items-center gap-2'>
                              <Skeleton className='h-10 flex-1 rounded-none' />
                              <Skeleton className='h-10 flex-1 rounded-none' />
                              <Skeleton className='h-10 flex-1 rounded-none' />
                            </div>
                            <div className='flex items-center gap-2'>
                              <Skeleton className='h-10 flex-1 rounded-none' />
                              <Skeleton className='h-10 flex-1 rounded-none' />
                              <Skeleton className='h-10 flex-1 rounded-none' />
                            </div>
                          </div>

                          <div className='mt-4 flex justify-end'>
                            <Skeleton className='h-10 w-28 rounded-none' />
                          </div>
                        </>
                      ) : (
                        <div className='flex gap-2'>
                          <Skeleton className='h-8 w-20 rounded-none' />
                          <Skeleton className='h-8 w-24 rounded-none' />
                        </div>
                      )}
                    </div>
                  )
                )}
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
            <aside
              className={cn(
                'card rounded-none p-6',
                'max-sm:rounded-none max-sm:p-4'
              )}
            >
              <div className='flex items-start gap-x-10 max-sm:gap-x-4'>
                <div className='relative'>
                  <Skeleton className='h-16 w-16 rounded-none max-sm:h-12 max-sm:w-12' />
                  <Skeleton className='absolute right-0 bottom-0 h-6 w-6 rounded-none' />
                </div>
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-6 w-40 rounded-none max-sm:h-5 max-sm:w-32' />
                  <Skeleton className='h-4 w-48 max-w-full rounded-none max-sm:h-3.5 max-sm:w-36' />
                  <Skeleton className='h-4 w-36 rounded-none max-sm:w-28' />
                </div>
              </div>
            </aside>

            <div className='grid grid-cols-1 gap-4 max-sm:gap-3 md:grid-cols-2'>
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'card flex h-full rounded-none p-6',
                    'max-sm:rounded-none max-sm:p-4'
                  )}
                >
                  <div className='flex w-full items-center justify-between max-sm:flex-col max-sm:items-start max-sm:gap-3'>
                    <div className='flex flex-1 items-center gap-4 max-sm:w-full'>
                      <Skeleton className='h-10 w-10 rounded-none max-sm:h-8 max-sm:w-8' />
                      <div className='flex-1 space-y-2'>
                        <Skeleton className='h-5 w-40 max-w-full rounded-none max-sm:h-4 max-sm:w-32' />
                        <Skeleton className='h-4 w-3/4 rounded-none max-sm:h-3.5' />
                      </div>
                    </div>
                    <div className='max-sm:flex max-sm:w-full max-sm:justify-end'>
                      <Skeleton className='h-10 w-24 rounded-none max-sm:h-9 max-sm:w-22' />
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
