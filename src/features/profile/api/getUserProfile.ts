import type { AppDispatch } from 'widgets/model/stores';
import type { UserProfileResponse } from 'shared/model/types/profile';
import { startLoading, stopLoading } from 'widgets/model/stores/slices/loaderSlice';

export const getUserProfile = async (userId: string, dispatch: AppDispatch): Promise<UserProfileResponse> => {
  dispatch(startLoading());
  try {
    const response = await fetch(
      `https://${import.meta.env.VITE_BASE_URL}/wn/api/v1/user/profile/${userId}`,
      {
        method: 'GET',
        headers: {
          'X-Request-Id': crypto.randomUUID(),
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.meta.message || 'Failed to get user profile');
    }

    return response.json();
  } finally {
    dispatch(stopLoading());
  }
};
