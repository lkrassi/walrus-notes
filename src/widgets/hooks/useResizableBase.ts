import { useCallback, useEffect, useRef, useState } from 'react';
import { useIsMobile } from './index';

type Options = {
  storageKey?: string;
  defaultSize: number;
  min: number;
  max: number;
};

export const useResizableBase = ({ storageKey, defaultSize, min, max }: Options) => {
  const isMobile = useIsMobile();
  const [size, setSize] = useState<number>(() => {
    if (!storageKey) return defaultSize;
    try {
      const raw = localStorage.getItem(storageKey);
      const val = raw ? parseInt(raw, 10) : defaultSize;
      if (Number.isFinite(val)) return Math.max(min, Math.min(max, val));
    } catch (_e) {}
    return defaultSize;
  });

  const resizingRef = useRef(false);
  const startPosRef = useRef(0);
  const startSizeRef = useRef(size);

  useEffect(() => {
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, String(size));
      } catch (_e) {}
    }
  }, [size, storageKey]);

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!resizingRef.current) return;
    const dx = e.clientX - startPosRef.current;
    const newSize = Math.max(min, Math.min(max, startSizeRef.current + dx));
    setSize(newSize);
  }, [min, max]);

  const onPointerUp = useCallback(() => {
    if (!resizingRef.current) return;
    resizingRef.current = false;
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
  }, [onPointerMove]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (isMobile) return;
    resizingRef.current = true;
    startPosRef.current = e.clientX;
    startSizeRef.current = size;
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  }, [isMobile, onPointerMove, onPointerUp, size]);

  return {
    size: isMobile ? undefined : size,
    setSize,
    onPointerDown,
    min,
    max,
  } as const;
};

export default useResizableBase;
