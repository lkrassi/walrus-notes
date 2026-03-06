import { ExportDataButton } from '@/features/settings/ui/components/ExportDataButton';
import { ImportDataButton } from '@/features/settings/ui/components/ImportDataButton';
import { LanguageSwitcher } from '@/features/settings/ui/components/LanguageSwitcher';
import { LogoutButton } from '@/features/settings/ui/components/LogoutButton';
import { OpenPermissionsDashboardButton } from '@/features/settings/ui/components/OpenPermissionsDashboardButton';
import { ThemeSwitcher } from '@/features/settings/ui/components/ThemeSwitcher';
import {
  Download,
  Languages,
  LogOut,
  Moon,
  ShieldCheck,
  Upload,
} from 'lucide-react';

export const settingsSections = [
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
    action: <ThemeSwitcher />,
  },
  {
    id: 'language',
    title: 'Язык',
    icon: Languages,
    description: 'Выберите язык интерфейса',
    action: <LanguageSwitcher />,
  },
  {
    id: 'exportData',
    title: 'Экспорт данных',
    icon: Download,
    description: 'Выгрузить данные аккаунта',
    action: <ExportDataButton />,
  },
  {
    id: 'importData',
    title: 'Импорт данных',
    icon: Upload,
    description: 'Импортировать данные аккаунта',
    action: <ImportDataButton />,
  },
  {
    id: 'permissionsDashboard',
    title: 'Дашборд доступов',
    icon: ShieldCheck,
    description: 'Перейти в управление правами доступа',
    action: <OpenPermissionsDashboardButton />,
  },
  {
    id: 'logout',
    title: 'Выход',
    icon: LogOut,
    description: 'Выйти из аккаунта',
    action: <LogoutButton />,
  },
];
