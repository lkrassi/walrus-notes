import type { BaseResponse } from './api';

export type ChangeProfilePictureResponse = {
  data: {
    newImgUrl: string;
  };
  meta: {
    code: string;
    error: string;
    message: string;
    requestId: string;
  };
  pagination: {
    page: number;
    pages: number;
    perPage: number;
  };
};

export type UserProfile = {
  id: string;
  username: string;
  email: string;
  imgUrl: string;
  role: string;
  createdAt: string;
};

export type UserProfileResponse = BaseResponse<UserProfile>;
