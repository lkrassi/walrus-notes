import type { RootState } from '@/app/store';
import { type ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { AppRoutes } from './config';

type ProtectedRouteProps = {
  children: ReactElement;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { accessToken, refreshToken } = useSelector(
    (state: RootState) => state.user
  );
  const isAuthenticated = !!(accessToken && refreshToken);

  return isAuthenticated ? children : <Navigate to={AppRoutes.AUTH} replace />;
};
