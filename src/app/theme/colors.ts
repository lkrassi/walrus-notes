export const appColors = {
  light: {
    bg: '#f8fafc',
    text: '#0f172a',
    primary: '#5a5da1',
    primaryDark: '#4f46e5',
    primaryGradient: '#5a5da1',
    secondary: '#64748b',
    border: '#e5e7eb',
    inputPlaceholder: '#94a3b8',
    borderFocus: '#5a5da1',

    btn: '#5a5da1',
    btnCancel: '#EF4444',
    btnDisabled: '#CBD5E1',
    btnSubmit: '#22C55E',
  },
  dark: {
    bg: '#0f172a',
    text: '#e5e7eb',
    primary: '#5a5da1',
    primaryDark: '#5a5da1',
    primaryGradient: '#a5b4fc',
    secondary: '#94a3b8',
    border: '#1f2937',
    inputPlaceholder: '#64748b',
    borderFocus: '#5a5da1',

    btn: '#5a5da1',
    btnCancel: '#EF4444',
    btnDisabled: '#CBD5E1',
    btnSubmit: '#22C55E',
  },
} as const;

export const generateCSSVariables = (
  colors: typeof appColors.light | typeof appColors.dark,
  prefix = 'color'
): string => {
  return Object.entries(colors)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `--${prefix}-${cssKey}: ${value};`;
    })
    .join('\n  ');
};
