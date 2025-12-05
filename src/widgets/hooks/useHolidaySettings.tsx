import { useEffect, useState } from 'react';

const LS_KEY = 'wn.holiday.enabled';

export const useHolidaySettings = () => {
  const [enabled, setEnabled] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem(LS_KEY);
      return v === null ? true : v === '1';
    } catch (_e) {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, enabled ? '1' : '0');
    } catch (_e) {}

    try {
      const ev = new CustomEvent('wn.holiday.changed', { detail: enabled });
      window.dispatchEvent(ev);
    } catch (_e) {}
  }, [enabled]);

  useEffect(() => {
    const onCustom = (e: Event) => {
      try {
        const ce = e as CustomEvent<boolean>;
        if (typeof ce.detail === 'boolean') setEnabled(ce.detail);
      } catch (_e) {}
    };

    const onStorage = (e: StorageEvent) => {
      try {
        if (e.key === LS_KEY) {
          setEnabled(e.newValue === '1');
        }
      } catch (_e) {}
    };

    window.addEventListener('wn.holiday.changed', onCustom as EventListener);
    window.addEventListener('storage', onStorage as EventListener);

    return () => {
      window.removeEventListener(
        'wn.holiday.changed',
        onCustom as EventListener
      );
      window.removeEventListener('storage', onStorage as EventListener);
    };
  }, []);

  return { enabled, setEnabled } as const;
};

export default useHolidaySettings;
