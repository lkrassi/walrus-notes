import {
  Download,
  Languages,
  LogOut,
  Moon,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import type { ComponentType, ReactElement } from 'react';

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
  icon: ComponentType<{ className?: string }> | (() => ReactElement);
};

export const settingsSections: SettingsSection[] = [
  // {
  //   id: 'holiday',
  //   title: 'Новогодние украшения',
  //   icon: () => (
  //     <svg
  //       width='16'
  //       height='16'
  //       viewBox='0 0 24 24'
  //       fill='none'
  //       xmlns='http://www.w3.org/2000/svg'
  //     >
  //       <path
  //         d='M12 2L13.545 8.455L20 10.001L13.545 11.546L12 18L10.455 11.546L4 10.001L10.455 8.455L12 2Z'
  //         fill='currentColor'
  //       / >
  //     </svg>
  //   ),
  //   description: 'Включить снег и гирлянду в интерфейсе',
  //   action: <HolidayToggle />,
  //   isHoliday: true,
  // },
  {
    id: 'theme',
    title: 'Тема',
    icon: Moon,
    description: 'Переключение между светлой и тёмной темой',
    actionType: 'theme',
  },
  {
    id: 'language',
    title: 'Язык',
    icon: Languages,
    description: 'Выберите язык интерфейса',
    actionType: 'language',
  },
  {
    id: 'exportData',
    title: 'Экспорт данных',
    icon: Download,
    description: 'Выгрузить данные аккаунта',
    actionType: 'exportData',
  },
  {
    id: 'importData',
    title: 'Импорт данных',
    icon: Upload,
    description: 'Импортировать данные аккаунта',
    actionType: 'importData',
  },
  {
    id: 'permissionsDashboard',
    title: 'Дашборд доступов',
    icon: ShieldCheck,
    description: 'Перейти в управление правами доступа',
    actionType: 'permissionsDashboard',
  },
  {
    id: 'logout',
    title: 'Выход',
    icon: LogOut,
    description: 'Выйти из аккаунта',
    actionType: 'logout',
  },
];
