import { useCallback, useEffect, useRef, useState } from 'react';

const LOCAL_STORAGE_EVENT = 'local-storage';

type LocalStorageChangeDetail = {
  key: string;
  newValue: string | null;
  sourceId?: string;
};

export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prevValue: T) => T)) => void, () => void] => {
  const sourceIdRef = useRef(`${key}-${Math.random().toString(36).slice(2)}`);

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }
      if (
        typeof initialValue === 'string' &&
        !item.startsWith('"') &&
        !item.startsWith('{') &&
        !item.startsWith('[')
      ) {
        return item;
      }
      return JSON.parse(item);
    } catch (_error) {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prevValue: T) => T)) => {
      try {
        setStoredValue(prevValue => {
          const valueToStore =
            value instanceof Function ? value(prevValue) : value;

          if (typeof window !== 'undefined') {
            const serialized = JSON.stringify(valueToStore);
            window.localStorage.setItem(key, serialized);
            window.dispatchEvent(
              new CustomEvent<LocalStorageChangeDetail>(LOCAL_STORAGE_EVENT, {
                detail: {
                  key,
                  newValue: serialized,
                  sourceId: sourceIdRef.current,
                },
              })
            );
          }

          return valueToStore;
        });
      } catch (_e) {}
    },
    [key]
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        window.dispatchEvent(
          new CustomEvent<LocalStorageChangeDetail>(LOCAL_STORAGE_EVENT, {
            detail: {
              key,
              newValue: null,
              sourceId: sourceIdRef.current,
            },
          })
        );
      }
    } catch (_e) {}
  }, [key, initialValue]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (_e) {}
      }
    };

    const handleLocalStorageChange = (event: Event) => {
      const e = event as CustomEvent<LocalStorageChangeDetail>;
      if (!e.detail || e.detail.key !== key) {
        return;
      }

      if (e.detail.sourceId === sourceIdRef.current) {
        return;
      }

      if (e.detail.newValue === null) {
        setStoredValue(initialValue);
        return;
      }

      try {
        setStoredValue(JSON.parse(e.detail.newValue));
      } catch (_e) {}
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener(LOCAL_STORAGE_EVENT, handleLocalStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener(
          LOCAL_STORAGE_EVENT,
          handleLocalStorageChange
        );
      };
    }
  }, [initialValue, key]);

  return [storedValue, setValue, removeValue];
};

export const useLocalStorageString = (
  key: string,
  initialValue: string = ''
) => {
  return useLocalStorage(key, initialValue);
};

export const useLocalStorageNumber = (
  key: string,
  initialValue: number = 0
) => {
  return useLocalStorage(key, initialValue);
};

export const useLocalStorageBoolean = (
  key: string,
  initialValue: boolean = false
) => {
  return useLocalStorage(key, initialValue);
};

export const useLocalStorageObject = <T extends Record<string, unknown>>(
  key: string,
  initialValue: T
) => {
  return useLocalStorage(key, initialValue);
};
