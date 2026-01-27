import { useCallback, useEffect, useRef, useState } from 'react';
import { useIsMobile } from './index';

type Options = {
  storageKey?: string;
  defaultSize: number;
  min: number;
  max: number;
};

export const useResizableBase = ({
  storageKey,
  defaultSize,
  min,
  max,
}: Options) => {
  const isMobile = useIsMobile();
  const [size, setSize] = useState<number>(() => {
    return defaultSize;
  });

  const resizingRef = useRef(false);
  const [isResizing, setIsResizing] = useState(false);
  const startPosRef = useRef(0);
  const startSizeRef = useRef(size);

  useEffect(() => {}, [size, storageKey]);

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!resizingRef.current) return;
      const dx = e.clientX - startPosRef.current;
      const newSize = Math.max(min, Math.min(max, startSizeRef.current + dx));
      setSize(newSize);
    },
    [min, max]
  );

  const onPointerUp = useCallback(() => {
    if (!resizingRef.current) return;
    resizingRef.current = false;
    setIsResizing(false);
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
  }, [onPointerMove]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isMobile) return;
      resizingRef.current = true;
      setIsResizing(true);
      startPosRef.current = e.clientX;
      startSizeRef.current = size;
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
    },
    [isMobile, onPointerMove, onPointerUp, size]
  );

  return {
    size: isMobile ? undefined : size,
    setSize,
    onPointerDown,
    min,
    max,
    isResizing,
  } as const;
};
