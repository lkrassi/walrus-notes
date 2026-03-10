import { useUser } from '@/entities';
import { cn } from '@/shared/lib/core';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const ProfileButton: FC = () => {
  const { profile } = useUser();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleOpenProfile = () => {
    navigate('/profile');
  };

  const displayName = profile?.username || 'User';
  const firstLetter = displayName.charAt(0).toUpperCase();

  return (
    <button
      data-tour='profile'
      onClick={handleOpenProfile}
      className={cn(
        'flex',
        'w-full',
        'items-center',
        'gap-3',
        'rounded-lg',
        'px-3',
        'py-2',
        'transition-colors',
        'duration-150',
        'hover:bg-interactive-hover',
        'active:bg-interactive-active',
        'focus-visible:ring-ring',
        'focus-visible:ring-2',
        'text-foreground'
      )}
      title={t('profile:title')}
    >
      <div className={cn('overflow-hidden', 'rounded-full', 'h-10', 'w-10')}>
        {profile?.imgUrl ? (
          <img
            src={`https://${profile.imgUrl}`}
            alt='Аватар'
            className={cn('h-full', 'w-full', 'object-cover')}
          />
        ) : (
          <div
            className={cn(
              'flex',
              'h-full',
              'w-full',
              'items-center',
              'justify-center',
              'bg-surface-2',
              'font-semibold',
              'text-muted-foreground'
            )}
          >
            {firstLetter}
          </div>
        )}
      </div>
      <span
        className={cn(
          'flex-1',
          'text-left',
          'truncate',
          'text-sm',
          'font-medium'
        )}
      >
        {displayName}
      </span>
    </button>
  );
};
