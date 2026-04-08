import type { TabsState } from '@/entities/tab';
import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';

export const useAppDispatch = () => useDispatch();
type AppStateLike = {
  user: {
    accessToken?: string | null;
  };
  tabs: TabsState;
  api: unknown;
};

export const useAppSelector: TypedUseSelectorHook<AppStateLike> = useSelector;

export const useUser = () => {
  return useAppSelector(state => state.user);
};

export const useTabs = () => {
  return useAppSelector(state => state.tabs);
};
