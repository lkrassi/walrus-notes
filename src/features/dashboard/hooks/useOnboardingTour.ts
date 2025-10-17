import { useCallback, useEffect, useState } from 'react';
import { STATUS, type CallBackProps } from 'react-joyride';

export const useOnboardingTour = () => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenOnboardingTour');
    if (!hasSeenTour) {
      setRun(true);
    }
  }, []);

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.setItem('hasSeenOnboardingTour', 'true');
      setRun(false);
    }
  }, []);

  const startTour = useCallback(() => {
    setRun(true);
  }, []);

  const stopTour = useCallback(() => {
    setRun(false);
    localStorage.setItem('hasSeenOnboardingTour', 'true');
  }, []);

  return {
    run,
    handleJoyrideCallback,
    startTour,
    stopTour,
  };
};
