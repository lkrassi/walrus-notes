import { appColors } from './colors';

export type AppTheme = {
  mode: 'light' | 'dark';
  colors: (typeof appColors)['light'] | (typeof appColors)['dark'];
  typography: {
    fontFamily: string;
  };
  shape: {
    borderRadius: number;
  };
};

export const createAppTheme = (mode: 'light' | 'dark'): AppTheme => ({
  mode,
  colors: appColors[mode],
  typography: {
    fontFamily:
      'KWL, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
  },
  shape: {
    borderRadius: 8,
  },
});
