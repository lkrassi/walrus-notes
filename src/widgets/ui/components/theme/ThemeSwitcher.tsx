import { Moon, Sun } from 'lucide-react';
import { Button } from 'shared';
import cn from 'shared/lib/cn';
import { useLocalization, useTheme } from 'widgets/hooks';

export const ThemeSwitcher = () => {
  const { t } = useLocalization();
  const { theme, toggleTheme } = useTheme();

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
          <>
            <Sun className={cn('h-4', 'w-4')} />
          </>
        ) : (
          <>
            <Moon className={cn('h-4', 'w-4')} />
          </>
        )}
      </span>
    </Button>
  );
};
