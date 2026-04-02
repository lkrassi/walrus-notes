import { cn } from '@/shared/lib/core';
import { Skeleton } from '@/shared/ui';

const BrandStub = () => (
  <div className={cn('flex', 'items-center', 'gap-2')}>
    <Skeleton className='h-12 w-12 rounded-full' />
    <div className={cn('space-y-1')}>
      <Skeleton className='h-5 w-28' />
      <Skeleton className='h-4 w-20' />
    </div>
  </div>
);

const PublicHeaderFrame = () => (
  <header
    className={cn(
      'border-border dark:border-dark-border',
      'dark:bg-dark-bg',
      'flex h-20 items-center justify-between border-b px-4 md:px-5'
    )}
  >
    <BrandStub />
    <div className='flex items-center gap-2'>
      <Skeleton className='h-9 w-16 rounded-lg' />
      <Skeleton className='h-9 w-16 rounded-lg' />
    </div>
  </header>
);

const PrivateHeaderFrame = () => (
  <header
    className={cn(
      'border-border dark:border-dark-border',
      'dark:bg-dark-bg',
      'flex h-20 items-center justify-between border-b px-4 md:px-5'
    )}
  >
    <div className='flex items-center gap-2'>
      <Skeleton className='h-10 w-10 rounded-lg md:hidden' />
      <BrandStub />
    </div>
    <Skeleton className='h-9 w-28 rounded-lg' />
  </header>
);

export const PublicPageFrameSkeleton = () => {
  return (
    <div className={cn('bg-bg dark:bg-dark-bg', 'min-h-screen')}>
      <PublicHeaderFrame />
      <main className='mx-auto max-w-6xl p-4 md:p-6'>
        <div className='space-y-4'>
          <Skeleton className='h-10 w-72 max-w-full' />
          <Skeleton className='h-28 w-full rounded-xl' />
          <Skeleton className='h-28 w-full rounded-xl' />
        </div>
      </main>
    </div>
  );
};

export const ProtectedPageFrameSkeleton = () => {
  return (
    <div className={cn('bg-bg dark:bg-dark-bg', 'flex h-screen flex-col')}>
      <PrivateHeaderFrame />

      <div className='hidden min-h-0 flex-1 md:flex'>
        <aside
          className={cn(
            'border-border dark:border-dark-border',
            'dark:bg-dark-bg',
            'w-67.5 border-r bg-white p-3'
          )}
        >
          <Skeleton className='mb-3 h-9 w-full rounded-lg' />
          <Skeleton className='mb-2 h-8 w-full rounded-md' />
          <Skeleton className='mb-2 h-8 w-full rounded-md' />
          <Skeleton className='mb-2 h-8 w-full rounded-md' />
        </aside>

        <main className='min-h-0 flex-1 p-3'>
          <Skeleton className='mb-3 h-10 w-full rounded-md' />
          <Skeleton className='h-[calc(100%-3.25rem)] w-full rounded-xl' />
        </main>
      </div>

      <div className='min-h-0 flex-1 p-3 md:hidden'>
        <Skeleton className='mb-3 h-9 w-full rounded-md' />
        <Skeleton className='h-[calc(100%-3rem)] w-full rounded-xl' />
      </div>
    </div>
  );
};
