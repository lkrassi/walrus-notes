import { Menu, X } from 'lucide-react';
import { useLocalization, useSidebar } from 'widgets/hooks';

export const MobileMenu = () => {
  const { t } = useLocalization();
  const { isMobileOpen, setIsMobileOpen } = useSidebar();

  const toggleMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <button
      onClick={toggleMenu}
      className='text-secondary dark:text-dark-secondary hover:text-text dark:hover:text-dark-text focus:ring-primary dark:focus:ring-dark-primary rounded-lg p-2 transition-colors duration-200 hover:bg-gray-100 focus:ring-2 focus:outline-none md:hidden dark:hover:bg-gray-800'
      aria-label={isMobileOpen ? t('common:menu.close') : t('common:menu.open')}
    >
      {isMobileOpen ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
    </button>
  );
};
