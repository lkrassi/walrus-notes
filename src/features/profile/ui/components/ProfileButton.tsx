import { useUser } from '@/entities';
import { cn } from '@/shared/lib/core';
import { useMemo, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

export const ProfileButton: FC = () => {
  const { profile } = useUser();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleOpenProfile = () => {
    navigate('/profile', { state: { from: location.pathname } });
  };

  const displayName = profile?.username || 'User';

  const normalizedAvatarUrl = useMemo(() => {
    if (!profile?.imgUrl) return '';
    return `https://${profile.imgUrl}`;
  }, [profile?.imgUrl]);

  return (
    <button
      data-tour='profile'
      onClick={handleOpenProfile}
      className={cn(
        'flex',
        'w-full',
        'items-center',
        'gap-3',
        'px-3',
        'py-2',
        'active:bg-interactive-active',
        'focus-visible:ring-ring',
        'focus-visible:ring-2',
        'text-foreground',
        'hover:bg-muted-foreground/10',
        'rounded-lg'
      )}
      title={t('profile:title')}
    >
      <div className={cn('overflow-hidden', 'rounded-full', 'h-10', 'w-10')}>
        {normalizedAvatarUrl ? (
          <img
            src={normalizedAvatarUrl}
            alt='Аватар'
            className={cn('h-full', 'w-full', 'object-cover')}
            loading='lazy'
            decoding='async'
          />
        ) : (
          <div className={cn('bg-muted h-full w-full')} />
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
