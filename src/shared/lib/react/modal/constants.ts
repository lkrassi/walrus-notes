export const MODAL_SIZE_MAP = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[96vw]',
} as const;

export const MODAL_PANEL_BASE_CLASS =
  'border-border rounded-xl dark:border-dark-border bg-bg dark:bg-dark-bg text-text dark:text-dark-text flex max-h-[90vh] flex-col overflow-hidden border shadow-lg';
