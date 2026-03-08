import {
  useChangeProfilePictureMutation,
  useGetUserProfileQuery,
  useUser,
} from '@/entities';
import { cn } from '@/shared/lib/core';
import { useModalActions } from '@/shared/lib/react';
import { ImageUploadModal } from '@/shared/ui';
import {
  useCallback,
  useEffect,
  useState,
  type ComponentType,
  type ReactElement,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import type { SettingsSectionActionType } from './variants';

export const useSettings = () => {
  const { t } = useTranslation();
  const { profile, userId, updateProfile } = useUser();
  const { openModalFromTrigger } = useModalActions();
  const [avatarVersion, setAvatarVersion] = useState<number | undefined>(
    undefined
  );

  const [changeProfilePicture] = useChangeProfilePictureMutation();
  const { data: userProfileResponse, refetch: refetchProfile } =
    useGetUserProfileQuery(userId, { skip: !userId });

  useEffect(() => {
    if (userProfileResponse?.data) {
      updateProfile(userProfileResponse.data);
    }
  }, [userProfileResponse, updateProfile]);

  const openImageViewer = (
    imageViewer: ReactElement | null,
    event: ReactMouseEvent<HTMLElement>
  ) => {
    if (!imageViewer) return;

    const handler = openModalFromTrigger(imageViewer, {
      title: ' ',
      size: 'lg',
      closeOnOverlayClick: true,
    });

    handler(event);
  };

  const openChangePhotoModal = openModalFromTrigger(
    <ImageUploadModal
      uploadFn={async (file: File) => {
        const res = await changeProfilePicture({
          file,
          userId,
        }).unwrap();
        return res?.data?.newImgUrl ?? '';
      }}
      onUploaded={() => {
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
    (icon: ComponentType<{ className?: string }> | (() => ReactElement)) => {
      if (typeof icon === 'function' && icon.length === 0) {
        return (icon as () => ReactElement)();
      }

      const IconComponent = icon as ComponentType<{ className?: string }>;
      return <IconComponent className='h-5 w-5 max-sm:h-4 max-sm:w-4' />;
    },
    []
  );

  const getSectionActionType = (actionType: SettingsSectionActionType) => {
    return actionType;
  };

  return {
    profile,
    renderAvatar,
    renderSectionIcon,
    getSectionActionType,
    openImageViewer,
    openChangePhotoModal,
  };
};
