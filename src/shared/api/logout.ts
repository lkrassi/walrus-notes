import { clearDrafts, clearTabs, clearUserProfile } from '@/entities';
import type { AppDispatch } from 'app/store';
import { apiSlice } from './apiSlice';

export const logout = (dispatch: AppDispatch) => {
  dispatch(clearUserProfile());
  dispatch(clearTabs());
  dispatch(clearDrafts());
  dispatch(apiSlice.util.resetApiState());
};
