import { type TFunction } from 'i18next';

export type RouteBreadcrumb = {
  path: string;
  labelKey: string; 
  defaultLabel: string;
};

export const routeBreadcrumbs: RouteBreadcrumb[] = [
  { path: '/dashboard', labelKey: 'dashboard:title', defaultLabel: 'Главная' },
  { path: '/profile', labelKey: 'profile:title', defaultLabel: 'Профиль' },
];

export function findBreadcrumbLabel(
  path: string | undefined,
  t: TFunction
): string {
  if (!path) return t('dashboard:title') || 'Главная';
  const entry = routeBreadcrumbs.find(e => path.includes(e.path));
  if (!entry) return t('dashboard:title') || 'Главная';
  const translated = t(entry.labelKey);
  if (
    !translated ||
    /^\s*$/.test(translated) ||
    /^title[/:]/i.test(translated) ||
    /^title$/i.test(translated)
  ) {
    return entry.defaultLabel;
  }
  return translated;
}

export default routeBreadcrumbs;
