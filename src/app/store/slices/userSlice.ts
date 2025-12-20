import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export interface UserProfileState {
  profile: {
    id: string;
    username: string;
    email: string;
    imgUrl: string;
    role: string;
    createdAt: string;
  } | null;
  accessToken: string | null;
}

const initialState: UserProfileState = {
  profile: null,
  accessToken: localStorage.getItem('accessToken'),
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserProfile: (
      state,
      action: PayloadAction<UserProfileState['profile']>
    ) => {
      state.profile = action.payload;
    },
    setAccessToken: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload;
    },
    updateUserAvatar: (state, action: PayloadAction<string>) => {
      if (state.profile) {
        state.profile.imgUrl = action.payload;
      }
    },
    clearUserProfile: state => {
      state.profile = null;
      state.accessToken = null;
    },
  },
});

export const {
  setUserProfile,
  setAccessToken,
  updateUserAvatar,
  clearUserProfile,
} = userSlice.actions;
export default userSlice.reducer;
