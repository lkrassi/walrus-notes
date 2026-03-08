import { useGetUserProfileQuery } from '@/entities';
import {
  clearUserProfile,
  setUserProfile,
  syncAuthFromStorage,
} from '@/entities/user';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

type RootStateLike = {
  user: {
    accessToken: string | null;
    refreshToken: string | null;
    profile: unknown | null;
  };
};

export const useAuthSync = () => {
  const dispatch = useDispatch();
  const { accessToken, refreshToken, profile } = useSelector(
    (state: RootStateLike) => state.user
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
        const nextAccessToken = localStorage.getItem('accessToken');
        const nextRefreshToken = localStorage.getItem('refreshToken');

        if (!nextAccessToken || !nextRefreshToken) {
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
};
