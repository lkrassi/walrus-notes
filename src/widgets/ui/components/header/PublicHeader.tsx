import { Link } from 'react-router-dom';

import logo from '../../../../assets/logo.png';

import { LanguageSwitcher } from '../LanguageSwitcher';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';

export const PublicHeader = () => {
  return (
    <header className='flex items-center justify-between p-15 max-sm:flex-col max-sm:gap-y-10'>
      <Link to={'/'}>
        <div className='flex items-center gap-x-5 max-sm:flex-col max-sm:gap-y-5'>
          <img
            src={logo}
            alt='Walrus Notes logo'
            className='h-25 w-25 max-sm:h-20 max-sm:w-20'
            loading='lazy'
          />
          <div className='flex gap-x-2'>
            <h1 className='text-text dark:text-dark-text text-4xl font-bold max-sm:text-2xl'>
              Walrus
            </h1>
            <h1 className='from-primary to-primary-gradient bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent max-sm:text-2xl'>
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
