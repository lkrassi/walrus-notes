import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enAuth from './locales/en/auth.json';
import enCommon from './locales/en/common.json';
import enMain from './locales/en/main.json';
import ruAuth from './locales/ru/auth.json';
import ruCommon from './locales/ru/common.json';
import ruMain from './locales/ru/main.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    main: enMain,
  },
  ru: {
    common: ruCommon,
    auth: ruAuth,
    main: ruMain,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ru',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    debug: process.env.NODE_ENV === 'development',
  });

export default i18n;
