import type { AppDispatch, RootState } from '@/app/store';
import { useGetUserProfileQuery } from '@/entities';
import { setUserProfile } from '@/entities/user';
import { PrivateHeader } from '@/shared/ui/components/header/PrivateHeader';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export const MainHeader = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: RootState) => state.user);

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
