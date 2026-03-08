import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearUserProfile, setTokens, setUserProfile } from './slice';

type UserStateLike = {
  user: {
    profile?: {
      id?: string;
      username?: string;
      email?: string;
      imgUrl?: string;
    } | null;
  };
};

export const useUser = () => {
  const dispatch = useDispatch();
  const profile = useSelector((state: UserStateLike) => state.user.profile);
  const userId = profile?.id ?? '';

  const updateProfile = useCallback(
    (nextProfile: NonNullable<UserStateLike['user']['profile']>) => {
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
