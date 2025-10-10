import { Menu, X } from 'lucide-react';
import { useSidebar, useLocalization } from 'widgets/hooks';

export const MobileMenu = () => {
  const { t } = useLocalization();
  const { isMobileOpen, setIsMobileOpen } = useSidebar();

  const toggleMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <button
      onClick={toggleMenu}
      className="
        md:hidden p-2 rounded-lg
        text-secondary dark:text-dark-secondary
        hover:text-text dark:hover:text-dark-text
        hover:bg-gray-100 dark:hover:bg-gray-800
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary
      "
      aria-label={isMobileOpen ? t('common:menu.close') : t('common:menu.open')}
    >
      {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
    </button>
  );
};
