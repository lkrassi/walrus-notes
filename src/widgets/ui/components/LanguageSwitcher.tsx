import React, { useEffect, useRef, useState } from 'react';

import { ChevronDown } from 'lucide-react';
import { Button } from 'shared';

import { useLocalization } from 'widgets/hooks/useLocalization';

import { RussianFlagIcon } from 'public/RussianFlagIcon';
import { UKFlagIcon } from 'public/UKFlagIcon';

export const LanguageSwitcher: React.FC = () => {
  const { currentLanguage, changeLanguage } = useLocalization();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [effectiveLanguage, setEffectiveLanguage] = useState('ru');

  const languages = [
    {
      code: 'en',
      name: 'EN',
      flag: <UKFlagIcon className='h-20 w-20' />,
    },
    {
      code: 'ru',
      name: 'RU',
      flag: <RussianFlagIcon className='h-20 w-20' />,
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
    <div className='relative' ref={dropdownRef}>
      <Button
        data-tour="language-switcher"
        onClick={() => setIsOpen(!isOpen)}
        variant='default'
        className='group flex h-10 w-5 items-center justify-center gap-2 px-8 py-5'
      >
        <div className='flex flex-col items-center justify-center'>
          <div className='flex h-4 w-6 items-center justify-center'>
            {currentLang.name}
          </div>
          <div className='relative'>
            <ChevronDown
              className={`h-4 w-4 transition-all duration-300 ${
                isOpen
                  ? 'translate-y-0.5 rotate-180'
                  : 'group-hover:translate-y-0.5'
              }`}
            />
          </div>
        </div>
      </Button>

      <div
        className={`absolute top-full right-0 z-60 mt-2 transition-all duration-300 ease-out ${
          isOpen
            ? 'translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none -translate-y-4 scale-95 opacity-0'
        } `}
      >
        <div className='flex flex-col gap-y-5 py-1'>
          {languages.map(language => (
            <Button
              key={language.code}
              onClick={() => handleLanguageSelect(language.code)}
              variant={effectiveLanguage === language.code ? 'default' : 'disabled'}
              className={`flex h-10 w-5 items-center justify-center px-8 py-5 transition-all duration-200 ${
                isOpen ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
              }`}
            >
              <div className='flex h-4 w-6 items-center justify-center'>
                {language.flag}
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
