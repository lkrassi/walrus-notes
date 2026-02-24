import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { createAppTheme } from 'app/theme/theme';
import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from 'react';

type ThemeContextType = {
  theme: string;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

// Определение системной темы
const getSystemTheme = (): 'dark' | 'light' => {
  if (typeof window === 'undefined') return 'dark';

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

// Получение начальной темы: сначала из localStorage, если нет - из системы
const getInitialTheme = (): string => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme;
  }
  return getSystemTheme();
};

export const ThemeProvider: FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<string>(getInitialTheme);

  const muiTheme = useMemo(
    () => createAppTheme(theme === 'dark' ? 'dark' : 'light'),
    [theme]
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Отслеживание изменений системной темы
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      // Обновляем тему только если пользователь не выбирал её вручную
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
