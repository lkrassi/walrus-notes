import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enAuth from './locales/en/auth.json';
import enCommon from './locales/en/common.json';
import enCookies from './locales/en/cookies.json';
import enFileTree from './locales/en/fileTree.json';
import enFirst from './locales/en/first.json';
import enLayout from './locales/en/layout.json';
import enMain from './locales/en/main.json';
import enNotes from './locales/en/notes.json';
import enProfile from './locales/en/profile.json';
import enSettings from './locales/en/settings.json';
import enShare from './locales/en/share.json';
import ruAuth from './locales/ru/auth.json';
import ruCommon from './locales/ru/common.json';
import ruCookies from './locales/ru/cookies.json';
import ruFileTree from './locales/ru/fileTree.json';
import ruFirst from './locales/ru/first.json';
import ruLayout from './locales/ru/layout.json';
import ruMain from './locales/ru/main.json';
import ruNotes from './locales/ru/notes.json';
import ruProfile from './locales/ru/profile.json';
import ruSettings from './locales/ru/settings.json';
import ruShare from './locales/ru/share.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    main: enMain,
    fileTree: enFileTree,
    layout: enLayout,
    first: enFirst,
    cookies: enCookies,
    notes: enNotes,
    profile: enProfile,
    settings: enSettings,
    share: enShare,
  },
  ru: {
    common: ruCommon,
    auth: ruAuth,
    main: ruMain,
    fileTree: ruFileTree,
    layout: ruLayout,
    first: ruFirst,
    cookies: ruCookies,
    notes: ruNotes,
    profile: ruProfile,
    settings: ruSettings,
    share: ruShare,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'ru'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    debug:
      import.meta.env.DEV &&
      String(import.meta.env.VITE_I18N_DEBUG ?? '').toLowerCase() === 'true',
  });

export { i18n };
