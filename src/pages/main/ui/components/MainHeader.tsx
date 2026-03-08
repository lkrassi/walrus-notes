import { useGetUserProfileQuery, useUser } from '@/entities';
import { PrivateHeader } from '@/widgets/ui';
import { useEffect } from 'react';

export const MainHeader = () => {
  const { userId, updateProfile } = useUser();
  const { data: userProfileResponse } = useGetUserProfileQuery(userId, {
    skip: !userId,
  });

  useEffect(() => {
    if (userProfileResponse?.data) {
      updateProfile(userProfileResponse.data);
    }
  }, [userProfileResponse, updateProfile]);

  return <PrivateHeader />;
};
