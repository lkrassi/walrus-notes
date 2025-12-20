import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enAuth from './locales/en/auth.json';
import enCommon from './locales/en/common.json';
import enDashboard from './locales/en/dashboard.json';
import enFileTree from './locales/en/fileTree.json';
import enLayout from './locales/en/layout.json';
import enMain from './locales/en/main.json';
import enNotes from './locales/en/notes.json';
import enProfile from './locales/en/profile.json';
import enSettings from './locales/en/settings.json';
import ruAuth from './locales/ru/auth.json';
import ruCommon from './locales/ru/common.json';
import ruDashboard from './locales/ru/dashboard.json';
import ruFileTree from './locales/ru/fileTree.json';
import ruLayout from './locales/ru/layout.json';
import ruMain from './locales/ru/main.json';
import ruNotes from './locales/ru/notes.json';
import ruProfile from './locales/ru/profile.json';
import ruSettings from './locales/ru/settings.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
    fileTree: enFileTree,
    layout: enLayout,
    main: enMain,
    notes: enNotes,
    profile: enProfile,
    settings: enSettings,
  },
  ru: {
    common: ruCommon,
    auth: ruAuth,
    dashboard: ruDashboard,
    fileTree: ruFileTree,
    layout: ruLayout,
    main: ruMain,
    notes: ruNotes,
    profile: ruProfile,
    settings: ruSettings,
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
