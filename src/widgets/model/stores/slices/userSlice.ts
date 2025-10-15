import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface UserProfileState {
  profile: {
    id: string;
    username: string;
    email: string;
    imgUrl: string;
    role: string;
    createdAt: string;
  } | null;
}

const initialState: UserProfileState = {
  profile: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserProfile: (state, action: PayloadAction<UserProfileState['profile']>) => {
      state.profile = action.payload;
    },
    updateUserAvatar: (state, action: PayloadAction<string>) => {
      if (state.profile) {
        state.profile.imgUrl = action.payload;
      }
    },
    clearUserProfile: (state) => {
      state.profile = null;
    },
  },
});

export const { setUserProfile, updateUserAvatar, clearUserProfile } = userSlice.actions;
export default userSlice.reducer;
