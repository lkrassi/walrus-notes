import React, { useEffect, useState } from 'react';
import Joyride, { type CallBackProps, STATUS, type Step } from 'react-joyride';
import { useLocalization } from 'widgets/hooks/useLocalization';
import { CustomTooltip } from './CustonTooltip';

export const OnboardingTour: React.FC = () => {
  const { t } = useLocalization();
  const [run, setRun] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenOnboardingTour');
    if (!hasSeenTour) {
      setRun(true);
    }
  }, []);

  const steps: Step[] = [
    {
      target: '[data-tour="sidebar"]',
      content: (
        <div>
          <h4 className='text-text dark:text-dark-text mb-2 text-lg font-semibold'>
            {t('common:onboarding:sidebar.title')}
          </h4>
          <p className='text-text dark:text-dark-text mb-3'>
            {t('common:onboarding:sidebar.description')}
          </p>
          <div className='text-secondary dark:text-dark-secondary text-sm opacity-80'>
            <p>• {t('common:onboarding:sidebar.feature1')}</p>
            <p>• {t('common:onboarding:sidebar.feature2')}</p>
            <p>• {t('common:onboarding:sidebar.feature3')}</p>
          </div>
        </div>
      ),
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '[data-tour="create-layout"]',
      content: (
        <div>
          <h4 className='text-text dark:text-dark-text mb-2 text-lg font-semibold'>
            {t('common:onboarding:createLayout.title')}
          </h4>
          <p className='text-text dark:text-dark-text mb-3'>
            {t('common:onboarding:createLayout.description')}
          </p>
          <div className='text-secondary dark:text-dark-secondary text-sm opacity-80'>
            <p>• {t('common:onboarding:createLayout.feature1')}</p>
            <p>• {t('common:onboarding:createLayout.feature2')}</p>
            <p>• {t('common:onboarding:createLayout.feature3')}</p>
          </div>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '[data-tour="search"]',
      content: (
        <div>
          <h4 className='text-text dark:text-dark-text mb-2 text-lg font-semibold'>
            {t('common:onboarding:search.title')}
          </h4>
          <p className='text-text dark:text-dark-text mb-3'>
            {t('common:onboarding:search.description')}
          </p>
          <div className='text-secondary dark:text-dark-secondary text-sm opacity-80'>
            <p>• {t('common:onboarding:search.feature1')}</p>
            <p>• {t('common:onboarding:search.feature2')}</p>
            <p>• {t('common:onboarding:search.feature3')}</p>
          </div>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '[data-tour="logout"]',
      content: (
        <div>
          <h4 className='text-text dark:text-dark-text mb-2 text-lg font-semibold'>
            {t('common:onboarding:logout.title')}
          </h4>
          <p className='text-text dark:text-dark-text mb-3'>
            {t('common:onboarding:logout.description')}
          </p>
          <div className='text-secondary dark:text-dark-secondary text-sm opacity-80'>
            <p>• {t('common:onboarding:logout.feature1')}</p>
            <p>• {t('common:onboarding:logout.feature2')}</p>
            <p>• {t('common:onboarding:logout.feature3')}</p>
          </div>
        </div>
      ),
      placement: 'bottom',
    },

    {
      target: '[data-tour="theme-switcher"]',
      content: (
        <div>
          <h4 className='text-text dark:text-dark-text mb-2 text-lg font-semibold'>
            {t('common:onboarding:themeSwitcher.title')}
          </h4>
          <p className='text-text dark:text-dark-text mb-3'>
            {t('common:onboarding:themeSwitcher.description')}
          </p>
          <div className='text-secondary dark:text-dark-secondary text-sm opacity-80'>
            <p>• {t('common:onboarding:themeSwitcher.feature1')}</p>
            <p>• {t('common:onboarding:themeSwitcher.feature2')}</p>
            <p>• {t('common:onboarding:themeSwitcher.feature3')}</p>
          </div>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="language-switcher"]',
      content: (
        <div>
          <h4 className='text-text dark:text-dark-text mb-2 text-lg font-semibold'>
            {t('common:onboarding:languageSwitcher.title')}
          </h4>
          <p className='text-text dark:text-dark-text mb-3'>
            {t('common:onboarding:languageSwitcher.description')}
          </p>
          <div className='text-secondary dark:text-dark-secondary text-sm opacity-80'>
            <p>• {t('common:onboarding:languageSwitcher.feature1')}</p>
            <p>• {t('common:onboarding:languageSwitcher.feature2')}</p>
            <p>• {t('common:onboarding:languageSwitcher.feature3')}</p>
          </div>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="profile"]',
      content: (
        <div>
          <h4 className='text-text dark:text-dark-text mb-2 text-lg font-semibold'>
            {t('common:onboarding:profile.title')}
          </h4>
          <p className='text-text dark:text-dark-text mb-3'>
            {t('common:onboarding:profile.description')}
          </p>
          <div className='text-secondary dark:text-dark-secondary text-sm opacity-80'>
            <p>• {t('common:onboarding:profile.feature1')}</p>
            <p>• {t('common:onboarding:profile.feature2')}</p>
            <p>• {t('common:onboarding:profile.feature3')}</p>
          </div>
        </div>
      ),
      placement: 'bottom',
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.setItem('hasSeenOnboardingTour', 'true');
      setRun(false);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress={false}
      showSkipButton={false}
      callback={handleJoyrideCallback}
      tooltipComponent={CustomTooltip}
      styles={{
        options: {
          primaryColor: 'var(--color-primary)',
          textColor: 'var(--color-text)',
          backgroundColor: 'var(--color-bg)',
          overlayColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 10000,
        },
        spotlight: {
          borderRadius: 8,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
        },
      }}
      scrollToFirstStep
      disableOverlayClose
      spotlightClicks
      hideCloseButton
      floaterProps={{
        disableAnimation: true,
      }}
    />
  );
};
