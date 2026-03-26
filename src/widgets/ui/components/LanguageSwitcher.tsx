import { cn } from '@/shared/lib/core';

import { Button } from '@/shared';

import {
  useLocalization,
  useModalActions,
  useModalContentContext,
} from '@/widgets/hooks';

import { RussianFlagIcon } from '@/shared/ui/icons/RussianFlagIcon';
import { UKFlagIcon } from '@/shared/ui/icons/UKFlagIcon';
import type { FC } from 'react';

const LANGUAGES = [
  {
    code: 'en',
    name: 'EN',
    flag: <UKFlagIcon className={cn('h-16', 'w-16', 'sm:h-20', 'sm:w-20')} />,
  },
  {
    code: 'ru',
    name: 'RU',
    flag: (
      <RussianFlagIcon className={cn('h-16', 'w-16', 'sm:h-20', 'sm:w-20')} />
    ),
  },
];

export const LanguageSwitcher: FC = () => {
  const { t, currentLanguage, changeLanguage } = useLocalization();
  const { openModalFromTrigger } = useModalActions();

  const handleLanguageSelect = (langCode: string, closeModal: () => void) => {
    changeLanguage(langCode);
    closeModal();
  };

  const LanguageModal: FC = () => {
    const { closeModal } = useModalContentContext();

    return (
      <div className={cn('flex', 'p-2', 'justify-center', 'gap-3')}>
        {LANGUAGES.map(language => (
          <Button
            key={language.code}
            onClick={() => handleLanguageSelect(language.code, closeModal)}
            variant={currentLanguage === language.code ? 'default' : 'disabled'}
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
    LANGUAGES.find(lang => lang.code === currentLanguage) || LANGUAGES[1];

  const openLanguageModal = openModalFromTrigger(<LanguageModal />, {
    title: t('common:header.changeLanguage'),
    size: 'md',
  });

  return (
    <Button
      data-tour='language-switcher'
      onClick={openLanguageModal}
      variant='default'
      className={cn('flex', 'h-8', 'w-14', 'items-center', 'justify-center')}
      title={t('common:header.changeLanguage')}
    >
      <span className='font-light'>{currentLang.name}</span>
    </Button>
  );
};
