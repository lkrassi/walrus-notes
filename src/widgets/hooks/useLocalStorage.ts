import { useCallback, useEffect, useState } from 'react';

export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prevValue: T) => T)) => void, () => void] => {
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
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (_e) {}
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
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

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [key]);

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
