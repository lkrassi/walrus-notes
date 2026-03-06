import { createSlice } from '@reduxjs/toolkit';
import { shareApi } from '../api';

export interface PermissionsState {
  lastGeneratedLink: {
    linkId: string;
    fullUrl: string;
  } | null;
}

const initialState: PermissionsState = {
  lastGeneratedLink: null,
};

const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    resetGeneratedLink: state => {
      state.lastGeneratedLink = null;
    },
  },
  extraReducers: builder => {
    builder
      .addMatcher(
        shareApi.endpoints.generateLink.matchFulfilled,
        (state, action) => {
          state.lastGeneratedLink = action.payload;
        }
      )
      .addMatcher(shareApi.endpoints.generateLink.matchRejected, state => {
        state.lastGeneratedLink = null;
      });
  },
});

export const { resetGeneratedLink } = permissionsSlice.actions;
export const permissionsReducer = permissionsSlice.reducer;

export const selectLastGeneratedLink = (state: {
  permissions: PermissionsState;
}) => state.permissions.lastGeneratedLink;

export { useApplyLinkMutation, useGenerateLinkMutation } from '../api';
