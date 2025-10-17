import type { CSSProperties } from 'react';

export const onboardingStyles: {
  options: {
    primaryColor: string;
    textColor: string;
    backgroundColor: string;
    overlayColor: string;
    zIndex: number;
  };
  tooltip: CSSProperties;
  tooltipContainer: CSSProperties;
  buttonNext: CSSProperties;
  buttonBack: CSSProperties;
  buttonSkip: CSSProperties;
  spotlight: CSSProperties;
  overlay: CSSProperties;
} = {
  options: {
    primaryColor: 'var(--color-primary)',
    textColor: 'var(--color-text)',
    backgroundColor: 'var(--color-bg)',
    overlayColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 10000,
  },
  tooltip: {
    borderRadius: '12px',
    fontSize: '14px',
    padding: '20px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    border: '1px solid var(--border-color)',
  },
  tooltipContainer: {
    textAlign: 'left',
  },
  buttonNext: {
    backgroundColor: 'var(--color-primary)',
    fontSize: '14px',
    borderRadius: '8px',
    padding: '10px 20px',
    fontWeight: '600',
    border: 'none',
  },
  buttonBack: {
    color: 'var(--color-primary)',
    fontSize: '14px',
    marginRight: '10px',
    fontWeight: '600',
    border: 'none',
    background: 'transparent',
  },
  buttonSkip: {
    color: 'var(--color-secondary)',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    background: 'transparent',
  },
  spotlight: {
    borderRadius: '8px',
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
};

export const floaterProps = {
  disableAnimation: true,
  styles: {
    floater: {} as CSSProperties,
    container: {} as CSSProperties,
    arrow: {} as CSSProperties,
  },
};
