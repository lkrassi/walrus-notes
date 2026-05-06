import { PublicHeader } from '@/widgets/ui';
import { type FC } from 'react';
import { Cookies } from './Cookies';

export const CookiesPage: FC = () => {
  return (
    <>
      <PublicHeader />
      <main>
        <Cookies />
      </main>
    </>
  );
};
