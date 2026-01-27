import { PhotoCamera } from '@mui/icons-material';
import {
  useChangeProfilePictureMutation,
  useGetUserProfileQuery,
} from 'app/store/api';
import { setUserProfile } from 'app/store/slices/userSlice';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { cn } from 'shared/lib/cn';
import { ImageUploadModal } from 'shared/ui/components/ImageUploader';
import { useLocalization } from 'widgets/hooks';
import { useAppDispatch, useAppSelector } from 'widgets/hooks/redux';
import { useModalActions } from 'widgets/hooks/useModalActions';
import { PrivateHeader } from 'widgets/ui';
import { ImageViewerModal } from '../../../profile/ui/components/ImageViewerModal';
import { settingsSections } from '../../models/variants';

export const Settings: React.FC = () => {
  const { t } = useLocalization();
  const { profile } = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();
  const { openModalFromTrigger } = useModalActions();
  const [avatarVersion, setAvatarVersion] = useState<number | undefined>(
    undefined
  );

  const getUserId = useCallback((): string => {
    return profile?.id || '';
  }, [profile?.id]);

  const [changeProfilePicture] = useChangeProfilePictureMutation();
  const { data: userProfileResponse, refetch: refetchProfile } =
    useGetUserProfileQuery(getUserId(), { skip: !getUserId() });

  useEffect(() => {
    if (userProfileResponse?.data) {
      dispatch(setUserProfile(userProfileResponse.data));
    }
  }, [userProfileResponse, dispatch]);

  const handleOpenImage = openModalFromTrigger(
    profile?.imgUrl ? (
      <ImageViewerModal
        imageUrl={`https://${profile.imgUrl}`}
        alt={profile.username || 'Аватар'}
      />
    ) : null,
    {
      title: ' ',
      size: 'lg',
      closeOnOverlayClick: true,
    }
  );

  const handleChangePhoto = openModalFromTrigger(
    <ImageUploadModal
      uploadFn={async (file: File) => {
        const res = await changeProfilePicture({
          file,
          userId: getUserId(),
        }).unwrap();
        return res?.data?.newImgUrl ?? '';
      }}
      onUploaded={(_url: string) => {
        setTimeout(() => {
          refetchProfile();
          setAvatarVersion(Date.now());
        }, 2000);
      }}
    />,
    {
      title: t('profile:changePhoto') || 'Изменить фото',
      size: 'md',
    }
  );

  const renderAvatar = useCallback(() => {
    if (profile?.imgUrl) {
      return (
        <img
          src={`https://${profile.imgUrl}${avatarVersion ? `?v=${avatarVersion}` : ''}`}
          alt={profile.username || 'Аватар'}
          className='h-full w-full object-cover'
        />
      );
    }

    const initial = profile?.username?.[0]?.toUpperCase() || 'U';
    return (
      <div
        className={cn(
          'flex h-full w-full items-center justify-center',
          'bg-gray-300 dark:bg-gray-600',
          'text-2xl font-semibold text-gray-600 dark:text-gray-300',
          'max-sm:text-xl'
        )}
      >
        {initial}
      </div>
    );
  }, [profile?.imgUrl, profile?.username, avatarVersion]);

  const renderSectionIcon = useCallback(
    (
      icon:
        | React.ComponentType<{ className?: string }>
        | (() => React.ReactElement)
    ) => {
      if (typeof icon === 'function' && icon.length === 0) {
        return (icon as () => React.ReactElement)();
      }

      const IconComponent = icon as React.ComponentType<{ className?: string }>;
      return <IconComponent className='h-5 w-5 max-sm:h-4 max-sm:w-4' />;
    },
    []
  );

  return (
    <div className={cn('bg-bg dark:bg-dark-bg min-h-screen')}>
      <PrivateHeader />

      <main className={cn('container mx-auto px-4 py-8')}>
        <div className='mx-auto max-w-4xl'>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className={cn('card mb-6 p-6', 'max-sm:rounded-lg max-sm:p-4')}
          >
            <div className='flex items-center gap-4'>
              <div className='relative'>
                <div
                  className={cn(
                    'flex h-16 w-16 items-center justify-center overflow-hidden rounded-full',
                    'max-sm:h-12 max-sm:w-12',
                    'cursor-pointer transition-opacity hover:opacity-80',
                    { 'cursor-default hover:opacity-100': !profile?.imgUrl }
                  )}
                  onClick={profile?.imgUrl ? handleOpenImage : undefined}
                  role={profile?.imgUrl ? 'button' : undefined}
                  tabIndex={profile?.imgUrl ? 0 : undefined}
                  onKeyDown={e => {
                    if (
                      profile?.imgUrl &&
                      (e.key === 'Enter' || e.key === ' ')
                    ) {
                      e.preventDefault();
                      handleOpenImage(e as any);
                    }
                  }}
                >
                  {renderAvatar()}
                </div>

                <button
                  onClick={handleChangePhoto}
                  className={cn(
                    'absolute right-0 bottom-0',
                    'h-6 w-6 rounded-full',
                    'bg-primary dark:bg-dark-primary',
                    'flex items-center justify-center text-white',
                    'transition-opacity hover:opacity-90'
                  )}
                  title={t('profile:changePhoto')}
                  aria-label={t('profile:changePhoto')}
                >
                  <PhotoCamera className='h-3.5 w-3.5' />
                </button>
              </div>

              <div className='flex-1'>
                <h2
                  className={cn(
                    'text-text dark:text-dark-text text-xl font-bold',
                    'max-sm:text-lg'
                  )}
                >
                  {profile?.username || t('profile:noUsername')}
                </h2>
                <p
                  className={cn(
                    'text-secondary dark:text-dark-secondary text-sm',
                    'max-sm:text-xs'
                  )}
                >
                  {profile?.email || t('profile:noEmail')}
                </p>
              </div>
            </div>
          </motion.div>

          <div className='space-y-4 max-sm:space-y-3'>
            {settingsSections.map((section, idx) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.26, delay: idx * 0.04 }}
                className={cn(
                  'card p-6 transition-shadow duration-200 hover:shadow-md',
                  'max-sm:rounded-lg max-sm:p-4'
                )}
              >
                <div className='flex items-center justify-between max-sm:flex-col max-sm:items-start max-sm:gap-3'>
                  <div className='flex flex-1 items-center gap-4 max-sm:w-full'>
                    <div
                      className={cn(
                        'rounded-lg p-2 max-sm:rounded-md max-sm:p-1.5',
                        'bg-primary/10 dark:bg-dark-primary/10',
                        'text-primary dark:text-dark-primary'
                      )}
                    >
                      {renderSectionIcon(section.icon)}
                    </div>

                    <div className='flex-1 max-sm:flex-initial'>
                      <h3 className='section-title'>
                        {t(`settings:sections.${section.id}.title`)}
                      </h3>
                      <p className={cn('muted-text text-sm max-sm:text-xs')}>
                        {t(`settings:sections.${section.id}.description`)}
                      </p>
                    </div>
                  </div>

                  <div
                    className={cn(
                      'settings-action',
                      'max-sm:flex max-sm:w-full max-sm:justify-end'
                    )}
                  >
                    {section.action}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
