import { type FC } from 'react';
import { useTranslation } from 'react-i18next';

interface CoordinateOverlayProps {
  nodeId?: string | null;
  coords?: { x: number; y: number } | null;
  centerCoords?: { x: number; y: number } | null;
  rightOffset?: string;
}

export const CoordinateOverlay: FC<CoordinateOverlayProps> = ({
  nodeId,
  coords,
  centerCoords,
  rightOffset = '0px',
}) => {
  const { t } = useTranslation();

  return (
    <div
      className='pointer-events-none absolute top-2 z-20 transition-[right] duration-300 ease-in-out'
      style={{ right: `calc(0.5rem + ${rightOffset})` }}
      aria-hidden
    >
      <div className='border-border/70 dark:border-dark-border/70 bg-bg/80 dark:bg-dark-bg/80 text-text dark:text-dark-text m-2 border px-2.5 py-2 shadow-md backdrop-blur'>
        {centerCoords ? (
          <div className='text-[11px] font-medium tracking-wide'>
            {t('notes:graphOverlayView')}: {Math.round(centerCoords.x)},{' '}
            {Math.round(centerCoords.y)}
          </div>
        ) : null}
        {coords ? (
          <div className='mt-1 text-xs font-semibold tracking-[0.12em] uppercase'>
            {nodeId
              ? `${t('notes:graphOverlayNode')}: ${nodeId}`
              : t('notes:graphOverlayDragging')}
          </div>
        ) : null}
        {coords ? (
          <div className='text-[11px]'>
            x: {Math.round(coords.x)}, y: {Math.round(coords.y)}
          </div>
        ) : null}
      </div>
    </div>
  );
};
