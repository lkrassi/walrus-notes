import { Moon, Sun } from 'lucide-react';
import { Button } from 'shared';
import { useLocalization, useTheme } from 'widgets/hooks';

export const ThemeSwitcher = () => {
  const { t } = useLocalization();
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      data-tour="theme-switcher"
      onClick={toggleTheme}
      className='flex h-10 w-5 items-center justify-center px-8 py-5'
      aria-label={
        theme === 'dark'
          ? t('common:theme.switchToLight')
          : t('common:theme.switchToDark')
      }
      variant='default'
    >
      <span>
        {theme === 'dark' ? (
          <>
            <Sun size={18} />
          </>
        ) : (
          <>
            <Moon size={18} />
          </>
        )}
      </span>
    </Button>
  );
};
