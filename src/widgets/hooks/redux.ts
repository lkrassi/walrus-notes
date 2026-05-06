import type { TabsState } from '@/entities/tab';
import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';

export const useAppDispatch = () => useDispatch();
type AppStateLike = {
  notifications: unknown;
  permissions: unknown;
  user: {
    accessToken?: string | null;
    refreshToken?: string | null;
    profile?: { id?: string } | null;
  };
  tabs: TabsState;
  drafts?: Record<string, string>;
  api: unknown;
};

export const useAppSelector: TypedUseSelectorHook<AppStateLike> = useSelector;

export const useUser = () => {
  return useAppSelector(state => state.user);
};

export const useTabs = () => {
  return useAppSelector(state => state.tabs);
};
