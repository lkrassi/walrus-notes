import { Link } from 'react-router-dom';
import logo from '../../../../assets/logo.png';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';

export const PrivateHeader = () => {
  return (
    <header className='dark:bg-dark-bg border-border dark:border-dark-border flex h-16 justify-between items-center border-b bg-white px-4 py-2 sm:px-6'>
      <Link to='/' className='hidden items-center gap-2 sm:flex sm:gap-3'>
        <img
          src={logo}
          alt='Walrus Notes logo'
          className='h-8 w-8 sm:h-10 sm:w-10'
          loading='lazy'
        />
        <div className='flex items-baseline gap-1'>
          <h1 className='text-text dark:text-dark-text text-xl font-bold sm:text-2xl'>
            Walrus
          </h1>
          <h1 className='from-primary to-primary-gradient bg-gradient-to-r bg-clip-text text-xl font-bold text-transparent sm:text-2xl'>
            Notes
          </h1>
        </div>
      </Link>

      <div className='ml-auto flex items-center gap-2 sm:ml-0 sm:gap-3'>
        <ThemeSwitcher aria-label='Switch theme' />
        <LanguageSwitcher aria-label='Change language' />
      </div>
    </header>
  );
};
