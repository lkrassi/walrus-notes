import { useContext } from 'react';
import { ThemeContext } from 'widgets';

export const useTheme = () => useContext(ThemeContext);
