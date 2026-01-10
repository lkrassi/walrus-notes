import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PhotoCamera } from '@mui/icons-material';
import cn from 'shared/lib/cn';
import { useLocalization } from 'widgets/hooks';
import { useAppSelector } from 'widgets/hooks/redux';
import { useModalActions } from 'widgets/hooks/useModalActions';
import { PrivateHeader } from 'widgets/ui';
import { settingsSections } from '../../models/variants';
import { ImageViewerModal } from '../../../profile/ui/components/ImageViewerModal';
import ImageUploadModal from 'shared/ui/components/ImageUploader';
import { useChangeProfilePictureMutation } from 'app/store/api';
import { useGetUserProfileQuery } from 'app/store/api';
import { useAppDispatch } from 'widgets/hooks/redux';
import { setUserProfile } from 'app/store/slices/userSlice';
import { checkAuth } from 'shared/api/checkAuth';

export const Settings: React.FC = () => {
  const { t } = useLocalization();
  const { profile } = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();
  const { openModalFromTrigger } = useModalActions();
  const [avatarVersion, setAvatarVersion] = useState<number | undefined>(
    undefined
  );

  const handleOpenImage = openModalFromTrigger(
    <ImageViewerModal
      imageUrl={`https://${profile?.imgUrl}`}
      alt={profile?.username || 'Аватар'}
    />,
    {
      title: ' ',
      size: 'lg',
      closeOnOverlayClick: true,
    }
  );

  const [changeProfilePicture] = useChangeProfilePictureMutation();
  const userId =
    profile?.id || (checkAuth() ? localStorage.getItem('userId') || '' : '');
  const { data: userProfileResponse, refetch: refetchProfile } =
    useGetUserProfileQuery(userId, {
      skip: !userId,
    });

  useEffect(() => {
    if (userProfileResponse?.data) {
      dispatch(setUserProfile(userProfileResponse.data));
    }
  }, [userProfileResponse, dispatch]);

  const handleChangePhoto = openModalFromTrigger(
    <ImageUploadModal
      uploadFn={async (file: File) => {
        const res = await changeProfilePicture({ file, userId }).unwrap();
        const newUrl = res?.data?.newImgUrl ?? '';
        return newUrl;
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

  return (
    <div className={cn('bg-bg', 'dark:bg-dark-bg', 'min-h-screen')}>
      <PrivateHeader />

      <main className={cn('container', 'mx-auto', 'px-4', 'py-8')}>
        <div className={cn('mx-auto', 'max-w-4xl')}>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className={cn(
              'card',
              'p-6',
              'mb-6',
              'max-sm:rounded-lg',
              'max-sm:p-4'
            )}
          >
            <div className={cn('flex', 'items-center', 'gap-4')}>
              <div className={cn('relative')}>
                <div
                  className={cn(
                    'flex',
                    'h-16',
                    'w-16',
                    'items-center',
                    'justify-center',
                    'overflow-hidden',
                    'rounded-full',
                    'max-sm:h-12',
                    'max-sm:w-12',
                    'cursor-pointer',
                    'hover:opacity-80',
                    'transition-opacity'
                  )}
                  onClick={profile?.imgUrl ? handleOpenImage : undefined}
                  role={profile?.imgUrl ? 'button' : undefined}
                  tabIndex={profile?.imgUrl ? 0 : undefined}
                >
                  {profile?.imgUrl ? (
                    <img
                      src={`https://${profile.imgUrl}${avatarVersion ? `?v=${avatarVersion}` : ''}`}
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
                        'text-2xl',
                        'font-semibold',
                        'text-gray-600',
                        'dark:bg-gray-600',
                        'dark:text-gray-300',
                        'max-sm:text-xl'
                      )}
                    >
                      {profile?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleChangePhoto}
                  className={cn(
                    'absolute',
                    'bottom-0',
                    'right-0',
                    'h-6',
                    'w-6',
                    'rounded-full',
                    'bg-primary',
                    'dark:bg-dark-primary',
                    'flex',
                    'items-center',
                    'justify-center',
                    'text-white',
                    'hover:opacity-90',
                    'transition-opacity'
                  )}
                  title={t('profile:changePhoto')}
                >
                  <PhotoCamera className={cn('h-3.5', 'w-3.5')} />
                </button>
              </div>
              <div className={cn('flex-1')}>
                <h2
                  className={cn(
                    'text-xl',
                    'font-bold',
                    'text-text',
                    'dark:text-dark-text',
                    'max-sm:text-lg'
                  )}
                >
                  {profile?.username || t('profile:noUsername')}
                </h2>
                <p
                  className={cn(
                    'text-sm',
                    'text-secondary',
                    'dark:text-dark-secondary',
                    'max-sm:text-xs'
                  )}
                >
                  {profile?.email || t('profile:noEmail')}
                </p>
              </div>
            </div>
          </motion.div>

          <div className={cn('space-y-4', 'max-sm:space-y-3')}>
            {settingsSections.map((section, idx) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.26, delay: idx * 0.04 }}
                className={cn(
                  'card',
                  'p-6',
                  'transition-shadow duration-200 hover:shadow-md',
                  'max-sm:rounded-lg max-sm:p-4'
                )}
              >
                <div
                  className={cn(
                    'flex',
                    'items-center',
                    'justify-between',
                    'max-sm:flex-col',
                    'max-sm:items-start',
                    'max-sm:gap-3'
                  )}
                >
                  <div
                    className={cn('flex', 'flex-1', 'items-center', 'gap-4')}
                  >
                    <div>
                      <div
                        className={cn(
                          'bg-primary/10',
                          'dark:bg-dark-primary/10',
                          'text-primary',
                          'dark:text-dark-primary',
                          'rounded-lg',
                          'p-2',
                          'max-sm:rounded-md',
                          'max-sm:p-1.5'
                        )}
                      >
                        {typeof section.icon === 'function'
                          ? (section.icon as () => React.ReactNode)()
                          : React.createElement(section.icon, {
                              className: cn(
                                'h-5',
                                'w-5',
                                'max-sm:h-4',
                                'max-sm:w-4'
                              ),
                            })}
                      </div>
                    </div>
                    <div className={cn('flex-1', 'max-sm:flex-initial')}>
                      <h3 className={cn('section-title')}>
                        {t(`settings:sections.${section.id}.title`)}
                      </h3>
                      <p
                        className={cn(
                          'muted-text',
                          'text-sm',
                          'max-sm:text-xs'
                        )}
                      >
                        {t(`settings:sections.${section.id}.description`)}
                      </p>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'max-sm:flex',
                      'max-sm:w-full',
                      'max-sm:justify-end'
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

export default Settings;
