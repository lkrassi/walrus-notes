import { useEffect } from 'react';
import { checkAuth } from 'shared/api/checkAuth';
import { useLocalStorageString } from 'widgets/hooks';
import { useAppDispatch } from 'widgets/hooks/redux';
import { useGetUserProfileQuery } from 'widgets/model/stores/api/profileApi';
import { setUserProfile } from 'widgets/model/stores/slices/userSlice';

export const useDashboardUser = () => {
  const dispatch = useAppDispatch();
  const [userId] = useLocalStorageString('userId', '');
  const hasAuth = checkAuth();

  const { data: userProfileResponse } = useGetUserProfileQuery(userId, {
    skip: !hasAuth || !userId,
  });

  useEffect(() => {
    if (userProfileResponse?.data) {
      dispatch(setUserProfile(userProfileResponse.data));
    }
  }, [userProfileResponse, dispatch]);

  return {
    userId,
    hasAuth,
    userProfile: userProfileResponse?.data as any,
  };
};
