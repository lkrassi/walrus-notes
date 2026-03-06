import type { RootState } from '@/app/store';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { cn } from 'shared/lib/cn';

export const ProfileButton: FC = () => {
  const { profile } = useSelector((state: RootState) => state.user);
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
        'hover:bg-gray-100',
        'dark:hover:bg-gray-800',
        'text-text',
        'dark:text-dark-text'
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
              'bg-gray-300',
              'font-semibold',
              'text-gray-600',
              'dark:bg-gray-600',
              'dark:text-gray-300'
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
