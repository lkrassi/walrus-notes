import { Button } from 'shared';
import { useTheme } from 'widgets/hooks';
import { Sun, Moon } from 'lucide-react';

export const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      onClick={toggleTheme}
      className="bg-btn-bg hover:bg-btn-hover w-5 h-10 flex justify-center items-center px-8 py-5"
      aria-label={`Переключить на ${
        theme === 'dark' ? 'светлую' : 'тёмную'
      } тему`}
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
