import { apiSlice } from './apiSlice';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  imgUrl: string;
  role: string;
}

interface GetUserProfileResponse {
  data: UserProfile;
  meta: {
    code: string;
    message: string;
    error: string;
    requestId: string;
  };
}

interface ChangeProfilePictureRequest {
  file: File;
  userId: string;
}

interface ChangeProfilePictureResponse {
  data: {
    newImgUrl: string;
  };
  meta: {
    code: string;
    message: string;
    error: string;
    requestId: string;
  };
}

export const profileApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getUserProfile: builder.query<GetUserProfileResponse, string>({
      query: userId => `/user/profile/${userId}`,
      providesTags: ['Profile'],
    }),

    changeProfilePicture: builder.mutation<
      ChangeProfilePictureResponse,
      ChangeProfilePictureRequest
    >({
      query: body => {
        const formData = new FormData();
        formData.append('file', body.file);
        formData.append('userId', body.userId);

        return {
          url: '/user/picture',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const { useGetUserProfileQuery, useChangeProfilePictureMutation } =
  profileApi;
