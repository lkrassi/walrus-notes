import { useGetUserProfileQuery } from '@/entities';
import {
  clearUserProfile,
  setUserProfile,
  syncAuthFromStorage,
} from '@/entities/user';
import { useEffect, type ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from 'widgets/hooks/redux';

export const AuthSyncProvider = ({ children }: { children: ReactNode }) => {
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

  useEffect(() => {
    if (profileResponse?.data) {
      dispatch(setUserProfile(profileResponse.data));
    }
  }, [profileResponse, dispatch]);

  return <>{children}</>;
};
