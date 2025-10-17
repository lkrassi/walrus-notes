import React from 'react';
import Joyride from 'react-joyride';
import { useOnboardingTour } from '../../hooks/useOnboardingTour';
import { useOnboardingSteps } from '../../model/onboardingSteps';
import { floaterProps, onboardingStyles } from '../../model/onboardingStyles';
import { CustomTooltip } from './CustomTooltip';

export const OnboardingTour: React.FC = () => {
  const steps = useOnboardingSteps();
  const { run, handleJoyrideCallback } = useOnboardingTour();

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress={false}
      showSkipButton={false}
      callback={handleJoyrideCallback}
      tooltipComponent={CustomTooltip}
      styles={onboardingStyles}
      floaterProps={{
        ...floaterProps,
        disableAnimation: true,
      }}
      scrollToFirstStep
      disableOverlayClose
      spotlightClicks
      hideCloseButton
      scrollOffset={100}
      disableScrollParentFix
    />
  );
};
