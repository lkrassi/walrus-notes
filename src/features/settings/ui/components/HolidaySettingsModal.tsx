import React from 'react';
import cn from 'shared/lib/cn';
import { useLocalization } from 'widgets/hooks';
import useHolidaySettings from 'widgets/hooks/useHolidaySettings';
import { Button } from 'shared';

export const HolidaySettingsModal: React.FC = () => {
  const { t } = useLocalization();
  const { settings, setSettings } = useHolidaySettings();

  if (!settings) return null;

  const toggleGarland = () => setSettings({ garland: !settings.garland });

  const toggleSnow = () => {
    if (settings.snow) setSettings({ snow: false });
    else setSettings({ snow: true, density: 0.22, maxSize: 2 });
  };

  return (
    <div className={cn('grid', 'grid-cols-2', 'gap-3')}>
      <Button onClick={toggleGarland} className={cn('btn')}>
        {t('settings:holiday.garland')}:{' '}
        {settings.garland
          ? t('settings:holiday.on') || 'On'
          : t('settings:holiday.off') || 'Off'}
      </Button>

      <Button onClick={toggleSnow} className={cn('btn')}>
        {t('settings:holiday.snow')}:{' '}
        {settings.snow
          ? t('settings:holiday.on') || 'On'
          : t('settings:holiday.off') || 'Off'}
      </Button>
    </div>
  );
};

export default HolidaySettingsModal;
