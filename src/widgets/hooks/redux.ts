import type { AppDispatch, RootState } from 'app/store';
import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useUser = () => {
  return useAppSelector(state => state.user);
};

export const useTabs = () => {
  return useAppSelector(state => state.tabs);
};
