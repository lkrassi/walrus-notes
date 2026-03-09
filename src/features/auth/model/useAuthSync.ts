import { useGetUserProfileQuery } from '@/entities';
import { addNotification } from '@/entities/notification';
import {
  clearUserProfile,
  setUserProfile,
  syncAuthFromStorage,
} from '@/entities/user';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

type RootStateLike = {
  user: {
    accessToken: string | null;
    refreshToken: string | null;
    profile: {
      id?: string;
    } | null;
  };
};

const normalizeStoredUserId = (value: string | null) => {
  if (!value || value === 'undefined' || value === 'null') {
    return null;
  }

  return value;
};

export const useAuthSync = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const invalidSessionHandledRef = useRef(false);
  const { accessToken, refreshToken, profile } = useSelector(
    (state: RootStateLike) => state.user
  );

  const storedUserId =
    typeof window !== 'undefined'
      ? normalizeStoredUserId(localStorage.getItem('userId'))
      : null;
  const shouldFetchProfile = Boolean(
    accessToken && refreshToken && storedUserId && !profile
  );

  const {
    data: profileResponse,
    error: profileError,
    isFetching: isProfileFetching,
  } = useGetUserProfileQuery(storedUserId || '', {
    skip: !shouldFetchProfile,
  });

  useEffect(() => {
    dispatch(syncAuthFromStorage());

    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === 'accessToken' ||
        e.key === 'refreshToken' ||
        e.key === 'userId'
      ) {
        const nextAccessToken = localStorage.getItem('accessToken');
        const nextRefreshToken = localStorage.getItem('refreshToken');

        if (!nextAccessToken || !nextRefreshToken) {
          dispatch(setUserProfile(null));
          dispatch(syncAuthFromStorage());
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

      if (profileResponse.data.id) {
        localStorage.setItem('userId', profileResponse.data.id);
      }
    }
  }, [profileResponse, dispatch]);

  useEffect(() => {
    if (!accessToken || !refreshToken) {
      invalidSessionHandledRef.current = false;
      return;
    }

    const hasStoredUserId = Boolean(storedUserId);
    const hasProfileId = Boolean(profile?.id);
    const profileFetchFailed =
      shouldFetchProfile && !isProfileFetching && Boolean(profileError);

    if (!hasStoredUserId && !hasProfileId) {
      return;
    }

    if (!invalidSessionHandledRef.current && profileFetchFailed) {
      invalidSessionHandledRef.current = true;

      dispatch(clearUserProfile());
      dispatch(
        addNotification({
          type: 'warning',
          title: 'Сессия истекла',
          message: 'Пожалуйста, войдите снова.',
          origin: 'auth-sync',
          duration: 4000,
        })
      );

      navigate('/auth', { replace: true });
    }
  }, [
    accessToken,
    refreshToken,
    storedUserId,
    profile,
    shouldFetchProfile,
    isProfileFetching,
    profileError,
    dispatch,
    navigate,
  ]);
};
