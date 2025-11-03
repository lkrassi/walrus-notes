import React, { useEffect } from 'react';
import { Button } from 'shared/ui/components/Button';
import { useLocalization } from 'widgets/hooks';
import { useAppDispatch, useAppSelector } from 'widgets/hooks/redux';
import { useModalActions } from 'widgets/hooks/useModalActions';
import { useGetUserProfileQuery } from 'widgets/model/stores/api';
import { setUserProfile } from 'widgets/model/stores/slices/userSlice';
import { ChangeProfilePictureForm } from './ChangeProfilePictureForm';
import { ImageViewerModal } from './ImageViewerModal';

export const UserProfileModal: React.FC = () => {
  const { t } = useLocalization();
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector(state => state.user);
  const userId = localStorage.getItem('userId');
  const { data: userProfileData } = useGetUserProfileQuery(userId || '', {
    skip: !userId,
  });

  useEffect(() => {
    if (userProfileData?.data && !profile) {
      dispatch(setUserProfile(userProfileData.data));
    }
  }, [userProfileData, profile, dispatch]);

  const { openModalFromTrigger } = useModalActions();

  const handleChangePhoto = openModalFromTrigger(<ChangeProfilePictureForm />, {
    title: t('profile:changePhoto'),
    size: 'xl',
    closeOnOverlayClick: true,
  });

  const handleViewImage = profile?.imgUrl
    ? openModalFromTrigger(
        <ImageViewerModal
          imageUrl={`https://${profile.imgUrl}`}
          alt={t('profile:profileImage')}
        />,
        {
          title: ' ',
          size: 'full',
          closeOnOverlayClick: true,
          showCloseButton: true,
        }
      )
    : undefined;

  if (!profile) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-red-500'>{t('profile:profileNotFound')}</div>
      </div>
    );
  }

  return (
    <div className='space-y-6 p-6'>
      <div className='flex flex-col items-center space-y-4'>
        <div className='h-24 w-24 cursor-pointer overflow-hidden rounded-full'>
          {profile.imgUrl ? (
            <img
              src={`https://${profile.imgUrl}`}
              alt='Аватар'
              className='h-full w-full object-cover'
              onClick={handleViewImage}
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center bg-gray-300 text-2xl font-semibold text-gray-600 dark:bg-gray-600 dark:text-gray-300'>
              {profile.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <Button
          onClick={handleChangePhoto}
          variant='default'
          className='px-4 py-2'
        >
          {t('profile:changePhoto')}
        </Button>
      </div>

      <div className='space-y-4'>
        <div>
          <label className='text-text dark:text-dark-text mb-1 block text-sm font-medium'>
            {t('profile:username')}
          </label>
          <div className='text-text dark:text-dark-text rounded-md bg-gray-100 px-3 py-2 dark:bg-gray-800'>
            {profile.username}
          </div>
        </div>

        <div>
          <label className='text-text dark:text-dark-text mb-1 block text-sm font-medium'>
            {t('profile:email')}
          </label>
          <div className='text-text dark:text-dark-text rounded-md bg-gray-100 px-3 py-2 dark:bg-gray-800'>
            {profile.email}
          </div>
        </div>

        <div>
          <label className='text-text dark:text-dark-text mb-1 block text-sm font-medium'>
            {t('profile:role')}
          </label>
          <div className='text-text dark:text-dark-text rounded-md bg-gray-100 px-3 py-2 dark:bg-gray-800'>
            {profile.role}
          </div>
        </div>
      </div>
    </div>
  );
};
