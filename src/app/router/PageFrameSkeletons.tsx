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
      <Skeleton className='h-9 w-14 rounded-none sm:w-16' />
      <Skeleton className='h-9 w-14 rounded-none sm:w-16' />
    </div>
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
