import { Link } from 'react-router-dom';

import logo from 'public/logo.svg';

import { LanguageSwitcher } from '../LanguageSwitcher';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';

export const PublicHeader = () => {
  return (
    <header className='flex justify-between items-center p-15 max-sm:flex-col max-sm:gap-y-10'>
      <Link to={'/'}>
        <div className='flex items-center gap-x-5 max-sm:flex-col max-sm:gap-y-5'>
          <img
            src={logo}
            alt='Walrus Notes logo'
            className='w-25 h-25 max-sm:w-20 max-sm:h-20'
            loading='lazy'
          />
          <div className='flex gap-x-2'>
            <h1 className='text-text dark:text-dark-text font-bold text-4xl max-sm:text-2xl'>
              Walrus
            </h1>
            <h1 className='bg-gradient-to-r from-primary to-primary-gradient font-bold bg-clip-text text-transparent text-4xl max-sm:text-2xl'>
              Notes
            </h1>
          </div>
        </div>
      </Link>
      <div className='flex gap-x-3 sm:gap-x-4 lg:gap-x-5'>
        <ThemeSwitcher aria-label='Switch theme' />
        <LanguageSwitcher aria-label='Change language' />
      </div>
    </header>
  );
};
