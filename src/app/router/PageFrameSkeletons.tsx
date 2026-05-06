import { cn } from '@/shared/lib/core';
import { Skeleton } from '@/shared/ui';

const BrandStub = () => (
  <div className={cn('flex', 'items-center', 'gap-2')}>
    <Skeleton className='h-12 w-12 rounded-none' />
    <div className={cn('flex', 'items-baseline', 'gap-1')}>
      <Skeleton className='h-6 w-20 rounded-none' />
      <Skeleton className='h-6 w-16 rounded-none' />
    </div>
  </div>
);

const PublicHeaderFrame = () => (
  <header
    className={cn(
      'bg-bg',
      'border-border dark:border-dark-border',
      'dark:bg-dark-bg',
      'flex flex-col items-center gap-4 border-b',
      'max-md:py-5',
      'md:flex-row md:items-center md:justify-between md:px-5'
    )}
  >
    <BrandStub />
    <div className='flex items-center gap-2'>
      <Skeleton className='h-9 w-14 rounded-lg sm:w-16' />
      <Skeleton className='h-9 w-14 rounded-lg sm:w-16' />
    </div>
  </header>
);

export const PublicPageFrameSkeleton = () => {
  return (
    <div className={cn('bg-bg dark:bg-dark-bg', 'min-h-screen')}>
      <PublicHeaderFrame />
      <main className='mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:py-16'>
        <div
          className={cn(
            'border-border dark:border-dark-border bg-bg/80 dark:bg-dark-bg/80',
            'rounded-3xl border p-6 backdrop-blur-xl sm:p-8 lg:p-10'
          )}
        >
          <div className='space-y-4'>
            <Skeleton className='h-6 w-32 max-w-full' />
            <Skeleton className='h-10 w-72 max-w-full' />
            <Skeleton className='h-6 w-80 max-w-full' />
          </div>

          <div className='mt-10 grid gap-4 lg:grid-cols-3'>
            <Skeleton className='h-36 w-full rounded-2xl' />
            <Skeleton className='h-36 w-full rounded-2xl' />
            <Skeleton className='h-36 w-full rounded-2xl' />
          </div>

          <div className='mt-8'>
            <Skeleton className='h-20 w-full rounded-2xl' />
          </div>

          <div className='mt-8 flex flex-wrap gap-3'>
            <Skeleton className='h-10 w-32 rounded-lg' />
            <Skeleton className='h-10 w-32 rounded-lg' />
          </div>
        </div>
      </main>
    </div>
  );
};
