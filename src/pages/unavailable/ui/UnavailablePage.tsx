import { PublicHeader } from '@/widgets/ui';
import { type FC } from 'react';
import { Unavailable } from './Unavailable';

export const UnavailablePage: FC = () => {
  return (
    <>
      <PublicHeader />
      <Unavailable />
    </>
  );
};
