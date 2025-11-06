import { useGetUserProfileQuery } from 'app/store/api';
import { setUserProfile } from 'app/store/slices/userSlice';
import React, { useEffect } from 'react';
import cn from 'shared/lib/cn';
import { Button } from 'shared/ui/components/Button';
import { useLocalization } from 'widgets/hooks';
import { useAppDispatch, useAppSelector } from 'widgets/hooks/redux';
import { useModalActions } from 'widgets/hooks/useModalActions';
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
      <div className={cn('flex', 'items-center', 'justify-center', 'p-8')}>
        <div className={cn('text-red-500')}>{t('profile:profileNotFound')}</div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', 'p-6')}>
      <div className={cn('flex', 'flex-col', 'items-center', 'space-y-4')}>
        <div
          className={cn(
            'h-24',
            'w-24',
            'cursor-pointer',
            'overflow-hidden',
            'rounded-full'
          )}
        >
          {profile.imgUrl ? (
            <img
              src={`https://${profile.imgUrl}`}
              alt='Аватар'
              className={cn('h-full', 'w-full', 'object-cover')}
              onClick={handleViewImage}
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
                'text-2xl',
                'font-semibold',
                'text-gray-600',
                'dark:bg-gray-600',
                'dark:text-gray-300'
              )}
            >
              {profile.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <Button
          onClick={handleChangePhoto}
          variant='default'
          className={cn('btn')}
        >
          {t('profile:changePhoto')}
        </Button>
      </div>

      <div className={cn('space-y-4')}>
        <div>
          <label className={cn('tw-label')}>{t('profile:username')}</label>
          <div className={cn('field-box')}>{profile.username}</div>
        </div>

        <div>
          <label className={cn('tw-label')}>{t('profile:email')}</label>
          <div className={cn('field-box')}>{profile.email}</div>
        </div>

        <div>
          <label className={cn('tw-label')}>{t('profile:role')}</label>
          <div className={cn('field-box')}>{profile.role}</div>
        </div>
      </div>
    </div>
  );
};
