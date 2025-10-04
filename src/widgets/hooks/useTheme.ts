import { ThemeContext } from '../model/stores/ThemeProvider';
import { useContext } from 'react';

export const useTheme = () => {
  return useContext(ThemeContext);
};
