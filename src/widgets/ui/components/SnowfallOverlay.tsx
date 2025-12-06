import { type CSSProperties } from 'react';
import Snowfall from 'react-snowfall';
import { useHolidaySettings } from '../../hooks/useHolidaySettings';

export const SnowfallOverlay = () => {
  const { enabled, settings } = useHolidaySettings();

  if (!enabled || !settings?.snow) return null;

  const density = settings.density ?? 0.6;
  const snowflakeCount = Math.max(20, Math.round(400 * density));
  const maxRadius = Math.max(settings.maxSize ?? 4, 2);

  const style: CSSProperties = {
    position: 'fixed',
    inset: 0,
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: 9999,
  };

  return (
    <Snowfall
      snowflakeCount={snowflakeCount}
      radius={[1, maxRadius]}
      style={style}
    />
  );
};

export default SnowfallOverlay;
