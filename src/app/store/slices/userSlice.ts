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
  refreshToken: string | null;
  isAuthChecked: boolean;
}

const initialState: UserProfileState = {
  profile: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthChecked: false,
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
      if (action.payload) {
        localStorage.setItem('accessToken', action.payload);
      } else {
        localStorage.removeItem('accessToken');
      }
    },
    setRefreshToken: (state, action: PayloadAction<string | null>) => {
      state.refreshToken = action.payload;
      if (action.payload) {
        localStorage.setItem('refreshToken', action.payload);
      } else {
        localStorage.removeItem('refreshToken');
      }
    },
    setTokens: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
    syncAuthFromStorage: state => {
      state.accessToken = localStorage.getItem('accessToken');
      state.refreshToken = localStorage.getItem('refreshToken');
      state.isAuthChecked = true;
    },
    updateUserAvatar: (state, action: PayloadAction<string>) => {
      if (state.profile) {
        state.profile.imgUrl = action.payload;
      }
    },
    clearUserProfile: state => {
      state.profile = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
    },
  },
});

export const {
  setUserProfile,
  setAccessToken,
  setRefreshToken,
  setTokens,
  syncAuthFromStorage,
  updateUserAvatar,
  clearUserProfile,
} = userSlice.actions;

// Селектор для проверки аутентификации
export const selectIsAuthenticated = (state: { user: UserProfileState }) => {
  return !!(state.user.accessToken && state.user.refreshToken);
};

export default userSlice.reducer;
