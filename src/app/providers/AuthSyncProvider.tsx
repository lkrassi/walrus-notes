import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'widgets/hooks/redux';
import {
  syncAuthFromStorage,
  clearUserProfile,
  setUserProfile,
} from 'app/store/slices/userSlice';
import { useGetUserProfileQuery } from 'app/store/api';

export const AuthSyncProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const dispatch = useAppDispatch();
  const { accessToken, refreshToken, profile } = useAppSelector(
    state => state.user
  );
  const storedUserId =
    typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const shouldFetchProfile = Boolean(
    accessToken && refreshToken && storedUserId && !profile
  );
  const { data: profileResponse } = useGetUserProfileQuery(storedUserId || '', {
    skip: !shouldFetchProfile,
  });

  useEffect(() => {
    dispatch(syncAuthFromStorage());

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken' || e.key === 'refreshToken') {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (!accessToken || !refreshToken) {
          dispatch(clearUserProfile());
        } else {
          dispatch(syncAuthFromStorage());
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [dispatch]);

  // Sync fetched profile into redux
  useEffect(() => {
    if (profileResponse?.data) {
      dispatch(setUserProfile(profileResponse.data));
    }
  }, [profileResponse, dispatch]);

  return <>{children}</>;
};
