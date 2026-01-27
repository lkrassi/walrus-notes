export const appColors = {
  light: {
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
  },
  dark: {
    bg: '#0F172A',
    text: '#E5E7EB',
    primary: '#818CF8',
    primaryDark: '#6366F1',
    primaryGradient: '#A5B4FC',
    secondary: '#94A3B8',
    border: '#1F2937',
    inputPlaceholder: '#64748B',
    borderFocus: '#818CF8',

    btn: '#6366F1',
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
