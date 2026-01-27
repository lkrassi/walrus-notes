import { useEffect, useState } from 'react';

export const useDebounced = <T>(value: T, delay: number = 300) => {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
};
