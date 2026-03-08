import { Button } from '@/shared';
import { cn } from '@/shared/lib/core';
import { ThemeContext } from '@/shared/lib/react';
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
      className={cn('inline-flex h-10 w-10 items-center justify-center p-0')}
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
      <span className={cn('inline-flex items-center justify-center')}>
        {theme === 'dark' ? (
          <Sun className={cn('h-4', 'w-4')} />
        ) : (
          <Moon className={cn('h-4', 'w-4')} />
        )}
      </span>
    </Button>
  );
};
