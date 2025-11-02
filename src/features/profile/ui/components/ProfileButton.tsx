import React from 'react';
import { useLocalization } from 'widgets';
import { useAppSelector } from 'widgets/hooks/redux';
import { useModalActions } from 'widgets/hooks/useModalActions';
import { UserProfileModal } from './UserProfileModal';

export const ProfileButton: React.FC = () => {
  const { profile } = useAppSelector(state => state.user);
  const { createAnimatedOpener } = useModalActions();
  const { t } = useLocalization();

  const handleOpenProfile = createAnimatedOpener(<UserProfileModal />, {
    title: t('profile:title') || 'Профиль',
    size: 'md',
    closeOnOverlayClick: true,
  });

  return (
    <button
      data-tour='profile'
      onClick={handleOpenProfile}
      className='flex h-10 w-10 items-center justify-center overflow-hidden rounded-full'
      title={t('profile:title')}
    >
      {profile?.imgUrl ? (
        <img
          src={`https://${profile.imgUrl}`}
          alt='Аватар'
          className='h-full w-full object-cover'
        />
      ) : (
        <div className='flex h-full w-full items-center justify-center bg-gray-300 font-semibold text-gray-600 dark:bg-gray-600 dark:text-gray-300'>
          U
        </div>
      )}
    </button>
  );
};
