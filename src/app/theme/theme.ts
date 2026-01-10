import { createTheme } from '@mui/material/styles';

const lightColors = {
  bg: '#F8FAFC', 
  text: '#0F172A', 
  primary: '#6366F1', 
  primaryDark: '#4F46E5', 
  primaryGradient: '#818CF8', 
  secondary: '#64748B', 
  border: '#E5E7EB',
  inputPlaceholder: '#94A3B8', 
  borderFocus: '#6366F1',
  btn: '#6366F1',
  btnCancel: '#EF4444', 
  btnDisabled: '#CBD5E1',
  btnSubmit: '#22C55E',
};

const darkColors = {
  bg: '#0F172A',
  text: '#E5E7EB',
  primary: '#818CF8',
  primaryDark: '#6366F1',
  primaryGradient: '#A5B4FC',
  secondary: '#94A3B8', 
  border: '#1F2937',
  inputPlaceholder: '#64748B',
  borderFocus: '#818CF8',
};

export const createAppTheme = (mode: 'light' | 'dark') => {
  const colors = mode === 'light' ? lightColors : darkColors;

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
        main: lightColors.btnCancel,
      },
      success: {
        main: lightColors.btnSubmit,
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
        'Inter, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
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
