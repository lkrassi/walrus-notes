import { useTranslation } from 'react-i18next';

export const useLocalization = () => {
  const { t, i18n } = useTranslation();

  const currentLanguage = i18n.language;
  const isEnglish = currentLanguage === 'en';
  const isRussian = currentLanguage === 'ru';

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return {
    t,
    currentLanguage,
    isEnglish,
    isRussian,
    changeLanguage,
  };
};
