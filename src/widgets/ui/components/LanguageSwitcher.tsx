import React, { useEffect, useState } from 'react';
import cn from 'shared/lib/cn';

import { Button } from 'shared';

import { useLocalization } from 'widgets/hooks/useLocalization';
import { useModalActions } from 'widgets/hooks/useModalActions';
import { useModalContentContext } from 'widgets/ui/components/modal/ModalContentContext';

import { RussianFlagIcon } from 'public/RussianFlagIcon';
import { UKFlagIcon } from 'public/UKFlagIcon';

const LANGUAGES = [
  {
    code: 'en',
    name: 'EN',
    flag: <UKFlagIcon className={cn('h-20', 'w-20')} />,
  },
  {
    code: 'ru',
    name: 'RU',
    flag: <RussianFlagIcon className={cn('h-20', 'w-20')} />,
  },
];

export const LanguageSwitcher: React.FC = () => {
  const { t, currentLanguage, changeLanguage } = useLocalization();
  const { openModalFromTrigger } = useModalActions();
  const [effectiveLanguage, setEffectiveLanguage] = useState(
    currentLanguage || 'ru'
  );

  useEffect(() => {
    const savedLanguage = localStorage.getItem('i18nextLng');
    const defaultLanguage = 'ru';

    if (savedLanguage && LANGUAGES.find(lang => lang.code === savedLanguage)) {
      setEffectiveLanguage(savedLanguage);
      changeLanguage(savedLanguage);
    } else {
      setEffectiveLanguage(defaultLanguage);
      changeLanguage(defaultLanguage);
    }
  }, [changeLanguage]);

  useEffect(() => {
    if (currentLanguage) {
      setEffectiveLanguage(currentLanguage);
    }
  }, [currentLanguage]);

  const handleLanguageSelect = (
    langCode: string,
    closeModal: () => void
  ) => {
    changeLanguage(langCode);
    setEffectiveLanguage(langCode);
    closeModal();
  };

  const LanguageModal: React.FC = () => {
    const { closeModal } = useModalContentContext();

    return (
      <div className={cn('flex', 'p-2', 'justify-center', 'gap-3')}>
        {LANGUAGES.map(language => (
          <Button
            key={language.code}
            onClick={() => handleLanguageSelect(language.code, closeModal)}
            variant={
              effectiveLanguage === language.code ? 'default' : 'disabled'
            }
            className={cn(
              'flex',
              'items-center',
              'justify-between',
              'px-4',
              'py-2'
            )}
          >
            <div className={cn('flex', 'items-center', 'gap-3')}>
              <span
                className={cn(
                  'flex',
                  'h-6',
                  'w-8',
                  'items-center',
                  'justify-center'
                )}
              >
                {language.flag}
              </span>
              <span className={cn('text-base', 'font-semibold')}>
                {language.name}
              </span>
            </div>
          </Button>
        ))}
      </div>
    );
  };

  const currentLang =
    LANGUAGES.find(lang => lang.code === effectiveLanguage) || LANGUAGES[0];

  const openLanguageModal = openModalFromTrigger(<LanguageModal />, {
    title: t('common:header.changeLanguage'),
    size: 'sm',
  });

  return (
    <Button
      data-tour='language-switcher'
      onClick={openLanguageModal}
      variant='default'
      className={cn(
        'flex',
        'h-10',
        'w-30',
        'items-center',
        'justify-center',
        'gap-3',
        'px-7',
        'py-2'
      )}
      title={t('common:header.changeLanguage')}
    >
      <span className={cn('text-base', 'font-semibold')}>
        {currentLang.name}
      </span>
    </Button>
  );
};
