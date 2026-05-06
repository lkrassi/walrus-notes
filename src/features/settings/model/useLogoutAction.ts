import { useDrafts, useTabs, useUser } from '@/entities';
import { apiSlice } from '@/shared/api';
import { useAppDispatch } from '@/widgets/hooks';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useLogoutAction = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { resetProfile } = useUser();
  const { clear: clearTabsState } = useTabs();
  const { clear: clearDraftsState } = useDrafts();

  const handleLogout = useCallback(() => {
    resetProfile();
    clearTabsState();
    clearDraftsState();
    dispatch(apiSlice.util.resetApiState());
    navigate('/auth');
  }, [clearDraftsState, clearTabsState, dispatch, navigate, resetProfile]);

  return { handleLogout };
};
