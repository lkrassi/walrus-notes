import { ThemeContext } from '@/shared/lib/react/themeContext';
import { useContext } from 'react';

export const useTheme = () => useContext(ThemeContext);
