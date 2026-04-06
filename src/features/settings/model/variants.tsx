export type SettingsSectionActionType =
  | 'theme'
  | 'language'
  | 'exportData'
  | 'importData'
  | 'permissionsDashboard'
  | 'logout';

export type SettingsSection = {
  id: SettingsSectionActionType;
  title: string;
  description: string;
  actionType: SettingsSectionActionType;
};

export const settingsSections: SettingsSection[] = [
  {
    id: 'theme',
    title: 'Тема',
    description: 'Переключение между светлой и тёмной темой',
    actionType: 'theme',
  },
  {
    id: 'language',
    title: 'Язык',
    description: 'Выберите язык интерфейса',
    actionType: 'language',
  },
  {
    id: 'exportData',
    title: 'Экспорт данных',
    description: 'Выгрузить данные аккаунта',
    actionType: 'exportData',
  },
  {
    id: 'importData',
    title: 'Импорт данных',
    description: 'Импортировать данные аккаунта',
    actionType: 'importData',
  },
  {
    id: 'permissionsDashboard',
    title: 'Дашборд доступов',
    description: 'Перейти в управление правами доступа',
    actionType: 'permissionsDashboard',
  },
  {
    id: 'logout',
    title: 'Выход',
    description: 'Выйти из аккаунта',
    actionType: 'logout',
  },
];
