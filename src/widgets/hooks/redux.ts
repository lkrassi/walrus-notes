import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';

type AppStateLike = {
  user: unknown;
  tabs: unknown;
  api: unknown;
};

export const useAppDispatch = () => useDispatch();
export const useAppSelector: TypedUseSelectorHook<AppStateLike> = useSelector;

export const useUser = () => {
  return useAppSelector(state => state.user);
};

export const useTabs = () => {
  return useAppSelector(state => state.tabs);
};
