import { useContext } from 'react';
import { ThemeContext } from 'widgets/model/stores/ThemeProvider';

export const useTheme = () => {
  return useContext(ThemeContext);
};
