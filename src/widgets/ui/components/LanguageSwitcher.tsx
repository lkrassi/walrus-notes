import React, { useEffect, useRef, useState } from 'react';
import cn from 'shared/lib/cn';

import { ChevronDown } from 'lucide-react';
import { Button } from 'shared';

import { useLocalization } from 'widgets/hooks/useLocalization';

import { RussianFlagIcon } from 'public/RussianFlagIcon';
import { UKFlagIcon } from 'public/UKFlagIcon';

export const LanguageSwitcher: React.FC = () => {
  const { changeLanguage } = useLocalization();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [effectiveLanguage, setEffectiveLanguage] = useState('ru');

  const { t } = useLocalization();

  const languages = [
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

  useEffect(() => {
    const savedLanguage = localStorage.getItem('i18nextLng');

    if (savedLanguage && languages.find(lang => lang.code === savedLanguage)) {
      setEffectiveLanguage(savedLanguage);
    } else {
      setEffectiveLanguage('ru');
      if (!savedLanguage) {
        changeLanguage('ru');
      }
    }
  }, []);

  const currentLang =
    languages.find(lang => lang.code === effectiveLanguage) || languages[0];

  const handleLanguageSelect = (langCode: string) => {
    changeLanguage(langCode);
    setEffectiveLanguage(langCode);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative')} ref={dropdownRef}>
      <Button
        data-tour='language-switcher'
        onClick={() => setIsOpen(!isOpen)}
        variant='default'
        className={cn(
          'flex',
          'h-10',
          'w-30',
          'items-center',
          'justify-center',
          'px-7',
          'py-2'
        )}
        title={t('common:header.changeLanguage')}
      >
        <div
          className={cn('flex', 'flex-col', 'items-center', 'justify-center')}
        >
          <div
            className={cn(
              'flex',
              'h-4',
              'w-6',
              'items-center',
              'justify-center'
            )}
          >
            {currentLang.name}
          </div>
          <div className={cn('relative')}>
            <ChevronDown
              className={cn(
                'h-4',
                'w-4',
                'transition-all',
                'duration-300',
                isOpen ? 'translate-y-0.5 rotate-180' : ''
              )}
            />
          </div>
        </div>
      </Button>

      <div
        className={cn(
          'absolute',
          'top-full',
          'right-0',
          'z-2',
          'mt-2',
          'transition-all',
          'duration-300',
          'ease-out',
          isOpen
            ? 'translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none -translate-y-4 scale-95 opacity-0'
        )}
      >
        <div className={cn('flex', 'flex-col', 'gap-y-5', 'py-1')}>
          {languages.map(language => (
            <Button
              key={language.code}
              onClick={() => handleLanguageSelect(language.code)}
              variant={
                effectiveLanguage === language.code ? 'default' : 'disabled'
              }
              className={cn(
                isOpen
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-2 opacity-0',
                'flex',
                'h-10',
                'w-30',
                'items-center',
                'justify-center',
                'px-7',
                'py-2'
              )}
            >
              <div
                className={cn(
                  'flex',
                  'h-4',
                  'w-6',
                  'items-center',
                  'justify-center'
                )}
              >
                {language.flag}
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
