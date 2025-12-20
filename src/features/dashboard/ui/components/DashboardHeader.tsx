import { useGetUserProfileQuery } from 'app/store/api';
import { setUserProfile } from 'app/store/slices/userSlice';
import { useEffect } from 'react';
import { checkAuth } from 'shared/api/checkAuth';
import { useAppDispatch } from 'widgets/hooks/redux';
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
