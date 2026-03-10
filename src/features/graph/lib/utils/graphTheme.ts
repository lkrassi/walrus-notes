export function cssVar(name: string, fallback = ''): string {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();

  return value || fallback;
}

export const graphTheme = () => ({
  node: cssVar('--primary', 'var(--primary)'),
  edge: cssVar('--border', 'var(--border)'),
  surface: cssVar('--surface', 'var(--surface)'),
  background: cssVar('--surface', 'var(--surface)'),
  text: cssVar('--foreground', 'var(--foreground)'),
  hover: cssVar('--surface-2', 'var(--surface-2)'),
  success: cssVar('--success', 'var(--success)'),
  danger: cssVar('--danger', 'var(--danger)'),
});
