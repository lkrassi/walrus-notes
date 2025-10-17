import React from 'react';
import { useAppSelector } from 'widgets/hooks/redux';
import { useModalContext } from 'widgets/ui/components/modal/ModalProvider';
import { UserProfileModal } from './UserProfileModal';

export const ProfileButton: React.FC = () => {
  const { profile } = useAppSelector(state => state.user);
  const { openModal } = useModalContext();

  const handleOpenProfile = () => {
    openModal(<UserProfileModal />, {
      title: 'Профиль',
      size: 'md',
      closeOnOverlayClick: true,
    });
  };

  return (
    <button
      data-tour='profile'
      onClick={handleOpenProfile}
      className='flex h-10 w-10 items-center justify-center overflow-hidden rounded-full'
      title='Открыть профиль'
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
