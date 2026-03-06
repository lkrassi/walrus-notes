import { useGetUserProfileQuery } from '@/entities';
import { setUserProfile } from '@/entities/user';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/widgets/hooks/redux';
import { PrivateHeader } from '@/widgets/ui';

export const MainHeader = () => {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector(state => state.user);

  const userId = profile?.id || '';
  const { data: userProfileResponse } = useGetUserProfileQuery(userId, {
    skip: !userId,
  });

  useEffect(() => {
    if (userProfileResponse?.data) {
      dispatch(setUserProfile(userProfileResponse.data));
    }
  }, [userProfileResponse, dispatch]);

  return <PrivateHeader />;
};
