import { useLocalization, useSidebar } from '@/widgets/hooks';
import { Menu, X } from 'lucide-react';

import { cn } from '@/shared/lib/core';

type MobileMenuProps = {
  className?: string;
  iconClassName?: string;
};

export const MobileMenu = ({ className, iconClassName }: MobileMenuProps) => {
  const { t } = useLocalization();
  const { isMobileOpen, setIsMobileOpen } = useSidebar();

  const toggleMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <button
      onClick={toggleMenu}
      className={cn(
        'text-muted-foreground',
        'hover:text-foreground',
        'focus:ring-ring',
        'rounded-lg',
        'p-2',
        'transition-colors',
        'duration-200',
        'hover:bg-interactive-hover',
        'active:bg-interactive-active',
        'focus:ring-2',
        'focus:outline-none',
        'md:hidden',
        className
      )}
      aria-label={isMobileOpen ? t('common:menu.close') : t('common:menu.open')}
    >
      {isMobileOpen ? (
        <X className={cn('h-6', 'w-6', iconClassName)} />
      ) : (
        <Menu className={cn('h-6', 'w-6', iconClassName)} />
      )}
    </button>
  );
};
