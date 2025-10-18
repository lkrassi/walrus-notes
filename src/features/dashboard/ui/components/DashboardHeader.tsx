import { useEffect } from 'react';
import { useAppDispatch } from 'widgets/hooks/redux';
import { useGetUserProfileQuery } from 'widgets/model/stores/api';
import { setUserProfile } from 'widgets/model/stores/slices/userSlice';
import { checkAuth } from 'shared/api/checkAuth';
import { PrivateHeader } from 'widgets/ui';

export const DashboardHeader = () => {
  const dispatch = useAppDispatch();

  const userId = checkAuth() ? localStorage.getItem('userId') : null;
  const { data: userProfileResponse } = useGetUserProfileQuery(userId || '', {
    skip: !userId,
  });

  useEffect(() => {
    if (userProfileResponse?.data) {
      dispatch(setUserProfile(userProfileResponse.data));
    }
  }, [userProfileResponse, dispatch]);

  return <PrivateHeader />;
};
