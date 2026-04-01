import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { UserProfileState } from './slice';
import { clearUserProfile, setTokens, setUserProfile } from './slice';

type UserStateLike = {
  user: UserProfileState;
};

export const useUser = () => {
  const dispatch = useDispatch();
  const profile = useSelector((state: UserStateLike) => state.user.profile);
  const userId = profile?.id ?? '';

  const updateProfile = useCallback(
    (nextProfile: NonNullable<UserProfileState['profile']>) => {
      dispatch(setUserProfile(nextProfile));
    },
    [dispatch]
  );

  const resetProfile = useCallback(() => {
    dispatch(clearUserProfile());
  }, [dispatch]);

  const setAuthTokens = useCallback(
    (tokens: { accessToken: string; refreshToken: string }) => {
      dispatch(setTokens(tokens));
    },
    [dispatch]
  );

  return {
    profile,
    userId,
    setAuthTokens,
    updateProfile,
    resetProfile,
  };
};
