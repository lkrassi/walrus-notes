import { Bell, HelpCircle, Palette, Shield, User } from 'lucide-react';
import { Button } from 'shared/ui/components/Button';
import { ProfileButton } from '../../profile';

export const settingsSections = [
  {
    title: 'Профиль',
    icon: User,
    description: 'Управление личными данными и аватаром',
    action: <ProfileButton />,
  },
  {
    title: 'Внешний вид',
    icon: Palette,
    description: 'Тема, шрифты и настройки отображения',
    action: (
      <Button variant='default' className='h-10 w-30'>
        Настроить
      </Button>
    ),
  },
  {
    title: 'Уведомления',
    icon: Bell,
    description: 'Настройки оповещений и email-рассылок',
    action: (
      <Button variant='default' className='h-10 w-30'>
        Управлять
      </Button>
    ),
  },
  {
    title: 'Безопасность',
    icon: Shield,
    description: 'Пароль, двухфакторная аутентификация',
    action: (
      <Button variant='default' className='h-10 w-30'>
        Защитить
      </Button>
    ),
  },
  {
    title: 'Помощь',
    icon: HelpCircle,
    description: 'Документация и поддержка',
    action: (
      <Button variant='default' className='h-10 w-30'>
        Перейти
      </Button>
    ),
  },
];
