import { Moon, Languages, LogOut } from 'lucide-react';
import { HolidayToggle } from '../ui/components/HolidayToggle';
import { ThemeSwitcher } from 'widgets/ui/components/theme/ThemeSwitcher';
import { LanguageSwitcher } from 'widgets/ui/components/LanguageSwitcher';
import { LogoutButton } from 'widgets/ui/components/logout/LogoutButton';

export const settingsSections = [
  {
    id: 'holiday',
    title: 'Новогодние украшения',
    icon: () => (
      <svg
        width='16'
        height='16'
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M12 2L13.545 8.455L20 10.001L13.545 11.546L12 18L10.455 11.546L4 10.001L10.455 8.455L12 2Z'
          fill='currentColor'
        />
      </svg>
    ),
    description: 'Включить снег и гирлянду в интерфейсе',
    action: <HolidayToggle />,
    isHoliday: true,
  },
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
    id: 'logout',
    title: 'Выход',
    icon: LogOut,
    description: 'Выйти из аккаунта',
    action: <LogoutButton />,
  },
];
