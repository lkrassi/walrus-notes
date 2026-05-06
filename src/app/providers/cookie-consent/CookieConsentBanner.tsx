import { AppRoutes } from '@/app/router/routes';
import { cn } from '@/shared/lib/core';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

const CONSENT_COOKIE_NAME = 'walrus_cookie_consent';

const readConsent = () => {
  if (typeof document === 'undefined') return false;
  return document.cookie
    .split('; ')
    .some(entry => entry.startsWith(`${CONSENT_COOKIE_NAME}=accepted`));
};

const writeConsent = () => {
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${CONSENT_COOKIE_NAME}=accepted; path=/; max-age=${maxAge}; samesite=lax`;
};

export const CookieConsentBanner = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isAccepted, setIsAccepted] = useState(true);

  useEffect(() => {
    setIsAccepted(readConsent());
  }, []);

  const shouldHide = useMemo(
    () => isAccepted || location.pathname === AppRoutes.CONSENT,
    [isAccepted, location.pathname]
  );

  if (shouldHide) {
    return null;
  }

  return (
    <div className='pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:px-6 sm:pb-6'>
      <div
        className={cn(
          'pointer-events-auto mx-auto w-full max-w-5xl',
          'border-border dark:border-dark-border bg-bg/95 dark:bg-dark-bg/95',
          'rounded-3xl border p-4 backdrop-blur-xl sm:p-5'
        )}
      >
        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <div className='space-y-1'>
            <h2 className='text-lg font-bold'>
              {t('common:cookieConsent.title')}
            </h2>
            <p className='muted-text max-w-3xl text-sm leading-relaxed'>
              {t('common:cookieConsent.description')}{' '}
              <Link
                to={AppRoutes.CONSENT}
                className='text-primary underline underline-offset-4 hover:opacity-80'
              >
                {t('common:cookieConsent.readMore')}
              </Link>
            </p>
          </div>
          <label className='border-border dark:border-dark-border bg-bg dark:bg-dark-bg inline-flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium'>
            <input
              type='checkbox'
              checked={isAccepted}
              onChange={event => {
                const checked = event.target.checked;
                setIsAccepted(checked);
                if (checked) {
                  writeConsent();
                } else {
                  document.cookie = `${CONSENT_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
                }
              }}
              className='border-border text-primary focus:ring-primary h-4 w-4 rounded'
            />
            <span>{t('common:cookieConsent.agree')}</span>
          </label>
        </div>
      </div>
    </div>
  );
};
