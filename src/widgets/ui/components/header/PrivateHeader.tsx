import { ProfileButton } from 'features/profile/ui/components/ProfileButton';
import { Link } from 'react-router-dom';
import { useLocalization } from 'widgets/hooks';
import logo from '../../../../assets/logo.png';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';

export const PrivateHeader = () => {
  const { t } = useLocalization();

  return (
    <header className='dark:bg-dark-bg border-border dark:border-dark-border h-16 border-b bg-white px-4 py-2 sm:px-6'>
      <div className='flex items-center justify-between'>
        <Link
          to='/'
          className='hidden items-center gap-2 sm:gap-3 md:flex'
          aria-label={t('common:header.goToHomepage')}
        >
          <img
            src={logo}
            alt={t('common:header.logoAlt')}
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

        <div className='flex-1 md:hidden'></div>

        <div className='flex items-center gap-x-2'>
          <ThemeSwitcher />
          <LanguageSwitcher />
          <ProfileButton />
        </div>
      </div>
    </header>
  );
};
