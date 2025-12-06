import { User } from 'lucide-react';
import { ProfileButton } from '../../profile';
import { HolidayToggle } from '../ui/components/HolidayToggle';

export const settingsSections = [
  {
    id: 'profile',
    title: 'Профиль',
    icon: User,
    description: 'Управление личными данными и аватаром',
    action: <ProfileButton />,
  },
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
];
