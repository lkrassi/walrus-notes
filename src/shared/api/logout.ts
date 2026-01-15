import type { AppDispatch } from 'app/store';
import { apiSlice, clearDrafts, clearTabs, clearUserProfile } from 'app/store';

export const logout = (dispatch: AppDispatch) => {
  dispatch(clearUserProfile());
  dispatch(clearTabs());
  dispatch(clearDrafts());
  dispatch(apiSlice.util.resetApiState());
};
