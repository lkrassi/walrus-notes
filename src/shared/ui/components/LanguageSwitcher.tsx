import { useModalActions, useModalContentContext } from '@/app/providers/modal';
import { cn } from '@/shared/lib';
import { Button } from '@/shared/ui';
import { RussianFlagIcon } from '@/shared/ui/icons/RussianFlagIcon';
import { UKFlagIcon } from '@/shared/ui/icons/UKFlagIcon';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const { openModalFromTrigger } = useModalActions();

  const handleLanguageSelect = async (
    langCode: string,
    closeModal: () => void
  ) => {
    await i18n.changeLanguage(langCode);
    closeModal();
  };

  const LanguageModal: FC = () => {
    const { closeModal } = useModalContentContext();

    return (
      <div className={cn('flex', 'p-2', 'justify-center', 'gap-3')}>
        {LANGUAGES.map(language => (
          <Button
            key={language.code}
            onClick={() => {
              void handleLanguageSelect(language.code, closeModal);
            }}
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
    mobileContentPadding: '16px',
  });

  return (
    <Button
      data-tour='language-switcher'
      onClick={openLanguageModal}
      variant='default'
      className={cn('px-2', 'py-2', 'sm:px-3')}
      title={t('common:header.changeLanguage')}
    >
      <span className={cn('text-base', 'font-semibold')}>
        {currentLang.name}
      </span>
    </Button>
  );
};
