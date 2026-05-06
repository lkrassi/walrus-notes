import { useAppSelector } from '@/widgets/hooks';
import { type ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { AppRoutes } from './routes';

type ProtectedRouteProps = {
  children: ReactElement;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { accessToken, refreshToken } = useAppSelector(state => state.user);
  const isAuthenticated = !!(accessToken && refreshToken);

  return isAuthenticated ? children : <Navigate to={AppRoutes.AUTH} replace />;
};
