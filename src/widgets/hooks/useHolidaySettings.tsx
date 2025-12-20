import { useEffect, useRef, useState } from 'react';

const LS_ENABLED = 'wn.holiday.enabled';
const LS_SETTINGS = 'wn.holiday.settings';

export type HolidaySettings = {
  enabled: boolean;
  garland: boolean;
  snow: boolean;
  density: number;
  maxSize: number;
  accumulationSpeed: number;
  autoReload: boolean;
  autoReloadDelay: number;
};

const DEFAULT: HolidaySettings = {
  enabled: true,
  garland: true,
  snow: true,
  density: 0.6,
  maxSize: 4,
  accumulationSpeed: 0.9,
  autoReload: true,
  autoReloadDelay: 3000,
};

export const useHolidaySettings = () => {
  const instanceIdRef = useRef<string>(Math.random().toString(36).slice(2, 9));
  const [enabled, setEnabledState] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem(LS_ENABLED);
      return v === null ? DEFAULT.enabled : v === '1';
    } catch (_e) {
      return DEFAULT.enabled;
    }
  });

  const [settings, setSettingsState] = useState<HolidaySettings>(() => {
    try {
      const raw = localStorage.getItem(LS_SETTINGS);
      if (!raw) return DEFAULT;
      const parsed = JSON.parse(raw);
      return { ...DEFAULT, ...parsed };
    } catch (_e) {
      return DEFAULT;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LS_ENABLED, enabled ? '1' : '0');
    } catch (_e) {}

    try {
      const ev = new CustomEvent('wn.holiday.changed', { detail: enabled });
      window.dispatchEvent(ev);
    } catch (_e) {}
  }, [enabled]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_SETTINGS, JSON.stringify(settings));
    } catch (_e) {}

    try {
      const ev = new CustomEvent('wn.holiday.settings.changed', {
        detail: { value: settings, source: instanceIdRef.current },
      });
      window.dispatchEvent(ev);
    } catch (_e) {}
  }, [settings]);

  useEffect(() => {
    const onCustom = (e: Event) => {
      try {
        const ce = e as CustomEvent<boolean>;
        if (typeof ce.detail === 'boolean') setEnabledState(ce.detail);
      } catch (_e) {}
    };

    const onSettingsCustom = (e: Event) => {
      try {
        const ce = e as CustomEvent<unknown>;
        if (!ce.detail) return;
        if (typeof ce.detail === 'object' && ce.detail !== null) {
          const detailObj = ce.detail as unknown as Record<string, unknown>;
          if ('source' in detailObj) {
            if (detailObj['source'] === instanceIdRef.current) return;
            const incoming = (detailObj['value'] ||
              {}) as Partial<HolidaySettings>;
            setSettingsState(prev => {
              const merged = { ...prev, ...incoming };
              const same = Object.keys(merged).every(
                k =>
                  (merged as unknown as Record<string, unknown>)[k] ===
                  (prev as unknown as Record<string, unknown>)[k]
              );
              return same ? prev : merged;
            });
            return;
          }

          const incoming = detailObj as Partial<HolidaySettings>;
          setSettingsState(prev => {
            const merged = { ...prev, ...incoming };
            const same = Object.keys(merged).every(
              k =>
                (merged as unknown as Record<string, unknown>)[k] ===
                (prev as unknown as Record<string, unknown>)[k]
            );
            return same ? prev : merged;
          });
        }
      } catch (_e) {}
    };

    const onStorage = (e: StorageEvent) => {
      try {
        if (e.key === LS_ENABLED) setEnabledState(e.newValue === '1');
        if (e.key === LS_SETTINGS) {
          const incoming = e.newValue ? JSON.parse(e.newValue) : {};
          setSettingsState(prev => {
            const merged = { ...prev, ...incoming };
            const same = Object.keys(merged).every(
              k =>
                (merged as unknown as Record<string, unknown>)[k] ===
                (prev as unknown as Record<string, unknown>)[k]
            );
            return same ? prev : merged;
          });
        }
      } catch (_e) {}
    };

    window.addEventListener('wn.holiday.changed', onCustom as EventListener);
    window.addEventListener(
      'wn.holiday.settings.changed',
      onSettingsCustom as EventListener
    );
    window.addEventListener('storage', onStorage as EventListener);

    return () => {
      window.removeEventListener(
        'wn.holiday.changed',
        onCustom as EventListener
      );
      window.removeEventListener(
        'wn.holiday.settings.changed',
        onSettingsCustom as EventListener
      );
      window.removeEventListener('storage', onStorage as EventListener);
    };
  }, []);

  const setEnabled = (v: boolean) => {
    setEnabledState(v);
    setSettingsState(prev => ({ ...prev, enabled: v }));
  };

  const setSettings = (patch: Partial<HolidaySettings>) => {
    setSettingsState(prev => {
      const next = { ...prev, ...patch };
      setEnabledState(next.enabled);
      return next;
    });
  };

  return { enabled, setEnabled, settings, setSettings } as const;
};

export default useHolidaySettings;
