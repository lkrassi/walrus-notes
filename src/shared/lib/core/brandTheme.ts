type BrandThemeOptions = {
  foreground?: string;
};

const BRAND_PRIMARY_VAR = '--brand-primary';
const BRAND_PRIMARY_FOREGROUND_VAR = '--brand-primary-foreground';

const getRoot = () => document.documentElement;

export const setBrandPrimary = (
  primary: string,
  options?: BrandThemeOptions
) => {
  if (typeof window === 'undefined' || !primary.trim()) {
    return;
  }

  const root = getRoot();
  root.style.setProperty(BRAND_PRIMARY_VAR, primary.trim());

  if (options?.foreground?.trim()) {
    root.style.setProperty(
      BRAND_PRIMARY_FOREGROUND_VAR,
      options.foreground.trim()
    );
  }
};

export const resetBrandPrimary = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const root = getRoot();
  root.style.removeProperty(BRAND_PRIMARY_VAR);
  root.style.removeProperty(BRAND_PRIMARY_FOREGROUND_VAR);
};

export const getBrandPrimary = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  return getComputedStyle(getRoot()).getPropertyValue(BRAND_PRIMARY_VAR).trim();
};
