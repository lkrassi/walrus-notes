import { useEffect, useState, type FC } from 'react';
import { useReactFlow } from 'reactflow';

export const useGraphViewport = () => {
  const [centerCoords, setCenterCoords] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const ViewportTracker: FC<{
    onViewportChange: (c: { x: number; y: number } | null) => void;
  }> = ({ onViewportChange }) => {
    const { getViewport } = useReactFlow();

    useEffect(() => {
      let mounted = true;

      const tick = () => {
        if (!mounted) return;
        try {
          const vp = getViewport();
          const wrapper = document.querySelector(
            '.react-flow'
          ) as HTMLElement | null;
          if (!wrapper || !vp) {
            onViewportChange(null);
          } else {
            const width = wrapper.clientWidth;
            const height = wrapper.clientHeight;
            const zoom = vp.zoom ?? 1;
            const cx = (width / 2 - (vp.x ?? 0)) / zoom;
            const cy = (height / 2 - (vp.y ?? 0)) / zoom;
            onViewportChange({ x: cx, y: cy });
          }
        } catch (_e) {
          onViewportChange(null);
        }
        requestAnimationFrame(tick);
      };

      const id = requestAnimationFrame(tick);
      return () => {
        mounted = false;
        cancelAnimationFrame(id);
      };
    }, [getViewport, onViewportChange]);

    return null;
  };

  return {
    centerCoords,
    setCenterCoords,
    ViewportTracker,
  };
};
