import React from 'react';
import { PublicHeader } from 'widgets/ui/components';
import { HeroLeft } from './HeroLeft';
import { HeroRight } from './HeroRight';

export const Main: React.FC = () => {
  return (
    <div className='bg-gradient min-h-screen overflow-x-hidden'>
      <PublicHeader />
      <main className='mx-10 max-sm:mx-0'>
        <div className='m-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16'>
          <HeroLeft />
          <HeroRight />
        </div>
      </main>
    </div>
  );
};
