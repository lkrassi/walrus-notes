import { useCallback, useEffect, useState } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export const useDeviceType = (): DeviceType => {
  const [deviceType, setDeviceType] = useState<DeviceType>(() => {
    if (typeof window === 'undefined') return 'desktop';

    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  });

  const handleResize = useCallback(() => {
    const width = window.innerWidth;
    if (width < 768) {
      setDeviceType('mobile');
    } else if (width < 1024) {
      setDeviceType('tablet');
    } else {
      setDeviceType('desktop');
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return deviceType;
};

export const useIsMobile = (): boolean => {
  const deviceType = useDeviceType();
  return deviceType === 'mobile';
};

export const useIsTablet = (): boolean => {
  const deviceType = useDeviceType();
  return deviceType === 'tablet';
};

export const useIsDesktop = (): boolean => {
  const deviceType = useDeviceType();
  return deviceType !== 'mobile';
};
