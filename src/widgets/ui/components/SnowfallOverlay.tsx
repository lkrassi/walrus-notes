import Snowfall from 'react-snowfall';
import cn from 'shared/lib/cn';
import { useHolidaySettings } from '../../hooks/useHolidaySettings';

export const SnowfallOverlay = () => {
  const { enabled, settings } = useHolidaySettings();

  if (!enabled || !settings?.snow) return null;

  const density = settings.density ?? 0.6;
  const snowflakeCount = Math.max(20, Math.round(400 * density));
  const maxRadius = Math.max(settings.maxSize ?? 4, 2);

  return (
    <div className={cn('fixed', 'inset-0', 'w-screen', 'h-screen', 'pointer-events-none', 'z-200')}>
      <Snowfall snowflakeCount={snowflakeCount} radius={[1, maxRadius]} />
    </div>
  );
};

export default SnowfallOverlay;
