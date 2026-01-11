import { createTheme } from '@mui/material/styles';
import { appColors } from './colors';

export const createAppTheme = (mode: 'light' | 'dark') => {
  const colors = appColors[mode];

  return createTheme({
    palette: {
      mode,
      primary: {
        main: colors.primary,
        dark: colors.primaryDark,
        contrastText: '#ffffff',
      },
      secondary: {
        main: colors.secondary,
        contrastText: mode === 'light' ? '#ffffff' : colors.text,
      },
      error: {
        main: colors.btnCancel,
      },
      success: {
        main: colors.btnSubmit,
      },
      background: {
        default: colors.bg,
        paper: mode === 'light' ? '#FFFFFF' : '#111827',
      },
      text: {
        primary: colors.text,
        secondary: colors.secondary,
      },
      divider: colors.border,
    },
    typography: {
      fontFamily:
        'KWL, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '1rem',
            padding: '8px 24px',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
        },
        defaultProps: {
          disableElevation: true,
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: mode === 'light' ? '#ffffff' : '#0B1220',
              '& fieldset': {
                borderColor: colors.border,
              },
              '&:hover fieldset': {
                borderColor: colors.borderFocus,
              },
              '&.Mui-focused fieldset': {
                borderColor: colors.borderFocus,
                borderWidth: '2px',
              },
            },
            '& .MuiInputBase-input': {
              color: colors.text,
            },
            '& .MuiInputBase-input::placeholder': {
              color: colors.inputPlaceholder,
              opacity: 1,
            },
          },
        },
        defaultProps: {
          variant: 'outlined',
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            '&.Mui-disabled': {
              opacity: 0.5,
              cursor: 'not-allowed',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 12,
          },
        },
      },
    },
  });
};
