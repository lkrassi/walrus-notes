import { ThemeContext } from '@/app/providers/theme';
import { cn } from '@/shared/lib';
import { Button } from '@/shared/ui';
import { Moon, Sun } from 'lucide-react';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

export const ThemeSwitcher = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <Button
      data-tour='theme-switcher'
      onClick={toggleTheme}
      className={cn('px-2', 'py-2', 'sm:px-3')}
      aria-label={
        theme === 'dark'
          ? t('common:theme.switchToLight')
          : t('common:theme.switchToDark')
      }
      title={
        theme === 'dark'
          ? t('common:theme.switchToLight')
          : t('common:theme.switchToDark')
      }
      variant='default'
    >
      <span>
        {theme === 'dark' ? (
          <Sun className={cn('h-4', 'w-4')} />
        ) : (
          <Moon className={cn('h-4', 'w-4')} />
        )}
      </span>
    </Button>
  );
};
