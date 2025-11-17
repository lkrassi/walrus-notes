import { useCallback, useEffect, useRef, useState } from 'react';
import { useIsMobile } from './index';

const STORAGE_KEY = 'wn.sidebar.width';
const DEFAULT = 320;
const MIN = 200;
const MAX = 700;

export const useResizableSidebar = () => {
  const isMobile = useIsMobile();
  const [width, setWidth] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const val = raw ? parseInt(raw, 10) : DEFAULT;
      if (Number.isFinite(val)) return Math.max(MIN, Math.min(MAX, val));
    } catch (_e) {
    }
    return DEFAULT;
  });

  const resizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(width);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(width));
    } catch (_e) {
    }
  }, [width]);

  useEffect(() => {
    if (isMobile) return;
  }, [isMobile]);

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!resizingRef.current) return;
    const dx = e.clientX - startXRef.current;
    const newW = Math.max(MIN, Math.min(MAX, startWidthRef.current + dx));
    setWidth(newW);
  }, []);

  const onPointerUp = useCallback(() => {
    if (!resizingRef.current) return;
    resizingRef.current = false;
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
  }, [onPointerMove]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isMobile) return;
      resizingRef.current = true;
      startXRef.current = e.clientX;
      startWidthRef.current = width;
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
    },
    [isMobile, onPointerMove, onPointerUp, width]
  );

  return {
    width: isMobile ? undefined : width,
    setWidth,
    onPointerDown,
    min: MIN,
    max: MAX,
  } as const;
};

export default useResizableSidebar;
